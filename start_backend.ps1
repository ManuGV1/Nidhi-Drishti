# NIDHI DRISHTI — Backend Startup Script
# Starts the FastAPI backend silently in the background.
# Run this once; backend persists until you close the terminal or kill it.

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PYTHON = if (Test-Path "$PROJECT_ROOT\.venv\Scripts\python.exe") { "$PROJECT_ROOT\.venv\Scripts\python.exe" } else { "python" }
$PORT = 8000
$HOST = "0.0.0.0"

# Check if already running on port 8000
$existing = netstat -ano 2>$null | Select-String ":$PORT\s" | Select-String "LISTENING"
if ($existing) {
    Write-Host "✅ FastAPI backend already running on http://localhost:$PORT" -ForegroundColor Green
    Write-Host "   Docs: http://localhost:$PORT/docs" -ForegroundColor Cyan
    exit 0
}

Write-Host "🚀 Starting NIDHI DRISHTI FastAPI backend on http://localhost:$PORT ..." -ForegroundColor Yellow

# Start uvicorn as a background job
Start-Job -ScriptBlock {
    param($python, $root, $port, $host_addr)
    Set-Location $root
    & $python -m uvicorn backend.main:app --host $host_addr --port $port
} -ArgumentList $PYTHON, $PROJECT_ROOT, $PORT, $HOST | Out-Null

# Wait up to 10 seconds for the server to become available
$maxWait = 10
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$PORT/" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Backend online! http://localhost:$PORT" -ForegroundColor Green
        Write-Host "   API Docs: http://localhost:$PORT/docs" -ForegroundColor Cyan
        exit 0
    } catch {
        Write-Host "   Waiting... ($waited/$maxWait)" -ForegroundColor DarkGray
    }
}

Write-Host "⚠️  Backend did not respond within $maxWait seconds. Check for errors." -ForegroundColor Red
exit 1
