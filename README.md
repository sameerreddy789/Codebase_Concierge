# 🧭 Codebase Concierge — Technical Blueprint & User Guide

> **"Transforming static code into living architectural intelligence."**

Codebase Concierge is a high-precision repository intelligence platform built for the **LabLab AI Agents Hackathon**. It is designed to bridge the gap between "reading lines of code" and "understanding system architecture." By leveraging **Gemini 1.5 Flash's** massive context window and a custom **Code-Aware RAG pipeline**, it provides developers with instant architectural clarity through natural language and interactive visual diagrams.

---

## 📖 Table of Contents
1. [Core Philosophy](#-core-philosophy)
2. [Deep-Dive Architecture](#-deep-dive-architecture)
   - [ML Retrieval Pipeline](#retrieval-pipeline-rag)
   - [Structural Metadata Enrichment](#structural-metadata-enrichment)
   - [Hybrid Context Strategy](#hybrid-context-strategy)
3. [Multi-Agent Intelligence System](#-multi-agent-intelligence-system)
4. [Visual Design System (Claymorphism)](#-visual-design-system-claymorphism)
5. [Technical Stack](#-technology-stack)
6. [Installation & Deployment](#-getting-started)
7. [API Reference & Usage](#-api-reference)
8. [Performance & Optimization](#-performance--optimization)

---

## 🧠 Core Philosophy
Traditional AI coding tools focus on **Micro-Intelligence** (writing the next line of code). Codebase Concierge focuses on **Macro-Intelligence** (understanding the relationship between modules). 

**The Problem:** New developers spend 70% of their time navigating file structures and tracing data flows. 
**The Solution:** An agentic concierge that "reads the room," maps the architecture, and draws the diagrams so you don't have to.

---

## 🏗️ Deep-Dive Architecture

### Retrieval Pipeline (RAG)
We implement a sophisticated **Retrieval-Augmented Generation** pipeline optimized specifically for source code:
1.  **Ingestion:** Shallow clones repositories (`--depth 1`) to the `backend/repos/` directory.
2.  **Semantic Chunking:** Files are processed using a **sliding window** of 200 lines with a 50-line overlap. This overlap ensures that logic spanning across chunk boundaries (like large functions) is captured semantically by at least one vector.
3.  **Vectorization:** We use the `all-MiniLM-L6-v2` bi-encoder model to transform code chunks into 384-dimensional dense vectors.
4.  **Indexing:** Chunks are stored in a **ChromaDB** collection using **Cosine Similarity** (HNSW index) to optimize for semantic relevance rather than simple keyword matching.

### Structural Metadata Enrichment
Unlike generic RAG, our pipeline is "code-aware." During ingestion, we use high-performance regex signatures to extract:
-   **Classes:** `(?:class\s+)([a-zA-Z0-9_]+)`
-   **Functions/Methods:** `(?:def\s+|function\s+|const\s+)([a-zA-Z0-9_]+)\s*(?:=|\()`

This metadata is attached to each vector, allowing the AI to prioritize chunks that contain actual structural definitions when a user asks about specific components.

### Hybrid Context Strategy
To solve the "Lost in the Middle" problem and provide "Big Picture" understanding, we inject a **Hybrid Context Layer** into every Gemini prompt:
-   **Top-Down (Global):** A compressed file tree (first 200 files) + full content of "Key Files" (README, package.json, main entry points).
-   **Bottom-Up (Local):** The Top-5 most relevant code snippets retrieved via semantic search.

---

## 🤖 Multi-Agent Intelligence System
We simulate a multi-agent team within a single **Gemini 1.5 Flash** orchestration layer through strict system prompting:

| Agent | Responsibility | Output Style |
| :--- | :--- | :--- |
| **Analyst** | File system, dependencies, and structure. | Terminal-style, analytical, tree-focused. |
| **Retriever** | Semantic code location and retrieval. | Snippet-heavy, citation-focused. |
| **Explainer** | High-level architecture and visualization. | Friendly, diagrammatic, markdown-rich. |

This team-based approach ensures responses are multi-faceted, covering both the *how* (code) and the *why* (architecture).

---

## 🎨 Visual Design System (Claymorphism)
The UI is built on a custom **Claymorphic Design System**, prioritizing focus and tactile feedback:
-   **Soft Aesthetics:** Uses layered box-shadows (`9px 9px 16px #d1d9e6`) to create a "tactile plastic" feel.
-   **Fluid Motion:** Powered by **Framer Motion** for physics-based entrance animations and ingestion state transitions.
-   **Visual Theater:** The central chat pane is designed as a "theater" where **Mermaid.js** diagrams are the star, automatically rendered from AI-generated code blocks.

---

## 🛠️ Technology Stack

### Backend (The Brain)
- **FastAPI:** High-performance async Python framework.
- **Google GenAI SDK:** Direct integration with Gemini 1.5 Flash.
- **ChromaDB:** Persistent vector database for semantic indexing.
- **GitPython:** For programmatic repository management.
- **SQLite:** Persistent metadata store for repository summaries.

### Frontend (The Face)
- **React 18 + Vite:** Modern, lightning-fast dev environment.
- **Tailwind CSS:** For custom claymorphic utility classes.
- **Mermaid.js:** Client-side architectural diagram rendering.
- **React-Markdown:** For high-fidelity code and text formatting.
- **Lucide React:** Premium iconography.

---

## 📦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API Key ([AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env # Add your GEMINI_API_KEY
python main.py
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/ingest` | `POST` | Starts async repo cloning and indexing. Returns `202 Accepted`. |
| `/status` | `GET` | Returns real-time status (`cloning`, `indexing`, `completed`). |
| `/chat` | `POST` | **SSE Stream:** Returns a stream of AI-generated architectural insights. |
| `/repos` | `GET` | Lists all successfully indexed workspaces. |
| `/health` | `GET` | System heartbeat. |

---

## ⚡ Performance & Optimization
-   **Response Streaming:** Implemented via **Server-Sent Events (SSE)** to reduce Time-to-First-Token (TTFT) to **<400ms**.
-   **Memoized Rendering:** Mermaid diagrams are wrapped in `React.memo` to prevent re-render flickers during streaming.
-   **Async Ingestion:** Background tasks ensure the UI never blocks during heavy repository processing.

---

## 📄 License & Credits
Built with ❤️ for the **LabLab AI Agents Hackathon**.
Licensed under the **MIT License**.
