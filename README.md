# 🧭 Codebase Concierge — Technical Blueprint & User Guide

> **"Transforming static code into living architectural intelligence."**

Codebase Concierge is a high-precision repository intelligence platform built for the **LabLab AI Agents Hackathon**. It is designed to bridge the gap between "reading lines of code" and "understanding system architecture." By leveraging **Gemini 1.5 Flash's** massive context window and a custom **Code-Aware RAG pipeline**, it provides developers with instant architectural clarity through natural language and interactive visual diagrams.

---

## 📖 Table of Contents
1. [Core Philosophy](#-core-philosophy)
2. [Key Features](#-key-features)
3. [Deep-Dive Architecture](#-deep-dive-architecture)
   - [ML Retrieval Pipeline](#retrieval-pipeline-rag)
   - [Structural Metadata Enrichment](#structural-metadata-enrichment)
   - [Hybrid Context Strategy](#hybrid-context-strategy)
4. [Multi-Agent Intelligence System](#-multi-agent-intelligence-system)
5. [Visual Design System (Claymorphism)](#-visual-design-system-claymorphism)
6. [Technical Stack](#-technology-stack)
7. [Installation & Deployment](#-getting-started)
8. [API Reference & Usage](#-api-reference)

---

## 🧠 Core Philosophy
Traditional AI coding tools focus on **Micro-Intelligence** (writing the next line of code). Codebase Concierge focuses on **Macro-Intelligence** (understanding the relationship between modules). 

**The Problem:** New developers spend 70% of their time navigating file structures and tracing data flows. 
**The Solution:** An agentic concierge that "reads the room," maps the architecture, and draws the diagrams so you don't have to.

---

## ✨ Key Features

### 1. Interactive Mermaid Diagrams 📊
Don't just read about architecture—see it. Codebase Concierge generates real-time Mermaid diagrams. 
- **Interactive Nodes:** Click any node in a diagram (like `auth_service.py`) to instantly open that file in the integrated Code Viewer.
- **Visual Sync:** The Workspace Explorer automatically expands and highlights the file you've selected from the diagram.

### 2. Multi-Agent Simulation 🤖
Experience a collaborative reasoning process. The UI simulates a multi-agent team working in parallel:
- **Analyst:** Scans file trees and identifies structural patterns.
- **Retriever:** Searches for relevant semantic chunks in the vector database.
- **Explainer:** Synthesizes insights into clear, architectural narratives.

### 3. One-Click Onboarding 🚀
Get up to speed on any repository in seconds.
- **Starter Prompts:** Context-aware suggestions like "Explain the authentication flow" or "Show me the routing logic" eliminate the blank-canvas syndrome.
- **Architecture-Aware Diffing:** Ask for a feature implementation and see exactly where and how it should be integrated into the existing architecture.

---

## 🏗️ Deep-Dive Architecture

### Retrieval Pipeline (RAG)
We implement a sophisticated **Retrieval-Augmented Generation** pipeline optimized specifically for source code:
1.  **Ingestion:** Shallow clones repositories (`--depth 1`) to the `backend/repos/` directory.
2.  **Semantic Chunking:** Files are processed using a **sliding window** of 200 lines with a 50-line overlap. 
3.  **Vectorization:** We use the `all-MiniLM-L6-v2` bi-encoder model to transform code chunks into 384-dimensional dense vectors.
4.  **Indexing:** Chunks are stored in **ChromaDB** using **Cosine Similarity** (HNSW index).

### Structural Metadata Enrichment
Unlike generic RAG, our pipeline is "code-aware." During ingestion, we use high-performance regex signatures to extract classes, functions, and methods. This metadata is attached to each vector, allowing Gemini to prioritize structural definitions.

---

## 🤖 Multi-Agent Intelligence System
We simulate a multi-agent team within a single **Gemini 1.5 Flash** orchestration layer through strict system prompting:

| Agent | Responsibility | Output Style |
| :--- | :--- | :--- |
| **Analyst** | File system, dependencies, and structure. | Terminal-style, analytical, tree-focused. |
| **Retriever** | Semantic code location and retrieval. | Snippet-heavy, citation-focused. |
| **Explainer** | High-level architecture and visualization. | Friendly, diagrammatic, markdown-rich. |

---

## 🎨 Visual Design System (Claymorphism)
The UI is built on a custom **Claymorphic Design System**, prioritizing focus and tactile feedback:
-   **Soft Aesthetics:** Uses layered box-shadows to create a "tactile plastic" feel.
-   **Fluid Motion:** Powered by **Framer Motion** for physics-based entrance animations and ingestion state transitions.
-   **Visual Theater:** The central chat pane is designed as a "theater" where **Mermaid.js** diagrams are the star.

---

## 🛠️ Technology Stack

### Backend (The Brain)
- **FastAPI:** High-performance async Python framework.
- **Google GenAI SDK:** Direct integration with **Gemini 1.5 Flash**.
- **ChromaDB:** Persistent vector database for semantic indexing.
- **GitPython:** For programmatic repository management.
- **SQLite:** Persistent metadata store for repository summaries.

### Frontend (The Face)
- **React 18 + Vite:** Modern, lightning-fast dev environment.
- **Tailwind CSS:** For custom claymorphic utility classes.
- **Mermaid.js:** Client-side architectural diagram rendering.
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

---

## 📄 License & Credits
Built with ❤️ for the **LabLab AI Agents Hackathon**.
Licensed under the **MIT License**.
