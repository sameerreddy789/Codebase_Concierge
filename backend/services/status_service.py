import sqlite3
import json
from enum import Enum
from typing import Dict, Any, Optional
from utils.logger import logger

DB_PATH = "codebase_concierge.db"

class WorkflowState(str, Enum):
    PENDING = "pending"
    CLONING = "cloning"
    INDEXING = "indexing"
    COMPLETED = "completed"
    FAILED = "failed"

class WorkflowOrchestrator:
    """Orchestrates complex multi-step workflows with persistent state and error recovery."""

    def __init__(self) -> None:
        self._init_db()

    def _init_db(self) -> None:
        """Ensures the workflow state table exists in SQLite."""
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS ingestion_workflows (
                        repo_url TEXT PRIMARY KEY,
                        state TEXT NOT NULL,
                        message TEXT,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Workflow DB initialization failed: {e}")

    def update_state(self, repo_url: str, state: WorkflowState, message: str = "") -> None:
        """Atomic state transition with persistence.

        Args:
            repo_url: Unique identifier for the workflow.
            state: The target WorkflowState.
            message: Contextual message or error detail.
        """
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO ingestion_workflows (repo_url, state, message, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                    (repo_url, state.value, message)
                )
                conn.commit()
            logger.info(f"Workflow [{repo_url}] transitioned to {state.value}")
        except sqlite3.Error as e:
            logger.error(f"Failed to update workflow state for {repo_url}: {e}")

    def get_status(self, repo_url: str) -> Dict[str, str]:
        """Retrieves the current workflow status from persistence."""
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute("SELECT state, message FROM ingestion_workflows WHERE repo_url = ?", (repo_url,))
                row = cursor.fetchone()
                if row:
                    return {"status": row[0], "message": row[1]}
            return {"status": "unknown", "message": "No active workflow found."}
        except sqlite3.Error as e:
            logger.error(f"Failed to retrieve workflow status: {e}")
            return {"status": "error", "message": str(e)}

# Singleton instance for system-wide orchestration
status_manager = WorkflowOrchestrator()
