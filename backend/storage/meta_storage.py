from typing import Any, Dict, List, Optional
import sqlite3
import json
from utils.logger import logger

DB_PATH = "codebase_concierge.db"

class StorageError(Exception):
    """Base exception for storage operations."""
    pass

class MetaStorage:
    """Handles persistent storage of repository metadata using SQLite."""

    def __init__(self) -> None:
        """Initializes the database and ensures the schema exists."""
        self._init_db()

    def _init_db(self) -> None:
        """Creates the repo_summaries table if it does not exist."""
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS repo_summaries (
                        repo_name TEXT PRIMARY KEY,
                        summary_json TEXT
                    )
                """)
                conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Database initialization failed: {e}")
            raise StorageError(f"Could not initialize database: {e}")

    def save_summary(self, repo_name: str, summary: Dict[str, Any]) -> None:
        """Saves or updates a repository summary.

        Args:
            repo_name: The unique name of the repository.
            summary: A dictionary containing the repository metadata.
        
        Raises:
            StorageError: If the database operation fails.
        """
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO repo_summaries (repo_name, summary_json) VALUES (?, ?)",
                    (repo_name, json.dumps(summary))
                )
                conn.commit()
            logger.info(f"Saved metadata for {repo_name}")
        except sqlite3.Error as e:
            logger.error(f"Failed to save metadata for {repo_name}: {e}")
            raise StorageError(f"Error saving summary for {repo_name}: {e}")

    def get_summary(self, repo_name: str) -> Optional[Dict[str, Any]]:
        """Retrieves a repository summary by name.

        Args:
            repo_name: The name of the repository to retrieve.

        Returns:
            The summary dictionary if found, otherwise None.
        """
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute("SELECT summary_json FROM repo_summaries WHERE repo_name = ?", (repo_name,))
                row = cursor.fetchone()
                if row:
                    return json.loads(row[0])
            return None
        except sqlite3.Error as e:
            logger.error(f"Failed to retrieve metadata for {repo_name}: {e}")
            return None

    def list_repos(self) -> List[str]:
        """Lists all repository names currently stored in the database.

        Returns:
            A list of repository name strings.
        """
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute("SELECT repo_name FROM repo_summaries")
                return [row[0] for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logger.error(f"Failed to list repos: {e}")
            return []

# Singleton instance
storage = MetaStorage()
