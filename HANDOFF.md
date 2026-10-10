# Axiom Parser: Architectural Handoff & Decisions

This document outlines the core architectural decisions, technology choices, and design patterns implemented in the Axiom Parser project during the Centle AI Tricity Hackathon, as well as the robust reliability and visual updates applied thereafter.

## 1. System Architecture
Axiom Parser is designed as a single-deployable unit (Monolith) consisting of a React frontend served directly via a FastAPI backend. This was explicitly chosen to minimize operational overhead and run smoothly within the 1GB RAM constraints of a GCP e2-micro VM without requiring multiple containers or reverse proxies.

- **Backend:** Python 3.11 with FastAPI.
- **Frontend:** React + Vite (built as static files and mounted on FastAPI).
- **Database:** PostgreSQL hosted on Neon Serverless.
- **Object Storage:** Cloudflare R2 (S3-compatible) via `boto3`.
- **LLM:** Google Gemini API (Configurable models via `GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL`).

## 2. Core Decisions & Trade-offs

### 2.1 Gemini Resilience & Fallback Strategies
- **Decision:** Shifted hardcoded models into `.env` configurations and established strict, per-model retry plans via an abstracted resilience wrapper.
- **Reasoning:** In production, AI APIs frequently experience transient issues (429s, 503s). We enforce a strict 30,000ms SDK timeout, intercepting long requests and network failures. The application will attempt the primary model (`gemini-3.8-flash` or custom `.env` model) up to 3 times with exponential backoff (1s, 2s). If exhausted, it safely downgrades to a configured fallback model (e.g., `gemini-3.5-flash`) for subsequent attempts before gracefully raising a `GeminiUnavailableError` and relaying a `503 Service Unavailable` to the client.

### 2.2 Synchronous Processing & Loud Failures
- **Decision:** Document analysis occurs synchronously within the HTTP request lifecycle. Database insertions and R2 uploads are postponed until *after* the Gemini inference successfully concludes.
- **Reasoning:** Due to strict memory boundaries (1GB RAM VM), we avoided heavy background frameworks like Celery. Delaying DB/R2 operations prevents ghost data (where a document exists without findings). If Gemini fails or produces zero findings for a massive document, the system bails out loudly with a `502` or `503`, guaranteeing database consistency and explicitly showing real error messages to the user.

### 2.3 Extraction Pipeline (Paragraph Indexing vs. Pagination)
- **Decision:** Unifying `location_ref` logic for both PDF and DOCX formats.
- **Reasoning:** `PyMuPDF` parses PDFs into massive "page" blobs, while `python-docx` parses Word documents into discrete paragraph segments. We unified the frontend and backend to treat `location_ref` merely as an integer block identifier. The frontend renders the raw text segments from the API and runs a literal substring match against the `source_quote` inside the active `location_ref` node. This guarantees perfect highlighting and scrolling regardless of the file format.

### 2.4 Cloudflare R2 Raw Storage
- **Decision:** Uploading raw document bytes directly to Cloudflare R2.
- **Reasoning:** Cloudflare R2 has zero egress fees. The raw document is offloaded safely to prevent long-term memory bloating. For retrieval, the app generates short-lived presigned URLs.

### 2.5 PostgreSQL (Neon) Database Schema & Reliability
- **Decision:** Saving text segments as a `JSONB` array alongside document metadata and wrapping `asyncpg` pools in a backoff interceptor.
- **Reasoning:** Storing `segments` in `JSONB` allows the frontend to reconstruct the full document viewer UI purely from the database on page reload, avoiding secondary extraction loops. Furthermore, Neon connections can be unstable on serverless scale-from-zero triggers. We heavily bounded the connection pool (`min_size=1`, `max_size=3`) to respect VM limits and wrapped pool acquisition in an exponential backoff loop (`1s, 2s, 4s`), gracefully recovering from `PostgresConnectionError` spikes.

### 2.6 Custom CSS Design System
- **Decision:** Built a bespoke, vanilla CSS variable-driven design system (`index.css`) rather than strapping in external heavy libraries like Tailwind or Material UI.
- **Reasoning:** Emphasized a clean, professional legal-tech UI aesthetic (deep indigos, neutral grays, 8px spacing scales). By abstaining from massive utility frameworks, we retained a minuscule frontend footprint and guaranteed granular control over animations (such as the pulse-highlight scrolling logic in the Document Viewer) and stepper UI dynamics during the extraction phase.

### 2.7 Deployment Strategy (Single Worker)
- **Decision:** Uvicorn is explicitly clamped to `--workers 1` in `axiom-parser.service`.
- **Reasoning:** Multiple workers would clone the Python interpreter in memory. On an e2-micro VM (1GB RAM), processing a 10MB PDF with 2 or 3 active workers would immediately trigger the Linux OOM (Out Of Memory) killer.

## 3. Future Improvements (V2)
- **Streaming Uploads:** Currently, `await file.read()` buffers the file into RAM before sending to R2. For massive documents (100MB+), this should be transitioned to a stream using `file.file` directly.
- **WebSockets:** If the synchronous HTTP request times out on massive documents, the architecture should be migrated to a lightweight async `asyncio.create_task()` background worker combined with WebSockets/SSE to notify the frontend when analysis is complete.
