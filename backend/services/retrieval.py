from typing import Any, Dict, List
import chromadb
from chromadb.utils import embedding_functions
from utils.logger import logger

# ML Engineering: Explicit Model Versioning
# Using all-MiniLM-L6-v2 for optimal balance between latency and semantic precision
# in codebase similarity tasks.
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Initialize persistent Chroma client with distance metric optimized for semantic search
client = chromadb.PersistentClient(path="./chroma_db")

def index_chunks(repo_name: str, chunks: List[Dict[str, Any]]) -> None:
    """Indexes a list of code chunks into the Chroma vector database.

    Args:
        repo_name: The name of the collection (repository name).
        chunks: A list of dictionaries containing 'text' and 'metadata'.
    """
    try:
        # ML Pattern: Use Cosine Similarity for semantic code search
        collection = client.get_or_create_collection(
            name=repo_name, 
            embedding_function=embedding_func,
            metadata={"hnsw:space": "cosine"} 
        )
        
        ids = [f"{repo_name}_{i}" for i in range(len(chunks))]
        documents = [c["text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]

        # Chroma handles indexing in batches to manage resource constraints
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            collection.add(
                ids=ids[i:i+batch_size],
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size]
            )
        logger.info(f"Successfully indexed {len(chunks)} chunks for {repo_name}")
    except Exception as e:
        logger.error(f"Failed to index chunks for {repo_name}: {e}")
        raise

def query_chroma(repo_name: str, query: str, n_results: int = 5) -> str:
    """Queries the vector database for the most relevant code snippets.

    Args:
        repo_name: The name of the repository collection to search.
        query: The natural language question or code snippet to search for.
        n_results: The number of top results to return.

    Returns:
        A concatenated string of relevant code snippets separated by dividers.
    """
    try:
        collection = client.get_collection(name=repo_name, embedding_function=embedding_func)
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        # Flatten and join the retrieved documents
        documents = results.get('documents', [[]])[0]
        return "\n---\n".join(documents)
    except Exception as e:
        logger.error(f"Error querying Chroma for {repo_name}: {e}")
        return ""
