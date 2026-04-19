Write-Host "🎨 Starting PandaStore Frontend..." -ForegroundColor Cyan

# Check for node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing Node Dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the dev server
Write-Host "🔥 Frontend Launching at http://localhost:3000" -ForegroundColor Green
npm run dev
