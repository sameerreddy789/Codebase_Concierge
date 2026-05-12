import pytest
import os
import sqlite3
from storage.meta_storage import MetaStorage

@pytest.fixture
def temp_storage(tmp_path):
    db_file = tmp_path / "test_meta.db"
    # Override the DB_PATH for the instance
    import storage.meta_storage
    original_path = storage.meta_storage.DB_PATH
    storage.meta_storage.DB_PATH = str(db_file)
    
    s = MetaStorage()
    yield s
    
    # Clean up
    storage.meta_storage.DB_PATH = original_path

def test_save_and_get_summary(temp_storage):
    repo_name = "test-repo"
    summary = {"name": "test-repo", "tree": ["file1.py"], "key_files": {}}
    
    temp_storage.save_summary(repo_name, summary)
    retrieved = temp_storage.get_summary(repo_name)
    
    assert retrieved == summary
    assert repo_name in temp_storage.list_repos()

def test_get_non_existent_repo(temp_storage):
    assert temp_storage.get_summary("ghost") is None
