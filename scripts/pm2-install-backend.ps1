<#
Usage (PowerShell as Administrator):
  .\pm2-install-backend.ps1 -AppPath 'C:\inetpub\wwwroot\backend' -Port 5005

What this does:
- Installs pm2 (globally) and starts the backend using pm2 so it can be supervised.
- Saves the pm2 process list so pm2 can be restored by a Windows service.

Notes:
- To make pm2 run at Windows boot you can install the pm2 Windows service helper (pm2-windows-service) manually.
#>

param(
    [string]$AppPath = "C:\path\to\backend",
    [int]$Port = 5005
)

Write-Host "Starting PM2 setup for backend at: $AppPath (PORT=$Port)"

if (-not (Test-Path $AppPath)) {
    Write-Error "AppPath does not exist: $AppPath"
    exit 1
}

# Install pm2 and helper (may require admin privileges)
Write-Host "Installing pm2 and pm2-windows-service (global npm packages)..."
npm i -g pm2
npm i -g pm2-windows-service

# Start the backend with pm2 using npm start in the backend folder
Write-Host "Starting backend with pm2 (name=swadika-backend)..."
# pass environment variables via --update-env and ensure they are set in the env or .env.production file
pm2 start npm --name "swadika-backend" -- start --prefix "$AppPath" --update-env -- -p $Port

Write-Host "Saving pm2 process list..."
pm2 save

Write-Host "PM2 entries created. To install PM2 as a Windows service so it restarts on boot, run the following (manual step):"
Write-Host "  pm2-service-install -n PM2" -ForegroundColor Cyan

Write-Host "Done. Verify with: pm2 ls"
