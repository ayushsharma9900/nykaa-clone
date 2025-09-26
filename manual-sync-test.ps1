# Manual Sync Categories Test
Write-Host "🔄 Testing Sync Categories Function..." -ForegroundColor Cyan

# Test 1: Check backend health
Write-Host "`n1️⃣ Testing backend health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -Method GET
    Write-Host "✅ Backend is healthy: $($healthResponse.message)" -ForegroundColor Green
    Write-Host "📊 Database status: $($healthResponse.database.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get current categories status
Write-Host "`n2️⃣ Getting current categories..." -ForegroundColor Yellow
try {
    $debugResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/menu-management/debug/categories" -Method GET -Headers @{"Authorization"="Bearer fake-token"}
    Write-Host "📋 Total categories: $($debugResponse.summary.total)" -ForegroundColor Green
    Write-Host "✅ Active categories: $($debugResponse.summary.active)" -ForegroundColor Green
    Write-Host "👁️ Visible in menu: $($debugResponse.summary.visibleInMenu)" -ForegroundColor Green
    Write-Host "🎯 Displayable in frontend: $($debugResponse.summary.displayableInFrontend)" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not get categories status: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Execute sync
Write-Host "`n3️⃣ Executing sync categories..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $body = @{} | ConvertTo-Json
    
    $syncResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/menu-management/sync-categories" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Sync successful!" -ForegroundColor Green
    Write-Host "📝 Message: $($syncResponse.message)" -ForegroundColor Green
    Write-Host "📊 Categories synced: $($syncResponse.synced)" -ForegroundColor Green
    Write-Host "🔄 Active status synced: $($syncResponse.syncedActiveStatus)" -ForegroundColor Green
} catch {
    Write-Host "❌ Sync failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Verify final status
Write-Host "`n4️⃣ Verifying final status..." -ForegroundColor Yellow
try {
    $finalResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/menu-management/debug/categories" -Method GET -Headers @{"Authorization"="Bearer fake-token"}
    Write-Host "📋 Final status:" -ForegroundColor Green
    Write-Host "   Total: $($finalResponse.summary.total)" -ForegroundColor White
    Write-Host "   Active: $($finalResponse.summary.active)" -ForegroundColor White
    Write-Host "   Visible in menu: $($finalResponse.summary.visibleInMenu)" -ForegroundColor White
    Write-Host "   Displayable: $($finalResponse.summary.displayableInFrontend)" -ForegroundColor White
} catch {
    Write-Host "❌ Could not verify final status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Cyan
