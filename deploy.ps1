$gh = "C:\Program Files\GitHub CLI\gh.exe"

# Start gh auth login in background
$outFile = "$env:TEMP\gh_deploy_out.txt"
$errFile = "$env:TEMP\gh_deploy_err.txt"
$proc = Start-Process -NoNewWindow -PassThru -FilePath $gh -ArgumentList "auth login --web -h github.com" -RedirectStandardOutput $outFile -RedirectStandardError $errFile

Start-Sleep -Seconds 4
$code = Get-Content $errFile -ErrorAction SilentlyContinue | Select-String -Pattern "[A-Z0-9]{4}-[A-Z0-9]{4}" | ForEach-Object { $_.Matches.Value }
Write-Host "CODE:$code"

# Wait for auth to complete (up to 5 min)
$start = Get-Date
do {
  Start-Sleep -Seconds 5
  $elapsed = (Get-Date) - $start
  if ($elapsed.TotalSeconds -gt 300) {
    Write-Host "TIMEOUT"
    exit 1
  }
} while (!$proc.HasExited)

# Check auth
$status = & $gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "AUTH FAILED"
  exit 1
}

Write-Host "AUTH OK"

# Set up remote and push
Set-Location "C:\Users\lkjk9\Desktop\realtime-caption\realtime-caption"
& $gh repo create realtime-caption --public --source=. --remote=origin --push
Write-Host "PUSH DONE"

# Enable Pages
& $gh api -X POST repos/leishushu319-sketch/realtime-caption/pages -f source.branch=gh-pages 2>&1
Write-Host "PAGES SETUP DONE"
