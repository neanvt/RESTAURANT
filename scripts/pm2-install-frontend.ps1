<#
Usage (PowerShell as Administrator):
.
  .\pm2-install-frontend.ps1 -AppPath 'C:\inetpub\wwwroot\frontend' -Port 3000

What this does:
- Installs pm2 (globally) and starts the frontend using pm2 so it can be supervised.
- Saves the pm2 process list so pm2 can be restored by a Windows service.

Notes:
- To make pm2 run at Windows boot you can install the pm2 Windows service helper (pm2-windows-service) manually.
#>

param(
    [string]$AppPath = "C:\path\to\frontend",
    [int]$Port = 3000
)

Write-Host "Starting PM2 setup for frontend at: $AppPath (PORT=$Port)"

if (-not (Test-Path $AppPath)) {
    Write-Error "AppPath does not exist: $AppPath"
    exit 1
}

# Install pm2 and helper (may require admin privileges)
Write-Host "Installing pm2 and pm2-windows-service (global npm packages)..."
npm i -g pm2
npm i -g pm2-windows-service

# Start the app using npm start via pm2
Write-Host "Starting frontend with pm2 (name=swadika-frontend)..."
pm2 start npm --name "swadika-frontend" -- start --prefix "$AppPath" --update-env -- -p $Port

Write-Host "Saving pm2 process list..."
pm2 save

Write-Host "PM2 entries created. To install PM2 as a Windows service so it restarts on boot, run the following (manual step):"
Write-Host "  pm2-service-install -n PM2" -ForegroundColor Cyan
Write-Host "Or follow the pm2-windows-service README: https://www.npmjs.com/package/pm2-windows-service"

Write-Host "Done. Verify with: pm2 ls"
