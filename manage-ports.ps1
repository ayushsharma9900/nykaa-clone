# PowerShell script to manage ports for Nykaa Clone development

param(
    [string]$Action = "check",
    [int[]]$Ports = @(3000, 5001)
)

function Show-Help {
    Write-Host "Port Management Script for Nykaa Clone" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\manage-ports.ps1 check        # Check what's running on default ports"
    Write-Host "  .\manage-ports.ps1 kill         # Kill processes on default ports"
    Write-Host "  .\manage-ports.ps1 check -Ports 3000,5001,8080  # Check specific ports"
    Write-Host "  .\manage-ports.ps1 kill -Ports 3000     # Kill process on port 3000"
    Write-Host ""
    Write-Host "Default ports: 3000 (Frontend), 5001 (Backend)"
    Write-Host ""
}

function Check-Port {
    param([int]$Port)
    
    Write-Host "Checking port $Port..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Port $Port is in use by:" -ForegroundColor Red
                    Write-Host "    Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor White
                    Write-Host "    State: $($conn.State)" -ForegroundColor White
                } else {
                    Write-Host "  Port $Port is in use by unknown process" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  Port $Port is available" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Could not check port $Port" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Kill-Port {
    param([int]$Port)
    
    Write-Host "Attempting to free port $Port..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $processIds = $connections | ForEach-Object { $_.OwningProcess } | Sort-Object -Unique
            
            foreach ($pid in $processIds) {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                    try {
                        Stop-Process -Id $pid -Force
                        Write-Host "    Successfully killed process $pid" -ForegroundColor Green
                    } catch {
                        Write-Host "    Failed to kill process $pid" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host "  Port $Port is already free" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Could not access port $Port" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Main execution
switch ($Action.ToLower()) {
    "help" {
        Show-Help
        exit 0
    }
    "check" {
        Write-Host "=== Port Status Check ===" -ForegroundColor Cyan
        Write-Host ""
        
        foreach ($port in $Ports) {
            Check-Port -Port $port
        }
    }
    "kill" {
        Write-Host "=== Killing Processes on Ports ===" -ForegroundColor Cyan
        Write-Host ""
        
        $confirm = Read-Host "Are you sure you want to kill processes on ports $($Ports -join ', ')? (y/N)"
        if ($confirm -eq 'y' -or $confirm -eq 'Y') {
            foreach ($port in $Ports) {
                Kill-Port -Port $port
            }
            
            Write-Host "Waiting 2 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            
            Write-Host "Checking ports after cleanup:" -ForegroundColor Cyan
            foreach ($port in $Ports) {
                Check-Port -Port $port
            }
        } else {
            Write-Host "Operation cancelled." -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Invalid action: $Action" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}

Write-Host "Done!" -ForegroundColor Green
