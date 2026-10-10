#!/bin/bash
set -e

echo "Starting Axiom Parser Build Pipeline..."

# 1. Build frontend
echo "Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Setup backend environment
echo "Setting up Python Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "Build complete! The application is ready for deployment."
echo "To run locally: cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000"
