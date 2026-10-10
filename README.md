# Axiom Parser

Axiom Parser is a robust, full-stack web application designed for analyzing legal and business documents (PDF/DOCX). It intelligently leverages Google's Gemini models to extract risks, deadlines, obligations, and key clauses using a highly resilient extraction pipeline. 

Initially built for the Centle AI Tricity Hackathon, the platform features a sleek, legal-tech UI and hardened reliability layers to prevent data loss or blocking on transient AI/Database errors.

## Features
- **Intelligent Extraction:** Employs the `google-genai` SDK and structured outputs to dissect documents logically.
- **Fail-Safe Architecture:** Handles LLM API rate limits (429) and timeouts dynamically with exponential backoff and designated fallback models (e.g. `gemini-3.5-flash`).
- **Database Resilience:** Features a wrapped `asyncpg` context manager that gracefully survives Neon scale-from-zero latency spikes.
- **Dynamic Frontend:** Built with React + Vite, featuring bespoke vanilla CSS variables, interactive drag-and-drop zones, progressive loading steppers, and pulse-animated source-quote scrolling.
- **Smart Validation:** Upholds strict transactional integrity. Raw documents are only pushed to Cloudflare R2 and PostgreSQL *after* a successful LLM inference, preventing phantom rows or ghost files.

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Create a virtual environment: `python3 -m venv venv`
3. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install requirements: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your credentials for Gemini, Neon Postgres, and Cloudflare R2.
   - *Optional:* Define `GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL` to override default models.
6. Run the FastAPI development server: `uvicorn main:app --reload`
7. A health check is available at `GET /api/health` returning `{"status": "ok"}`.

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. The frontend `client.js` is engineered to respect the `VITE_API_BASE_URL`. If unset in production, it will explicitly fault rather than failing silently to `localhost`.
4. Run the Vite development server: `npm run dev`

## Building and Deployment

You can seamlessly build the entire stack into a single-deployable unit using the provided `build.sh` script in the root directory.

```bash
chmod +x build.sh
./build.sh
```

The script will compile the React app into `frontend/dist` and set up the Python environment. The FastAPI backend is configured to automatically serve the static React application and handle SPA fallback routing on port 8000.

**For full production deployment instructions on a GCP e2-micro VM, please read `DEPLOYMENT.md`.**

**For core architectural decisions, trade-offs, and design patterns, please read `HANDOFF.md`.**
