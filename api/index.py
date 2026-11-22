import sys
import os
from pathlib import Path

# Add backend directory to path so backend/app modules are discoverable
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# On Vercel serverless, use /tmp for writable storage
if os.environ.get("VERCEL") or not os.access(str(root_dir), os.W_OK):
    os.environ.setdefault("DATABASE_PATH", "/tmp/prism_ai.db")

from app.main import app  # noqa: E402

# Vercel looks for 'app' ASGI handler
