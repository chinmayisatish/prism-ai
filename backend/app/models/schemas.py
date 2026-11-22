from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SeverityLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFO = "Info"

class FindingCategory(str, Enum):
    SECURITY = "Security"
    BUG = "Bug"
    QUALITY = "Code Quality"
    PERFORMANCE = "Performance"
    ERROR_HANDLING = "Error Handling"
    MAINTAINABILITY = "Maintainability"

class ReviewVerdict(str, Enum):
    APPROVED = "APPROVED"
    REQUEST_CHANGES = "REQUEST_CHANGES"
    COMMENT = "COMMENT"

class PRReviewRequest(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL or 'owner/repo' or full PR URL")
    pr_number: Optional[int] = Field(None, description="PR number if not in URL")
    github_token: Optional[str] = Field(None, description="Optional GitHub Personal Access Token")
    demo_id: Optional[str] = Field(None, description="Optional Preset Demo scenario ID")

class ChangedFile(BaseModel):
    filename: str
    status: str
    additions: int
    deletions: int
    changes: int
    patch: Optional[str] = None
    raw_url: Optional[str] = None

class PRDetails(BaseModel):
    repo_owner: str
    repo_name: str
    pr_number: int
    title: str
    body: Optional[str] = ""
    author: str
    author_avatar: Optional[str] = None
    state: str = "open"
    base_branch: str = "main"
    head_branch: str = "feature"
    commits_count: int = 1
    additions: int = 0
    deletions: int = 0
    changed_files_count: int = 0
    is_mock: bool = False
    html_url: str = ""

class CodeFinding(BaseModel):
    id: str
    file_path: str
    line_number: Optional[int] = None
    severity: SeverityLevel
    category: FindingCategory
    title: str
    explanation: str
    why_it_matters: str
    suggested_fix: str
    diff_snippet: Optional[str] = None
    is_verified: bool = True
    source: str = "agent"

class AgentStep(BaseModel):
    step_number: int
    name: str
    status: str  # pending, running, completed, failed, warning
    tool_called: Optional[str] = None
    details: str
    execution_time_ms: Optional[int] = None

class SecurityAudit(BaseModel):
    prompt_injection_detected: bool = False
    prompt_injection_details: Optional[str] = None
    code_execution_blocked: bool = True
    untrusted_input_sanitized: bool = True
    input_validation_passed: bool = True
    warnings: List[str] = []

class ReviewReport(BaseModel):
    review_id: str
    created_at: str
    pr_details: PRDetails
    verdict: ReviewVerdict
    health_score: int
    executive_summary: str
    findings_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    findings: List[CodeFinding]
    agent_steps: List[AgentStep]
    security_audit: SecurityAudit
    changed_files: List[ChangedFile]
    is_mock: bool = False
    model_used: str = "Gemini 1.5 Flash"
