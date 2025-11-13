<#
Usage (PowerShell as Administrator):
  .\nssm-install-frontend.ps1 -NssmPath 'C:\tools\nssm\nssm.exe' -AppPath 'C:\inetpub\wwwroot\frontend' -ServiceName 'swadika-frontend' -Port 3000

What this does:
- Uses NSSM (nssm.exe) to create a Windows service that runs `npm run start` in the frontend folder.

Notes:
- Download NSSM and provide the path to nssm.exe in -NssmPath.
#>

param(
    [string]$NssmPath = "C:\\tools\\nssm\\nssm.exe",
    [string]$AppPath = "C:\\path\\to\\frontend",
    [string]$ServiceName = "swadika-frontend",
    [int]$Port = 3000
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

# Set environment variables (AppEnvironmentExtra expects lines separated by '\n')
& $NssmPath set $ServiceName AppEnvironmentExtra "PORT=$Port;NODE_ENV=production"

Write-Host "Service created. Start it with: nssm start $ServiceName"
