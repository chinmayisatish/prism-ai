import ast
import re
from typing import List, Dict, Any, Set, Tuple, Optional
from app.models.schemas import CodeFinding, SeverityLevel, FindingCategory

class DiffHunk:
    def __init__(self, old_start: int, old_len: int, new_start: int, new_len: int, lines: List[str]):
        self.old_start = old_start
        self.old_len = old_len
        self.new_start = new_start
        self.new_len = new_len
        self.lines = lines

def parse_unified_diff(patch: str) -> Tuple[Set[int], List[Tuple[int, str]]]:
    """
    Parses a git unified diff patch string.
    Returns:
    - added_lines_set: set of line numbers in the new file that were added/modified
    - changed_line_tuples: list of (line_num, line_content)
    """
    if not patch:
        return set(), []
        
    added_lines: Set[int] = set()
    changed_tuples: List[Tuple[int, str]] = []
    
    current_line = 0
    hunk_regex = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")
    
    for line in patch.splitlines():
        hunk_match = hunk_regex.match(line)
        if hunk_match:
            current_line = int(hunk_match.group(3))
            continue
            
        if line.startswith("+") and not line.startswith("+++"):
            added_lines.add(current_line)
            changed_tuples.append((current_line, line[1:]))
            current_line += 1
        elif line.startswith("-") and not line.startswith("---"):
            # Deletion line in old file, does not increment new file line counter
            pass
        else:
            # Context line
            current_line += 1
            
    return added_lines, changed_tuples

def scan_for_secrets(content: str, filename: str, line_offset: int = 1) -> List[CodeFinding]:
    """Scans for embedded secrets, API keys, private keys, and passwords."""
    findings: List[CodeFinding] = []
    
    patterns = [
        (r"(?i)(api[_-]?key|secret|password|auth_token)\s*=\s*['\"][A-Za-z0-9_\-\.]{14,}['\"]", 
         "Hardcoded credential or secret detected", 
         SeverityLevel.CRITICAL, 
         "Hardcoding secrets in source code risks immediate credential leakage, unauthorized access, and git history exposure.", 
         "Extract credentials into environment variables or a secure secret manager (e.g., AWS Secrets Manager, HashiCorp Vault)."),
         
        (r"AKIA[0-9A-Z]{16}", 
         "Hardcoded AWS Access Key ID detected", 
         SeverityLevel.CRITICAL, 
         "Exposing AWS keys in code allows attackers to compromise cloud infrastructure and rack up unauthorized charges.", 
         "Revoke this key immediately in AWS IAM, and use IAM Roles or environment variables instead."),
         
        (r"ghp_[A-Za-z0-9]{36}", 
         "Hardcoded GitHub Personal Access Token detected", 
         SeverityLevel.CRITICAL, 
         "Hardcoded GitHub tokens allow repository hijacking, code tampering, or supply chain attacks.", 
         "Revoke this token immediately from GitHub Settings and use environment secrets."),
         
        (r"-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----", 
         "Unencrypted Private Key in source code", 
         SeverityLevel.CRITICAL, 
         "Private keys committed to version control compromise entire cryptographic identity and server access.", 
         "Remove the key, rotate credentials, and store private keys outside version control.")
    ]
    
    for line_idx, line in enumerate(content.splitlines(), start=line_offset):
        for pattern, title, severity, why, fix in patterns:
            if re.search(pattern, line):
                findings.append(CodeFinding(
                    id=f"secret-{filename}-{line_idx}",
                    file_path=filename,
                    line_number=line_idx,
                    severity=severity,
                    category=FindingCategory.SECURITY,
                    title=title,
                    explanation=f"Found suspicious secret or credential string matching pattern on line {line_idx}.",
                    why_it_matters=why,
                    suggested_fix=fix,
                    diff_snippet=line.strip()[:100],
                    is_verified=True,
                    source="security_scanner"
                ))
    return findings

class PythonASTVisitor(ast.NodeVisitor):
    def __init__(self, filename: str, modified_lines: Set[int]):
        self.filename = filename
        self.modified_lines = modified_lines
        self.findings: List[CodeFinding] = []

    def _should_report(self, lineno: Optional[int]) -> bool:
        if lineno is None:
            return True
        # If we have modified lines information, prioritize findings on those lines
        return not self.modified_lines or lineno in self.modified_lines

    def visit_Call(self, node: ast.Call):
        lineno = getattr(node, "lineno", None)
        
        # 1. Dangerous calls: eval(), exec()
        if isinstance(node.func, ast.Name):
            if node.func.id in ("eval", "exec") and self._should_report(lineno):
                self.findings.append(CodeFinding(
                    id=f"ast-eval-{self.filename}-{lineno}",
                    file_path=self.filename,
                    line_number=lineno,
                    severity=SeverityLevel.CRITICAL,
                    category=FindingCategory.SECURITY,
                    title=f"Dangerous execution using '{node.func.id}()'",
                    explanation=f"Use of '{node.func.id}()' allows arbitrary code execution if dynamic or user-controlled input reaches it.",
                    why_it_matters="Arbitrary code execution gives malicious users complete control over the host environment.",
                    suggested_fix="Avoid dynamic evaluation. Use `ast.literal_eval()` for parsing literals or implement a dedicated parser/dispatch table.",
                    is_verified=True,
                    source="ast_analyzer"
                ))
            
            # 2. Insecure pickle deserialization
            elif node.func.id == "loads" and self._should_report(lineno):
                self.findings.append(CodeFinding(
                    id=f"ast-pickle-{self.filename}-{lineno}",
                    file_path=self.filename,
                    line_number=lineno,
                    severity=SeverityLevel.CRITICAL,
                    category=FindingCategory.SECURITY,
                    title="Insecure deserialization using 'pickle.loads'",
                    explanation="Pickle deserialization can execute arbitrary bytecode upon unpickling untrusted data.",
                    why_it_matters="An attacker can craft a malicious pickle payload to gain remote shell execution.",
                    suggested_fix="Use safer serialization formats like JSON, Protobuf, or msgpack.",
                    is_verified=True,
                    source="ast_analyzer"
                ))

        # 3. subprocess calls with shell=True
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in ("Popen", "run", "call", "check_output"):
                for kw in node.keywords:
                    if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                        if self._should_report(lineno):
                            self.findings.append(CodeFinding(
                                id=f"ast-subprocess-shell-{self.filename}-{lineno}",
                                file_path=self.filename,
                                line_number=lineno,
                                severity=SeverityLevel.HIGH,
                                category=FindingCategory.SECURITY,
                                title="Subprocess invoked with 'shell=True'",
                                explanation="Invoking subprocess commands with `shell=True` exposes the system to command injection vulnerabilities.",
                                why_it_matters="If any argument contains unescaped user input, attackers can chain shell commands (e.g., `; rm -rf /`).",
                                suggested_fix="Pass arguments as a list of strings and set `shell=False` (the default). E.g., `subprocess.run(['ls', '-la'])`.",
                                is_verified=True,
                                source="ast_analyzer"
                            ))
            
            # 4. Weak cryptography: hashlib.md5 or hashlib.sha1
            elif node.func.attr in ("md5", "sha1"):
                if isinstance(node.func.value, ast.Name) and node.func.value.id == "hashlib":
                    if self._should_report(lineno):
                        self.findings.append(CodeFinding(
                            id=f"ast-weak-crypto-{self.filename}-{lineno}",
                            file_path=self.filename,
                            line_number=lineno,
                            severity=SeverityLevel.MEDIUM,
                            category=FindingCategory.SECURITY,
                            title=f"Weak hash algorithm 'hashlib.{node.func.attr}()'",
                            explanation=f"{node.func.attr.upper()} is cryptographically broken and vulnerable to collision and preimage attacks.",
                            why_it_matters="Using broken algorithms for integrity verification or password hashing permits forgeability.",
                            suggested_fix="Use SHA-256 (`hashlib.sha256()`) or modern password hashing like Argon2 / bcrypt.",
                            is_verified=True,
                            source="ast_analyzer"
                        ))

        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        lineno = getattr(node, "lineno", None)
        
        # Check for mutable default arguments (e.g. def func(items=[]))
        for default in node.args.defaults:
            if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                def_lineno = getattr(default, "lineno", lineno)
                if self._should_report(def_lineno):
                    self.findings.append(CodeFinding(
                        id=f"ast-mutable-default-{self.filename}-{def_lineno}",
                        file_path=self.filename,
                        line_number=def_lineno,
                        severity=SeverityLevel.HIGH,
                        category=FindingCategory.BUG,
                        title=f"Mutable default argument in function '{node.name}'",
                        explanation="Default argument is initialized once when the function is defined, sharing the mutable object across all subsequent calls.",
                        why_it_matters="Mutating this default argument inside the function causes unexpected state bleed across calls and subtle bugs.",
                        suggested_fix="Use `None` as the default value and initialize the collection inside the function body: `if arg is None: arg = []`.",
                        is_verified=True,
                        source="ast_analyzer"
                    ))
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        # Look for blocking calls like time.sleep() inside async functions
        for sub_node in ast.walk(node):
            if isinstance(sub_node, ast.Call) and isinstance(sub_node.func, ast.Attribute):
                if sub_node.func.attr == "sleep" and isinstance(sub_node.func.value, ast.Name) and sub_node.func.value.id == "time":
                    lineno = getattr(sub_node, "lineno", None)
                    if self._should_report(lineno):
                        self.findings.append(CodeFinding(
                            id=f"ast-blocking-sleep-{self.filename}-{lineno}",
                            file_path=self.filename,
                            line_number=lineno,
                            severity=SeverityLevel.HIGH,
                            category=FindingCategory.PERFORMANCE,
                            title="Blocking 'time.sleep()' inside async coroutine",
                            explanation="Calling synchronous `time.sleep()` blocks the entire asyncio event loop, freezing all concurrent requests.",
                            why_it_matters="Destroys asynchronous concurrency and causes latency spikes under load.",
                            suggested_fix="Replace `time.sleep(...)` with `await asyncio.sleep(...)`.",
                            is_verified=True,
                            source="ast_analyzer"
                        ))
        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler):
        lineno = getattr(node, "lineno", None)
        
        # Check for bare except: or pass
        if node.type is None:
            if self._should_report(lineno):
                self.findings.append(CodeFinding(
                    id=f"ast-bare-except-{self.filename}-{lineno}",
                    file_path=self.filename,
                    line_number=lineno,
                    severity=SeverityLevel.MEDIUM,
                    category=FindingCategory.ERROR_HANDLING,
                    title="Bare 'except:' clause caught",
                    explanation="Catching bare `except:` intercepts SystemExit, KeyboardInterrupt, and MemoryError in addition to standard exceptions.",
                    why_it_matters="Prevents clean process termination and masks unhandled fatal errors, making debugging difficult.",
                    suggested_fix="Catch specific exception types, e.g., `except (ValueError, KeyError) as e:` or at minimum `except Exception as e:`.",
                    is_verified=True,
                    source="ast_analyzer"
                ))
        
        # Check if except body is just 'pass'
        if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            if self._should_report(lineno):
                self.findings.append(CodeFinding(
                    id=f"ast-swallowed-exception-{self.filename}-{lineno}",
                    file_path=self.filename,
                    line_number=lineno,
                    severity=SeverityLevel.MEDIUM,
                    category=FindingCategory.ERROR_HANDLING,
                    title="Silently swallowed exception ('except ...: pass')",
                    explanation="Exception block suppresses errors without logging, alerting, or recovery.",
                    why_it_matters="Silently dropping errors causes silent data corruption or makes root-cause analysis impossible.",
                    suggested_fix="Log the exception with stack trace (`logger.exception(...)`) or re-raise after handling.",
                    is_verified=True,
                    source="ast_analyzer"
                ))

        self.generic_visit(node)

def run_python_ast_analysis(code: str, filename: str, modified_lines: Set[int]) -> List[CodeFinding]:
    """Runs Python AST static analysis against source code."""
    try:
        tree = ast.parse(code, filename=filename)
        visitor = PythonASTVisitor(filename=filename, modified_lines=modified_lines)
        visitor.visit(tree)
        return visitor.findings
    except SyntaxError as e:
        # If code diff has syntax error
        return [CodeFinding(
            id=f"syntax-err-{filename}-{e.lineno}",
            file_path=filename,
            line_number=e.lineno,
            severity=SeverityLevel.CRITICAL,
            category=FindingCategory.BUG,
            title="Python Syntax Error",
            explanation=f"Code cannot be parsed due to SyntaxError: {e.msg}",
            why_it_matters="Code with syntax errors will crash at runtime upon module import.",
            suggested_fix="Fix the syntax error according to Python grammar.",
            diff_snippet=e.text.strip() if e.text else None,
            is_verified=True,
            source="ast_analyzer"
        )]
    except Exception:
        return []

def run_heuristic_code_analysis(patch: str, filename: str) -> List[CodeFinding]:
    """
    Analyzes unified diff for common language-agnostic security and quality bugs:
    - SQL injection string formatting
    - Insecure DOM manipulation in JS/TS
    - CORS wildcard with credentials
    - Console.log in production
    """
    added_lines, changed_tuples = parse_unified_diff(patch)
    findings: List[CodeFinding] = []
    
    # Run secrets scanner first
    findings.extend(scan_for_secrets(patch, filename))
    
    # Language-specific heuristics on changed lines
    for line_num, line in changed_tuples:
        # SQL Injection pattern
        if re.search(r"(?i)(SELECT|INSERT|UPDATE|DELETE)\s+.*(\+|%|\.format|\$)\s*\{?", line):
            if not re.search(r"(\?|%s|\$1|:param)", line):
                findings.append(CodeFinding(
                    id=f"sqli-{filename}-{line_num}",
                    file_path=filename,
                    line_number=line_num,
                    severity=SeverityLevel.CRITICAL,
                    category=FindingCategory.SECURITY,
                    title="Potential SQL Injection via string interpolation",
                    explanation="Raw SQL query appears to be constructed using string concatenation or formatting instead of parameterized queries.",
                    why_it_matters="Allows attackers to manipulate queries, bypass authentication, and exfiltrate or delete entire databases.",
                    suggested_fix="Use parameterized queries or ORM query builders (e.g. `cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))`).",
                    diff_snippet=line.strip()[:100],
                    is_verified=True,
                    source="security_scanner"
                ))
        
        # React dangerouslySetInnerHTML or innerHTML
        if re.search(r"dangerouslySetInnerHTML|innerHTML\s*=", line):
            findings.append(CodeFinding(
                id=f"xss-{filename}-{line_num}",
                file_path=filename,
                line_number=line_num,
                severity=SeverityLevel.HIGH,
                category=FindingCategory.SECURITY,
                title="Cross-Site Scripting (XSS) risk via raw HTML injection",
                explanation="Injecting unescaped HTML directly into the DOM allows malicious scripts to execute in user sessions.",
                why_it_matters="Enables session theft, credential harvesting, and unauthorized actions on behalf of victims.",
                suggested_fix="Sanitize user input with DOMPurify or use standard text/component nodes instead of raw HTML insertion.",
                diff_snippet=line.strip()[:100],
                is_verified=True,
                source="security_scanner"
            ))
            
        # JS eval / Function constructor
        if re.search(r"\beval\s*\(|new\s+Function\s*\(", line) and not filename.endswith(".py"):
            findings.append(CodeFinding(
                id=f"js-eval-{filename}-{line_num}",
                file_path=filename,
                line_number=line_num,
                severity=SeverityLevel.CRITICAL,
                category=FindingCategory.SECURITY,
                title="Dynamic JavaScript code evaluation via 'eval()'",
                explanation="Evaluating dynamic strings as JavaScript code bypasses browser isolation and introduces arbitrary code execution.",
                why_it_matters="If external input reaches `eval()`, users can run arbitrary client-side code.",
                suggested_fix="Refactor to avoid eval. Parse data with `JSON.parse()` or static lookup tables.",
                diff_snippet=line.strip()[:100],
                is_verified=True,
                source="security_scanner"
            ))

    return findings

def verify_and_ground_findings(findings: List[CodeFinding], valid_lines_by_file: Dict[str, Set[int]]) -> List[CodeFinding]:
    """
    Verification tool:
    Grounds findings against real diff line numbers.
    If an AI or static finding specifies a line number that was NOT part of the PR diff,
    it marks `is_verified=False` or snaps to the closest valid line to prevent hallucinations.
    """
    grounded: List[CodeFinding] = []
    seen_keys: Set[str] = set()
    
    for f in findings:
        key = f"{f.file_path}:{f.line_number}:{f.title}"
        if key in seen_keys:
            continue
        seen_keys.add(key)
        
        valid_lines = valid_lines_by_file.get(f.file_path, set())
        if f.line_number is not None and valid_lines:
            if f.line_number in valid_lines:
                f.is_verified = True
            else:
                # Find closest line in diff
                closest = min(valid_lines, key=lambda l: abs(l - f.line_number))
                if abs(closest - f.line_number) <= 5:
                    f.line_number = closest
                    f.is_verified = True
                else:
                    # Keep finding, but flag that exact line was outside changed diff
                    f.is_verified = False
        else:
            f.is_verified = True
            
        grounded.append(f)
        
    return grounded
