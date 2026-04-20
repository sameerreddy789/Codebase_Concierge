from typing import Any, Dict, List
from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
import os
import time
import json

from services.repo_ingestion import ingest_repo
from services.retrieval import query_chroma
from services.gemini_service import get_gemini_response, get_gemini_response_stream
from services.status_service import status_manager, WorkflowState
from storage.meta_storage import storage
from utils.logger import setup_logging, logger

# Initialize structured logging
setup_logging()

app = FastAPI(
    title="Codebase Concierge API",
    description="Backend API for AI-powered architectural repository analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class IngestRequest(BaseModel):
    """Schema for repository ingestion requests."""
    url: str = Field(..., description="The public GitHub repository URL")

class ChatRequest(BaseModel):
    """Schema for chat queries about an indexed repository."""
    repo_name: str = Field(..., description="The name of the indexed repository")
    query: str = Field(..., description="The architectural question to ask")

@app.middleware("http")
async def log_requests(request: Request, call_next: Any) -> Any:
    """Middleware to log request details and processing time.

    Args:
        request: The incoming HTTP request.
        call_next: The next middleware or route handler.

    Returns:
        The HTTP response.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.2f}ms)")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for all unhandled backend errors.

    Args:
        request: The request that triggered the error.
        exc: The exception instance.

    Returns:
        A standardized 500 JSON response.
    """
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "message": str(exc)},
    )

@app.post("/ingest", status_code=202)
async def ingest(request: IngestRequest, background_tasks: BackgroundTasks) -> Dict[str, str]:
    """Starts the repository ingestion process in the background.

    Args:
        request: The ingestion request containing the repo URL.
        background_tasks: FastAPI background task manager.

    Returns:
        A pending status message.
    """
    logger.info(f"Ingestion request received for {request.url}")
    background_tasks.add_task(ingest_repo, request.url)
    return {"status": "pending", "message": "Ingestion started in background."}

@app.get("/status")
async def get_status(url: str) -> Dict[str, str]:
    """Retrieves the real-time ingestion status of a repository.

    Args:
        url: The GitHub URL of the repository.

    Returns:
        The current ingestion status and message.
    """
    return status_manager.get_status(url)

@app.post("/chat")
async def chat(request: ChatRequest):
    """Processes an architectural query about a specific repository with streaming.

    Returns:
        A StreamingResponse yielding JSON chunks.
    """
    logger.info(f"Chat request for repo: {request.repo_name}")
    summary = storage.get_summary(request.repo_name)
    
    if not summary:
        raise HTTPException(status_code=404, detail="Repository not found.")
        
    async def stream_generator():
        # 1. Retrieve context
        context = query_chroma(request.repo_name, request.query)
        # 2. Yield streaming chunks
        async for chunk in get_gemini_response_stream(request.query, context, summary):
            yield f"data: {json.dumps({'text': chunk})}\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

@app.get("/repos")
async def list_repos() -> Dict[str, List[str]]:
    """Lists all successfully indexed repositories."""
    repos = storage.list_repos()
    return {"repos": repos}

@app.get("/repos/{repo_name}/files/{file_path:path}")
async def get_file_content(repo_name: str, file_path: str):
    """Retrieves the content of a specific file in a repository."""
    repo_path = os.path.join("repos", repo_name, file_path)
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="File not found.")
    
    try:
        with open(repo_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repos/{repo_name}/summary")
async def get_repo_summary(repo_name: str):
    """Retrieves the cached summary (including file tree) for a repo."""
    summary = storage.get_summary(repo_name)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found.")
    return summary

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint.

    Returns:
        Health status and current server timestamp.
    """
    return {"status": "healthy", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
