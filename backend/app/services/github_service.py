import httpx
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.models.schemas import PRDetails, ChangedFile
from app.services.security_guard import parse_and_validate_github_url

class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "PRISM-AI-Reviewer/1.0"
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

    async def fetch_pr_data(self, repo_url: str, pr_number: Optional[int] = None) -> Tuple[PRDetails, List[ChangedFile]]:
        """
        Fetches PR metadata and list of changed files with diffs from GitHub REST API.
        """
        owner, repo, pr_num = parse_and_validate_github_url(repo_url, pr_number)
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            # 1. Fetch Pull Request Metadata
            pr_endpoint = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_num}"
            resp = await client.get(pr_endpoint, headers=self.headers)
            
            if resp.status_code == 404:
                raise ValueError(f"GitHub PR #{pr_num} not found in repository '{owner}/{repo}'. Please check repository visibility or ensure PR exists.")
            elif resp.status_code == 401:
                raise PermissionError("GitHub API authentication failed. Your GITHUB_TOKEN may be invalid or expired.")
            elif resp.status_code == 403:
                rate_limit_reset = resp.headers.get("X-RateLimit-Reset", "soon")
                raise PermissionError(f"GitHub API rate limit exceeded or access forbidden. Rate limit resets at {rate_limit_reset}. Consider supplying a GitHub Personal Access Token.")
            elif resp.status_code != 200:
                raise RuntimeError(f"GitHub API error ({resp.status_code}): {resp.text}")
                
            pr_json = resp.json()
            
            pr_details = PRDetails(
                repo_owner=owner,
                repo_name=repo,
                pr_number=pr_num,
                title=pr_json.get("title", f"PR #{pr_num}"),
                body=pr_json.get("body") or "",
                author=pr_json.get("user", {}).get("login", "unknown"),
                author_avatar=pr_json.get("user", {}).get("avatar_url"),
                state=pr_json.get("state", "open"),
                base_branch=pr_json.get("base", {}).get("ref", "main"),
                head_branch=pr_json.get("head", {}).get("ref", "branch"),
                commits_count=pr_json.get("commits", 1),
                additions=pr_json.get("additions", 0),
                deletions=pr_json.get("deletions", 0),
                changed_files_count=pr_json.get("changed_files", 0),
                is_mock=False,
                html_url=pr_json.get("html_url", f"https://github.com/{owner}/{repo}/pull/{pr_num}")
            )
            
            # 2. Fetch Changed Files & Diffs
            files_endpoint = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_num}/files?per_page=100"
            files_resp = await client.get(files_endpoint, headers=self.headers)
            
            changed_files: List[ChangedFile] = []
            if files_resp.status_code == 200:
                files_json = files_resp.json()
                for f in files_json:
                    changed_files.append(ChangedFile(
                        filename=f.get("filename", ""),
                        status=f.get("status", "modified"),
                        additions=f.get("additions", 0),
                        deletions=f.get("deletions", 0),
                        changes=f.get("changes", 0),
                        patch=f.get("patch", ""),
                        raw_url=f.get("raw_url", "")
                    ))
            
            return pr_details, changed_files
