# Axiom Parser: Architectural Handoff & Decisions

This document outlines the core architectural decisions, technology choices, and design patterns implemented in the Axiom Parser project during the Centle AI Tricity Hackathon.

## 1. System Architecture
Axiom Parser is designed as a single-deployable unit (Monolith) consisting of a React frontend served directly via a FastAPI backend. This was explicitly chosen to minimize operational overhead and run smoothly within the 1GB RAM constraints of a GCP e2-micro VM without requiring multiple containers or reverse proxies.

- **Backend:** Python 3.11 with FastAPI.
- **Frontend:** React + Vite (built as static files and mounted on FastAPI).
- **Database:** PostgreSQL hosted on Neon Serverless.
- **Object Storage:** Cloudflare R2 (S3-compatible) via `boto3`.
- **LLM:** Google Gemini API (`gemini-3.8-flash`).

## 2. Core Decisions & Trade-offs

### 2.1 Gemini Model Version (`gemini-3.8-flash`)
- **Decision:** Shifted from `gemini-2.5-flash` to `gemini-3.8-flash`.
- **Reasoning:** During testing, the `2.5-flash` model returned `404 NOT_FOUND` as it was deprecated for new API keys. The update to `3.8-flash` natively supports the `google-genai` SDK and structured outputs via `response_schema` with a highly tuned temperature (`0.1`) for strict data extraction recall.

### 2.2 Synchronous Processing vs. Background Jobs
- **Decision:** Document analysis occurs synchronously within the HTTP request lifecycle.
- **Reasoning:** Due to the strict 1GB RAM VM limit, we avoided heavy background frameworks like Celery or Redis. The document text is extracted, analyzed by Gemini, and stored sequentially. While this means the client waits on the HTTP request, it drastically reduces infrastructure complexity and memory footprint.

### 2.3 Extraction Pipeline (Paragraph Indexing vs. Pagination)
- **Decision:** Unifying `location_ref` logic for both PDF and DOCX formats.
- **Reasoning:** `PyMuPDF` parses PDFs into massive "page" blobs, while `python-docx` parses Word documents into discrete paragraph segments. We unified the frontend and backend to treat `location_ref` merely as an integer block identifier. The frontend renders the raw text segments from the API and runs a literal substring match against the `source_quote` inside the active `location_ref` node. This guarantees perfect highlighting and scrolling regardless of the file format.

### 2.4 Cloudflare R2 Raw Storage
- **Decision:** Uploading raw document bytes directly to Cloudflare R2 before extraction, mapped via UUID.
- **Reasoning:** Cloudflare R2 has zero egress fees. The raw document is immediately offloaded from the backend to prevent long-term memory bloating. For retrieval, the app generates short-lived presigned URLs.

### 2.5 PostgreSQL (Neon) Database Schema
- **Decision:** Saving text segments as a `JSONB` array alongside document metadata.
- **Reasoning:** The document schema uses `JSONB` to store the raw text segments (`{"location_ref": 1, "text": "..."}`). This allows the frontend to reconstruct the full document viewer UI purely from the database on page reload, completely avoiding a secondary extraction or R2 fetch loop just to display the visual text layout.

### 2.6 Deployment Strategy (Single Worker)
- **Decision:** Uvicorn is explicitly clamped to `--workers 1` in `axiom-parser.service`.
- **Reasoning:** Multiple workers would clone the Python interpreter in memory. On an e2-micro VM (1GB RAM), processing a 10MB PDF with 2 or 3 active workers would immediately trigger the Linux OOM (Out Of Memory) killer.

## 3. Future Improvements (V2)
- **Streaming Uploads:** Currently, `await file.read()` buffers the file into RAM before sending to R2. For massive documents (100MB+), this should be transitioned to a stream using `file.file` directly.
- **WebSockets:** If the synchronous HTTP request times out on massive documents, the architecture should be migrated to a lightweight async `asyncio.create_task()` background worker combined with WebSockets/SSE to notify the frontend when analysis is complete.
