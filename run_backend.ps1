Write-Host "🚀 Starting PandaStore Backend..." -ForegroundColor Cyan

# Ensure we are in the root directory
if (Test-Path "backend") {
    Set-Location "backend"
}

# Check for virtual environment
if (Test-Path "venv") {
    Write-Host "📦 Activating Virtual Environment..." -ForegroundColor Green
    .\venv\Scripts\activate
}

# Install dependencies
Write-Host "📥 Installing Dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start the server
Write-Host "🔥 Server Launching at http://localhost:8000" -ForegroundColor Green
uvicorn main:app --reload --host 0.0.0.0 --port 8000
