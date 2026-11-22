from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.models.schemas import PRReviewRequest, ReviewReport
from app.models.database import get_recent_reviews, get_review_by_id
from app.services.agent_orchestrator import AgentOrchestrator
from app.services.security_guard import parse_and_validate_github_url
from app.services.mock_data import get_demo_list

router = APIRouter(prefix="/api", tags=["Pull Request Reviews"])

@router.post("/validate")
async def validate_input(request: PRReviewRequest):
    """
    Validates repository URL and PR identifier before triggering analysis.
    """
    try:
        if request.demo_id:
            return {"valid": True, "type": "demo", "demo_id": request.demo_id}
            
        owner, repo, pr_num = parse_and_validate_github_url(request.repo_url, request.pr_number)
        return {
            "valid": True,
            "owner": owner,
            "repo": repo,
            "pr_number": pr_num,
            "type": "github"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.post("/review", response_model=ReviewReport)
async def create_review(request: PRReviewRequest):
    """
    Executes the multi-step PRISM AI agent review workflow.
    """
    try:
        orchestrator = AgentOrchestrator(request)
        report = await orchestrator.execute_review()
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent review failed: {str(e)}")

@router.get("/reviews")
async def list_reviews(limit: int = Query(20, ge=1, le=100)):
    """
    Returns list of past reviews stored in SQLite.
    """
    return get_recent_reviews(limit=limit)

@router.get("/reviews/{review_id}")
async def get_single_review(review_id: str):
    """
    Retrieves full report details for a specific review ID.
    """
    review = get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail=f"Review '{review_id}' not found.")
    return review

@router.get("/demos")
async def list_demos():
    """
    Returns available demonstration scenarios.
    """
    return get_demo_list()
