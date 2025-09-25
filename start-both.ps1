Write-Host "Starting Nykaa Clone - Frontend and Backend" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Start backend in a new PowerShell window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\resale gallery\nykaa-clone\backend'; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\resale gallery\nykaa-clone'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting in separate windows:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:5001" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
