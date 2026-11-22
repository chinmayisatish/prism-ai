import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from project root or backend directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "PRISM AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Intelligent AI Pull Request Reviewer"
    
    # API Keys & Auth
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    
    # Server configs
    HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    
    # Database
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "prism_ai.db")
    
    # Gemini Model configuration
    # Supports gemini-2.5-flash, gemini-1.5-flash, gemini-1.5-pro
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

settings = Settings()
