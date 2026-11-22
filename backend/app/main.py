from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db, save_review, get_recent_reviews
from app.routes.pr_review import router as pr_router
from app.routes.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# Configure CORS for local development and frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers with both /api and root paths so all rewrites succeed
app.include_router(pr_router, prefix="/api")
app.include_router(pr_router)
app.include_router(health_router, prefix="/api")
app.include_router(health_router)

def seed_initial_history():
    """Seeds historical PR review records matching the visual reference image."""
    try:
        existing = get_recent_reviews(limit=5)
        if not existing:
            # Seed 3 historical reviews from visual design
            records = [
                {
                    "review_id": "rev-seed-001",
                    "created_at": "2026-11-20T14:15:00Z",
                    "pr_details": {
                        "repo_owner": "github",
                        "repo_name": "prism-ai",
                        "pr_number": 41,
                        "title": "Fix API response handling",
                        "body": "Improves JSON deserialization resilience and handles partial chunks.",
                        "author": "octocat",
                        "state": "closed",
                        "base_branch": "main",
                        "head_branch": "fix/api-res",
                        "commits_count": 2,
                        "additions": 45,
                        "deletions": 12,
                        "changed_files_count": 3,
                        "is_mock": True,
                        "html_url": "https://github.com/github/prism-ai/pull/41"
                    },
                    "verdict": "APPROVED",
                    "health_score": 94,
                    "executive_summary": "Clean, well-structured PR resolving edge cases in chunked HTTP streams. Approved.",
                    "findings_count": 1,
                    "critical_count": 0,
                    "high_count": 0,
                    "medium_count": 1,
                    "low_count": 0,
                    "findings": [
                        {
                            "id": "seed-1-1",
                            "file_path": "src/api/client.ts",
                            "line_number": 52,
                            "severity": "Medium",
                            "category": "Code Quality",
                            "title": "Implicit any type in error callback",
                            "explanation": "The error callback parameter does not specify an explicit type annotation.",
                            "why_it_matters": "Lacks type safety when inspecting response error payloads.",
                            "suggested_fix": "- (err) => {\n+ (err: AxiosError) => {",
                            "is_verified": True,
                            "source": "static_analyzer"
                        }
                    ],
                    "agent_steps": [],
                    "security_audit": {
                        "prompt_injection_detected": False,
                        "code_execution_blocked": True,
                        "untrusted_input_sanitized": True,
                        "input_validation_passed": True,
                        "warnings": []
                    },
                    "changed_files": [
                        {
                            "filename": "src/api/client.ts",
                            "status": "modified",
                            "additions": 25,
                            "deletions": 8,
                            "changes": 33,
                            "patch": "@@ -45,10 +45,15 @@\n async function handleResponse() {\n+  return response.data;\n }\n"
                        }
                    ],
                    "is_mock": True,
                    "model_used": "Gemini 1.5 Flash"
                },
                {
                    "review_id": "rev-seed-002",
                    "created_at": "2026-11-19T18:40:00Z",
                    "pr_details": {
                        "repo_owner": "vercel",
                        "repo_name": "next.js",
                        "pr_number": 2345,
                        "title": "Improve performance",
                        "body": "Optimizes image loader caching and removes redundant header parses.",
                        "author": "timneutkens",
                        "state": "merged",
                        "base_branch": "canary",
                        "head_branch": "perf/image-cache",
                        "commits_count": 4,
                        "additions": 110,
                        "deletions": 85,
                        "changed_files_count": 6,
                        "is_mock": True,
                        "html_url": "https://github.com/vercel/next.js/pull/2345"
                    },
                    "verdict": "APPROVED",
                    "health_score": 91,
                    "executive_summary": "Substantial performance gains in image optimization middleware.",
                    "findings_count": 2,
                    "critical_count": 0,
                    "high_count": 0,
                    "medium_count": 2,
                    "low_count": 0,
                    "findings": [],
                    "agent_steps": [],
                    "security_audit": {
                        "prompt_injection_detected": False,
                        "code_execution_blocked": True,
                        "untrusted_input_sanitized": True,
                        "input_validation_passed": True,
                        "warnings": []
                    },
                    "changed_files": [],
                    "is_mock": True,
                    "model_used": "Gemini 1.5 Flash"
                },
                {
                    "review_id": "rev-seed-003",
                    "created_at": "2026-11-18T11:20:00Z",
                    "pr_details": {
                        "repo_owner": "facebook",
                        "repo_name": "react",
                        "pr_number": 8123,
                        "title": "Update dependencies",
                        "body": "Bumps compiler toolchain packages and updates build configuration.",
                        "author": "gaearon",
                        "state": "open",
                        "base_branch": "main",
                        "head_branch": "deps/update",
                        "commits_count": 1,
                        "additions": 18,
                        "deletions": 14,
                        "changed_files_count": 2,
                        "is_mock": True,
                        "html_url": "https://github.com/facebook/react/pull/8123"
                    },
                    "verdict": "COMMENT",
                    "health_score": 88,
                    "executive_summary": "Dependency bumps require lockfile integrity verification.",
                    "findings_count": 1,
                    "critical_count": 0,
                    "high_count": 1,
                    "medium_count": 0,
                    "low_count": 0,
                    "findings": [],
                    "agent_steps": [],
                    "security_audit": {
                        "prompt_injection_detected": False,
                        "code_execution_blocked": True,
                        "untrusted_input_sanitized": True,
                        "input_validation_passed": True,
                        "warnings": []
                    },
                    "changed_files": [],
                    "is_mock": True,
                    "model_used": "Gemini 1.5 Flash"
                }
            ]
            for rec in records:
                save_review(rec)
    except Exception as e:
        print(f"Seed note: {e}")

@app.on_event("startup")
def on_startup():
    try:
        init_db()
        seed_initial_history()
    except Exception as e:
        print(f"Startup warning: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
