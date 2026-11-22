import sqlite3
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.config import settings

def get_db_file() -> Path:
    p = Path(settings.DATABASE_PATH)
    # Ensure parent directory exists if using /tmp or nested paths
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass
    return p

def init_db():
    """Initializes the SQLite database schema."""
    try:
        db_file = get_db_file()
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                review_id TEXT PRIMARY KEY,
                repo_owner TEXT NOT NULL,
                repo_name TEXT NOT NULL,
                pr_number INTEGER NOT NULL,
                title TEXT NOT NULL,
                verdict TEXT NOT NULL,
                health_score INTEGER NOT NULL,
                findings_count INTEGER NOT NULL,
                critical_count INTEGER NOT NULL,
                high_count INTEGER NOT NULL,
                is_mock BOOLEAN NOT NULL,
                created_at TEXT NOT NULL,
                report_data TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Warning: Database init failed: {e}")

def save_review(report_dict: Dict[str, Any]):
    """Persists a review report."""
    try:
        init_db()
        db_file = get_db_file()
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO reviews (
                review_id, repo_owner, repo_name, pr_number, title,
                verdict, health_score, findings_count, critical_count, high_count,
                is_mock, created_at, report_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_dict["review_id"],
            report_dict["pr_details"]["repo_owner"],
            report_dict["pr_details"]["repo_name"],
            report_dict["pr_details"]["pr_number"],
            report_dict["pr_details"]["title"],
            report_dict["verdict"],
            report_dict["health_score"],
            report_dict["findings_count"],
            report_dict["critical_count"],
            report_dict["high_count"],
            report_dict["is_mock"],
            report_dict["created_at"],
            json.dumps(report_dict)
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Warning: Could not save review to database: {e}")

def get_review_by_id(review_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a review report by ID."""
    try:
        init_db()
        db_file = get_db_file()
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("SELECT report_data FROM reviews WHERE review_id = ?", (review_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
    except Exception as e:
        print(f"Warning: Could not read review from database: {e}")
    return None

def get_recent_reviews(limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieves summary list of recent reviews."""
    try:
        init_db()
        db_file = get_db_file()
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT review_id, repo_owner, repo_name, pr_number, title,
                   verdict, health_score, findings_count, critical_count, high_count,
                   is_mock, created_at
            FROM reviews
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for r in rows:
            results.append({
                "review_id": r[0],
                "repo_owner": r[1],
                "repo_name": r[2],
                "pr_number": r[3],
                "title": r[4],
                "verdict": r[5],
                "health_score": r[6],
                "findings_count": r[7],
                "critical_count": r[8],
                "high_count": r[9],
                "is_mock": bool(r[10]),
                "created_at": r[11]
            })
        return results
    except Exception as e:
        print(f"Warning: Could not query reviews from database: {e}")
        return []
