<#
Usage (PowerShell as Administrator):
  .\nssm-install-backend.ps1 -NssmPath 'C:\tools\nssm\nssm.exe' -AppPath 'C:\inetpub\wwwroot\backend' -ServiceName 'swadika-backend' -Port 5005

What this does:
- Uses NSSM (nssm.exe) to create a Windows service that runs `npm run start` in the backend folder.

Notes:
- Download NSSM and provide the path to nssm.exe in -NssmPath.
#>

param(
    [string]$NssmPath = "C:\\tools\\nssm\\nssm.exe",
    [string]$AppPath = "C:\\path\\to\\backend",
    [string]$ServiceName = "swadika-backend",
    [int]$Port = 5005
)

if (-not (Test-Path $NssmPath)) {
    Write-Error "nssm.exe not found at $NssmPath. Please download NSSM and pass -NssmPath accordingly."
    exit 1
}

if (-not (Test-Path $AppPath)) {
    Write-Error "AppPath does not exist: $AppPath"
    exit 1
}

$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $npmCmd) { $npmCmd = "C:\\Program Files\\nodejs\\npm.cmd" }

Write-Host "Creating NSSM service '$ServiceName' to run npm run start in $AppPath"

# Install service: program = npm.cmd, args = run start
& $NssmPath install $ServiceName $npmCmd run start

# Set the AppDirectory so npm runs in the right folder
& $NssmPath set $ServiceName AppDirectory $AppPath

## Set environment variables for the service
& $NssmPath set $ServiceName AppEnvironmentExtra "PORT=$Port;NODE_ENV=production;ALLOWED_ORIGINS=https://swadika.utkranti.app"

Write-Host "Service created. Start it with: nssm start $ServiceName"
