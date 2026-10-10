# Axiom Parser Deployment Guide (Decoupled Architecture)

Axiom Parser uses a decoupled deployment model:
- **Frontend**: Deployed to Cloudflare Pages (auto-builds from GitHub).
- **Backend**: Deployed to an OCI VM (Ubuntu, e2-micro equivalent) via `scp`/`rsync` directly. It is explicitly kept out of the Git repository for security and isolation.

---

## 1. Backend Deployment (OCI VM)

### A. Initial VM Setup
SSH into your VM and install dependencies:
```bash
sudo apt update
sudo apt install -y python3-pip python3-venv git
```

### B. Transfer Backend Files
From your local machine, securely copy the `backend` folder and systemd service file to the VM. Do this inside your project root:
```bash
rsync -avz --exclude 'venv' --exclude '__pycache__' ./backend/ ubuntu@<YOUR_VM_IP>:/home/ubuntu/axiom-parser-backend/
scp ./axiom-parser.service ubuntu@<YOUR_VM_IP>:/home/ubuntu/axiom-parser-backend/
```

### C. Build Backend
SSH into the VM, navigate to the backend folder, and install requirements:
```bash
cd /home/ubuntu/axiom-parser-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### D. Environment Variables
Create the production environment file on the VM:
```bash
nano /home/ubuntu/axiom-parser-backend/.env.production
```
Paste and fill in the following:
```env
# /home/ubuntu/axiom-parser-backend/.env.production
GEMINI_API_KEY=your_gemini_api_key
NEON_DATABASE_URL=your_neon_pg_connection_string
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=centle
R2_ENDPOINT=https://your_r2_account_id.r2.cloudflarestorage.com
# Allow CORS for your Cloudflare Pages frontend
ALLOWED_ORIGINS=https://axiom-parser.pages.dev,http://localhost:5173
```

### E. Setup Systemd Service
```bash
cd /home/ubuntu/axiom-parser-backend
sudo cp axiom-parser.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable axiom-parser
sudo systemctl start axiom-parser
```
*Verify it's running: `sudo journalctl -u axiom-parser -f`*

---

## 2. Frontend Deployment (Cloudflare Pages)

The frontend is deployed automatically via Cloudflare Pages by linking your GitHub repository.

### A. Configure Cloudflare Pages
1. Go to the Cloudflare Dashboard -> Pages -> Create a project -> Connect to Git.
2. Select your `axiom-parser` repository.
3. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory (advanced)**: `/frontend`

### B. Set Environment Variables
In the Cloudflare Pages settings (Environment variables section), add the API URL pointing to your backend VM:
- **Variable name**: `VITE_API_BASE_URL`
- **Value**: `http://<YOUR_VM_EXTERNAL_IP>:8000` *(Ensure port 8000 is open in your VM firewall)*

Save and Deploy. Cloudflare will automatically build and serve your static React frontend.

---

### Memory Safety Notes (Backend)
1. **Single Worker:** The `axiom-parser.service` explicitly runs `uvicorn` with `1` worker to avoid Linux OOM (Out Of Memory) killer.
2. **Buffer Spikes:** In `routes/analyze.py`, the flow reads the entire file into memory via `await file.read()`. This single byte payload is perfectly fine for typical 5-10MB PDFs, but massive 100MB+ documents will spike RAM significantly. 
3. **No Unbounded Caches:** The application does not use any global dictionaries or unbounded in-memory caches.
