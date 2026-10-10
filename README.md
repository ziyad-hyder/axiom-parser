# Axiom Parser

Axiom Parser is a tool for analyzing legal/business documents (PDF/DOCX) using Google's Gemini 3.8 Flash to intelligently extract risks, deadlines, obligations, and key clauses. Built for the Centle AI Tricity Hackathon.

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Create a virtual environment: `python3 -m venv venv`
3. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install requirements: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your credentials for Gemini, Neon Postgres, and Cloudflare R2.
6. Run the FastAPI development server: `uvicorn main:app --reload`

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the Vite development server: `npm run dev`

## Building and Deployment

You can seamlessly build the entire stack into a single-deployable unit using the provided `build.sh` script in the root directory.

```bash
chmod +x build.sh
./build.sh
```

The script will compile the React app into `frontend/dist` and set up the Python environment. The FastAPI backend is configured to automatically serve the static React application and handle SPA fallback routing on port 8000.

**For full production deployment instructions on a GCP e2-micro VM, please read `DEPLOYMENT.md`.**

**For core architectural decisions, trade-offs, and design patterns, please read `HANDOFF.md`.**
