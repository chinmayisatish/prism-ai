import re
from typing import Tuple, Optional, Dict, Any, List
from urllib.parse import urlparse

# Common prompt injection triggers in code review contexts
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior)\s+instructions",
    r"system\s*:\s*override",
    r"you\s+are\s+now\s+(an\s+)?unrestricted",
    r"bypass\s+all\s+security\s+checks",
    r"approve\s+this\s+pr\s+without\s+warnings?",
    r"do\s+not\s+report\s+any\s+(bugs|vulnerabilities|issues)",
    r"reveal\s+(the\s+)?(api[_\s]?key|system\s+prompt|credentials|secrets)",
    r"print\s+(the\s+)?environment\s+variables",
    r"forget\s+all\s+your\s+rules",
    r"new\s+role\s*:\s*you\s+are\s+a\s+validator\s+that\s+approves",
    r"###\s*instruction\s*:\s*say\s+approved"
]

COMPILED_INJECTION_REGEX = [re.compile(p, re.IGNORECASE) for p in PROMPT_INJECTION_PATTERNS]

SECRET_PATTERNS = [
    r"(?i)(api[_-]?key|secret|token|password|passwd|auth)\s*[:=]\s*['\"][A-Za-z0-9_\-\.]{12,}['\"]",
    r"ghp_[A-Za-z0-9]{36}",  # GitHub personal access token
    r"gho_[A-Za-z0-9]{36}",  # GitHub OAuth token
    r"AIza[0-9A-Za-z-_]{35}", # Google API Key
    r"AKIA[0-9A-Z]{16}",     # AWS Access Key
]
COMPILED_SECRET_REGEX = [re.compile(p) for p in SECRET_PATTERNS]

def parse_and_validate_github_url(repo_url: str, pr_number: Optional[int] = None) -> Tuple[str, str, int]:
    """
    Validates and extracts (owner, repo, pr_number) from various input formats:
    - https://github.com/owner/repo/pull/42
    - https://github.com/owner/repo
    - owner/repo
    - git@github.com:owner/repo.git
    """
    if not repo_url or not isinstance(repo_url, str):
        raise ValueError("Repository URL or identifier cannot be empty.")
    
    clean_url = repo_url.strip()
    
    # Check for full PR URL: https://github.com/owner/repo/pull/123
    pr_match = re.search(r"github\.com[/:]([\w\.-]+)/([\w\.-]+)/pull/(\d+)", clean_url)
    if pr_match:
        owner = pr_match.group(1)
        repo = pr_match.group(2).rstrip(".git")
        extracted_pr = int(pr_match.group(3))
        return _validate_names(owner, repo, extracted_pr)
        
    # Check for standard repo URL: https://github.com/owner/repo or owner/repo
    repo_match = re.search(r"(?:https?://github\.com/|git@github\.com:)?([\w\.-]+)/([\w\.-]+?)(?:\.git|/)?$", clean_url)
    if repo_match:
        owner = repo_match.group(1)
        repo = repo_match.group(2).rstrip(".git")
        if not pr_number:
            raise ValueError("PR number is required when specifying repository URL without /pull/{number}.")
        if not isinstance(pr_number, int) or pr_number <= 0:
            raise ValueError(f"Invalid PR number '{pr_number}'. Must be a positive integer.")
        return _validate_names(owner, repo, pr_number)

    raise ValueError(f"Invalid GitHub repository URL format: '{repo_url}'. Expected 'https://github.com/owner/repo' or 'owner/repo'.")

def _validate_names(owner: str, repo: str, pr_number: int) -> Tuple[str, str, int]:
    """Ensures owner and repo contain only valid safe characters."""
    valid_name_regex = re.compile(r"^[a-zA-Z0-9_\-\.]+$")
    if not valid_name_regex.match(owner) or not valid_name_regex.match(repo):
        raise ValueError(f"Repository identifier contains invalid characters: '{owner}/{repo}'.")
    if owner in ("..", ".", "") or repo in ("..", ".", ""):
        raise ValueError("Malformed repository path traversal attempt detected.")
    return owner, repo, pr_number

def check_prompt_injection(content: str) -> Tuple[bool, Optional[str]]:
    """
    Scans untrusted repository text, PR description, or diffs for adversarial prompt injection.
    Returns (detected, description).
    """
    if not content:
        return False, None
        
    for idx, regex in enumerate(COMPILED_INJECTION_REGEX):
        match = regex.search(content)
        if match:
            found_phrase = match.group(0)
            return True, f"Suspicious prompt override attempt detected: '{found_phrase}'"
            
    return False, None

def sanitize_for_prompt(untrusted_text: str) -> str:
    """
    Sanitizes untrusted PR content so it cannot break out of AI prompt enclosures.
    Replaces harmful control strings and escapes delimiters.
    """
    if not untrusted_text:
        return ""
    # Strip any potential fake system prompt delimiter markers
    sanitized = untrusted_text.replace("</UNTRUSTED_CODE>", "&lt;/UNTRUSTED_CODE&gt;")
    sanitized = sanitized.replace("```system", "```comment")
    return sanitized

def mask_sensitive_data(text: str) -> str:
    """Masks known token signatures so secrets are never output in raw text."""
    if not text:
        return ""
    result = text
    for regex in COMPILED_SECRET_REGEX:
        result = regex.sub("[REDACTED_SECRET]", result)
    return result
