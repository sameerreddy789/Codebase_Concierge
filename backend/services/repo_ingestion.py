import os
import shutil
import re
from typing import Any, Dict, List, Set
from git import Repo
from services.retrieval import index_chunks
from services.status_service import status_manager, WorkflowState
from storage.meta_storage import storage
from utils.logger import logger

IGNORE_DIRS: Set[str] = {'.git', 'node_modules', '__pycache__', 'dist', 'build', '.venv', 'env'}
IGNORE_EXTENSIONS: Set[str] = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mov', '.exe', '.dll', '.so'}

# ML Engineering: Structural Signatures
CLASS_REGEX = re.compile(r'(?:class\s+)([a-zA-Z0-9_]+)')
FUNC_REGEX = re.compile(r'(?:def\s+|function\s+|const\s+)([a-zA-Z0-9_]+)\s*(?:=|\()')

def extract_signatures(text: str) -> Dict[str, List[str]]:
    """Extracts structural signatures (classes/functions) from code text."""
    return {
        "classes": list(set(CLASS_REGEX.findall(text))),
        "functions": list(set(FUNC_REGEX.findall(text)))
    }

def ingest_repo(repo_url: str) -> None:
    """Clones a repository, chunks the code, and indexes it for retrieval.

    This function is intended to be run as a background task. It updates the 
    global status_manager (WorkflowOrchestrator) at each stage.

    Args:
        repo_url: The public GitHub URL of the repository.
    """
    logger.info(f"Starting ingestion for {repo_url}")
    repo_name = repo_url.split("/")[-1].replace(".git", "")
    repo_path = os.path.join("repos", repo_name)

    try:
        # Atomic State Transition: CLONING
        status_manager.update_state(repo_url, WorkflowState.CLONING)
        logger.info(f"Cloning {repo_url}...")
        
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)
        
        Repo.clone_from(repo_url, repo_path, depth=1)

        # Atomic State Transition: INDEXING
        status_manager.update_state(repo_url, WorkflowState.INDEXING)
        logger.info(f"Indexing {repo_name}...")
        
        chunks: List[Dict[str, Any]] = []
        file_tree: List[str] = []

        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                if any(file.endswith(ext) for ext in IGNORE_EXTENSIONS):
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, repo_path)
                file_tree.append(rel_path)

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.split('\n')
                        for i in range(0, len(lines), 150):
                            chunk_lines = lines[i:i+200]
                            chunk_text = '\n'.join(chunk_lines)

                            signatures = extract_signatures(chunk_text)

                            chunks.append({
                                "text": f"File: {rel_path}\nLines: {i+1}-{i+len(chunk_lines)}\n\n{chunk_text}",
                                "metadata": {
                                    "path": rel_path, 
                                    "repo": repo_name,
                                    "classes": ",".join(signatures["classes"]),
                                    "functions": ",".join(signatures["functions"])
                                }
                            })

                except Exception as e:
                    logger.warning(f"Skipping {rel_path} due to error: {e}")

        index_chunks(repo_name, chunks)

        # Compression Layer
        key_files_content: Dict[str, str] = {}
        key_patterns = ['README', 'package.json', 'requirements.txt', 'main.py', 'App.jsx', 'index.html']
        
        for rel_path in file_tree:
            if any(pattern in rel_path for pattern in key_patterns):
                try:
                    full_path = os.path.join(repo_path, rel_path)
                    with open(full_path, 'r', encoding='utf-8') as f:
                        key_files_content[rel_path] = "\n".join(f.readlines()[:500])
                except Exception as e:
                    logger.debug(f"Could not read key file {rel_path}: {e}")

        summary = {
            "name": repo_name, 
            "tree": file_tree[:200],
            "key_files": key_files_content
        }
        
        storage.save_summary(repo_name, summary)
        
        # Final State Transition: COMPLETED
        status_manager.update_state(repo_url, WorkflowState.COMPLETED)
        logger.info(f"Successfully completed ingestion for {repo_name}")
        
    except Exception as e:
        # Compensation Logic: Set state to FAILED and cleanup
        logger.error(f"Ingestion failed for {repo_url}: {e}", exc_info=True)
        status_manager.update_state(repo_url, WorkflowState.FAILED, str(e))
        
        # Cleanup partial artifacts
        if os.path.exists(repo_path):
            try:
                shutil.rmtree(repo_path)
                logger.info(f"Cleaned up partial artifacts for {repo_name}")
            except Exception as cleanup_err:
                logger.error(f"Failed to cleanup {repo_path}: {cleanup_err}")
