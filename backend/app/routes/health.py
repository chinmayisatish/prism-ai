from fastapi import APIRouter
from app.config import settings
from app.models.database import init_db

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
async def health_check():
    """
    Returns system status, model configurations, and tool states.
    """
    has_gemini = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 5)
    has_github = bool(settings.GITHUB_TOKEN and len(settings.GITHUB_TOKEN) > 5)
    
    # Verify DB connectivity
    db_ok = True
    try:
        init_db()
    except Exception:
        db_ok = False

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_configured": has_gemini,
        "github_token_configured": has_github,
        "model": settings.GEMINI_MODEL,
        "database_connected": db_ok,
        "sandbox_mode": "enforced"
    }
