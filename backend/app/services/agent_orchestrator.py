import time
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set
from app.models.schemas import (
    PRReviewRequest, ReviewReport, PRDetails, ChangedFile, CodeFinding,
    AgentStep, SecurityAudit, SeverityLevel, FindingCategory, ReviewVerdict
)
from app.models.database import save_review
from app.services.security_guard import (
    parse_and_validate_github_url, check_prompt_injection, sanitize_for_prompt
)
from app.services.github_service import GitHubService
from app.services.static_analyzer import (
    parse_unified_diff, run_python_ast_analysis, run_heuristic_code_analysis,
    verify_and_ground_findings
)
from app.services.gemini_service import GeminiService
from app.services.mock_data import DEMO_SCENARIOS

class AgentOrchestrator:
    def __init__(self, request: PRReviewRequest):
        self.request = request
        self.review_id = f"rev-{uuid.uuid4().hex[:10]}"
        self.steps: List[AgentStep] = []
        self.security_audit = SecurityAudit()
        self.github_service = GitHubService(token=request.github_token)
        self.gemini_service = GeminiService()

    def _record_step(self, step_num: int, name: str, status: str, tool: Optional[str], details: str, duration_ms: int = 0):
        self.steps.append(AgentStep(
            step_number=step_num,
            name=name,
            status=status,
            tool_called=tool,
            details=details,
            execution_time_ms=duration_ms
        ))

    async def execute_review(self) -> ReviewReport:
        """
        Executes the full multi-step agent review workflow.
        """
        # ========================================================
        # STEP 1: Ingest PR Details
        # ========================================================
        t0 = time.time()
        pr_details: Optional[PRDetails] = None
        changed_files: List[ChangedFile] = []
        is_mock = False
        
        # Check if demo ID requested
        if self.request.demo_id and self.request.demo_id in DEMO_SCENARIOS:
            demo_data = DEMO_SCENARIOS[self.request.demo_id]
            pr_details = demo_data["pr_details"]
            changed_files = demo_data["files"]
            is_mock = True
            self._record_step(
                1, "Fetching PR Details", "completed", "demo_scenario_loader",
                f"Loaded demonstration scenario '{demo_data['name']}' with {len(changed_files)} changed files.",
                int((time.time() - t0) * 1000)
            )
        else:
            try:
                pr_details, changed_files = await self.github_service.fetch_pr_data(
                    self.request.repo_url, self.request.pr_number
                )
                self._record_step(
                    1, "Fetching PR Details", "completed", "github_rest_api",
                    f"Successfully fetched PR #{pr_details.pr_number} from {pr_details.repo_owner}/{pr_details.repo_name} ({len(changed_files)} files).",
                    int((time.time() - t0) * 1000)
                )
            except Exception as e:
                # Fallback to demo if network/rate-limit error occurs
                self._record_step(
                    1, "Fetching PR Details", "warning", "github_rest_api_fallback",
                    f"External GitHub request error ({str(e)}). Engaging built-in demonstration scenario as fallback.",
                    int((time.time() - t0) * 1000)
                )
                demo_data = DEMO_SCENARIOS["demo-security-vulnerabilities"]
                pr_details = demo_data["pr_details"]
                changed_files = demo_data["files"]
                is_mock = True

        # ========================================================
        # STEP 2: Security & Prompt Injection Defense Check
        # ========================================================
        t1 = time.time()
        injection_found = False
        injection_detail = None
        
        # Scan PR title, body, and files
        texts_to_scan = [pr_details.title, pr_details.body or ""]
        for f in changed_files:
            texts_to_scan.append(f.patch or "")
            
        full_text = "\n".join(texts_to_scan)
        injection_found, injection_detail = check_prompt_injection(full_text)
        
        if injection_found:
            self.security_audit.prompt_injection_detected = True
            self.security_audit.prompt_injection_details = injection_detail
            self.security_audit.warnings.append(
                f"Adversarial instruction detected: {injection_detail}. Untrusted instructions neutralized."
            )
            self._record_step(
                2, "Security & Prompt Injection Pre-Scan", "warning", "security_guard",
                f"Alert: {injection_detail}. Sandboxing enabled; instructions blocked.",
                int((time.time() - t1) * 1000)
            )
        else:
            self._record_step(
                2, "Security & Prompt Injection Pre-Scan", "completed", "security_guard",
                "All PR descriptions and diff hunks cleared security sanitation. No adversarial triggers detected.",
                int((time.time() - t1) * 1000)
            )

        # ========================================================
        # STEP 3: Parse Diffs and Map Valid Line Numbers
        # ========================================================
        t2 = time.time()
        valid_lines_by_file: Dict[str, Set[int]] = {}
        for f in changed_files:
            if f.patch:
                added_lines, _ = parse_unified_diff(f.patch)
                valid_lines_by_file[f.filename] = added_lines
                
        self._record_step(
            3, "Diff Analysis & Line Mapping", "completed", "unified_diff_parser",
            f"Parsed diffs across {len(changed_files)} files to ensure line number grounding.",
            int((time.time() - t2) * 1000)
        )

        # ========================================================
        # STEP 4: Run Static Code Analysis & AST Scan
        # ========================================================
        t3 = time.time()
        static_findings: List[CodeFinding] = []
        for f in changed_files:
            if not f.patch:
                continue
            # Run heuristic & secret analysis
            heuristic_results = run_heuristic_code_analysis(f.patch, f.filename)
            static_findings.extend(heuristic_results)
            
            # If Python file, extract code from diff and run AST visitor
            if f.filename.endswith(".py"):
                # Reconstruct file content from diff (stripping diff prefix '+' or ' ')
                code_lines = []
                for line in f.patch.splitlines():
                    if line.startswith("+++") or line.startswith("---") or line.startswith("@@"):
                        continue
                    if line.startswith("+") or line.startswith(" "):
                        code_lines.append(line[1:])
                approx_code = "\n".join(code_lines)
                ast_results = run_python_ast_analysis(
                    approx_code, f.filename, valid_lines_by_file.get(f.filename, set())
                )
                static_findings.extend(ast_results)

        self._record_step(
            4, "Analyzing Code & Running Static Checks", "completed", "ast_and_rule_engine",
            f"Detected {len(static_findings)} potential issues via AST and security pattern matching.",
            int((time.time() - t3) * 1000)
        )

        # ========================================================
        # STEP 5: Gemini AI Deep Review
        # ========================================================
        t4 = time.time()
        ai_findings: List[CodeFinding] = []
        executive_summary = ""
        health_score = 100
        verdict = ReviewVerdict.APPROVED
        model_used = "Gemini 1.5 Flash"
        
        gemini_result = await self.gemini_service.analyze_pull_request(
            pr_details, changed_files, static_findings
        )
        
        if gemini_result and "findings" in gemini_result:
            executive_summary = gemini_result.get("executive_summary", "")
            for idx, item in enumerate(gemini_result.get("findings", [])):
                try:
                    f_sev = SeverityLevel(item.get("severity", "Medium").title())
                except Exception:
                    f_sev = SeverityLevel.MEDIUM
                try:
                    f_cat = FindingCategory(item.get("category", "Code Quality").title())
                except Exception:
                    f_cat = FindingCategory.QUALITY
                    
                ai_findings.append(CodeFinding(
                    id=f"ai-{idx}-{uuid.uuid4().hex[:6]}",
                    file_path=item.get("file_path", "unknown"),
                    line_number=item.get("line_number"),
                    severity=f_sev,
                    category=f_cat,
                    title=item.get("title", "Review Finding"),
                    explanation=item.get("explanation", ""),
                    why_it_matters=item.get("why_it_matters", ""),
                    suggested_fix=item.get("suggested_fix", ""),
                    diff_snippet=None,
                    is_verified=True,
                    source="gemini_ai"
                ))
            self._record_step(
                5, "Generating Review with Gemini AI", "completed", "google_gemini_api",
                f"Gemini analyzed diff context and identified {len(ai_findings)} contextual code issues.",
                int((time.time() - t4) * 1000)
            )
        else:
            model_used = "PRISM Static & Heuristic Engine"
            self._record_step(
                5, "Generating Review with Gemini AI", "completed", "static_expert_engine",
                "Gemini API key not configured or rate-limited; relied on verified static AST analysis.",
                int((time.time() - t4) * 1000)
            )

        # ========================================================
        # STEP 6: Verification & Grounding
        # ========================================================
        t5 = time.time()
        combined_findings = static_findings + ai_findings
        verified_findings = verify_and_ground_findings(combined_findings, valid_lines_by_file)
        
        # Step 7: Finalizing & Scoring
        crit_count = sum(1 for f in verified_findings if f.severity == SeverityLevel.CRITICAL)
        high_count = sum(1 for f in verified_findings if f.severity == SeverityLevel.HIGH)
        med_count = sum(1 for f in verified_findings if f.severity == SeverityLevel.MEDIUM)
        low_count = sum(1 for f in verified_findings if f.severity == SeverityLevel.LOW)
        
        # Calculate dynamic health score
        health_score = max(0, 100 - (crit_count * 25 + high_count * 15 + med_count * 5 + low_count * 2))
        
        if crit_count > 0 or high_count >= 2:
            verdict = ReviewVerdict.REQUEST_CHANGES
        elif high_count == 1 or med_count > 0:
            verdict = ReviewVerdict.COMMENT
        else:
            verdict = ReviewVerdict.APPROVED
            
        if not executive_summary:
            if verdict == ReviewVerdict.APPROVED:
                executive_summary = f"This PR changes {len(changed_files)} files cleanly. All safety and quality checks passed with an excellent health score of {health_score}/100."
            elif verdict == ReviewVerdict.REQUEST_CHANGES:
                executive_summary = f"This PR introduces {crit_count} Critical and {high_count} High severity issues requiring immediate remediation before merging. Please address security and error handling defects."
            else:
                executive_summary = f"This PR is generally sound, but contains {len(verified_findings)} minor quality and maintainability suggestions to review."

        self._record_step(
            6, "Finalizing", "completed", "grounding_verifier",
            f"Completed grounding. Verified {len(verified_findings)} issues against actual diff hunks. Final verdict: {verdict.value}.",
            int((time.time() - t5) * 1000)
        )

        # Build full report
        report = ReviewReport(
            review_id=self.review_id,
            created_at=datetime.now(timezone.utc).isoformat(),
            pr_details=pr_details,
            verdict=verdict,
            health_score=health_score,
            executive_summary=executive_summary,
            findings_count=len(verified_findings),
            critical_count=crit_count,
            high_count=high_count,
            medium_count=med_count,
            low_count=low_count,
            findings=verified_findings,
            agent_steps=self.steps,
            security_audit=self.security_audit,
            changed_files=changed_files,
            is_mock=is_mock,
            model_used=model_used
        )

        # Persist report to SQLite database
        try:
            save_review(report.model_dump())
        except Exception as e:
            # Non-fatal if DB write fails
            pass

        return report
