# PostgreSQL Configuration Fix Script
# This script will fix PostgreSQL to accept TCP/IP connections

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PostgreSQL Configuration Fixer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find PostgreSQL data directory
$pgDataDir = "C:\Program Files\PostgreSQL\16\data"

if (!(Test-Path $pgDataDir)) {
    Write-Host "[ERROR] PostgreSQL data directory not found at: $pgDataDir" -ForegroundColor Red
    Write-Host "Please enter the correct path to PostgreSQL data directory:" -ForegroundColor Yellow
    $pgDataDir = Read-Host
}

Write-Host "[OK] Found PostgreSQL data directory: $pgDataDir" -ForegroundColor Green
Write-Host ""

# Backup configuration files
Write-Host "[INFO] Creating backups..." -ForegroundColor Yellow
Copy-Item "$pgDataDir\postgresql.conf" "$pgDataDir\postgresql.conf.backup" -Force
Copy-Item "$pgDataDir\pg_hba.conf" "$pgDataDir\pg_hba.conf.backup" -Force
Write-Host "[OK] Backups created" -ForegroundColor Green
Write-Host ""

# Fix postgresql.conf
Write-Host "[INFO] Fixing postgresql.conf..." -ForegroundColor Yellow
$pgConf = Get-Content "$pgDataDir\postgresql.conf"
$pgConf = $pgConf -replace "#listen_addresses = 'localhost'", "listen_addresses = '*'"
$pgConf = $pgConf -replace "listen_addresses = 'localhost'", "listen_addresses = '*'"
$pgConf | Set-Content "$pgDataDir\postgresql.conf"
Write-Host "[OK] postgresql.conf fixed" -ForegroundColor Green
Write-Host ""

# Fix pg_hba.conf
Write-Host "[INFO] Fixing pg_hba.conf..." -ForegroundColor Yellow
$hbaConf = Get-Content "$pgDataDir\pg_hba.conf"
$newLine = "host    all             all             127.0.0.1/32            md5"

if ($hbaConf -notcontains $newLine) {
    Add-Content "$pgDataDir\pg_hba.conf" ""
    Add-Content "$pgDataDir\pg_hba.conf" "# Allow local connections with password"
    Add-Content "$pgDataDir\pg_hba.conf" $newLine
}
Write-Host "[OK] pg_hba.conf fixed" -ForegroundColor Green
Write-Host ""

# Restart PostgreSQL service
Write-Host "[INFO] Restarting PostgreSQL service..." -ForegroundColor Yellow
try {
    Stop-Service postgresql-x64-16 -Force -ErrorAction Stop
    Start-Sleep -Seconds 2
    Start-Service postgresql-x64-16 -ErrorAction Stop
    Write-Host "[OK] PostgreSQL service restarted" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Failed to restart service. Please restart manually." -ForegroundColor Red
    Write-Host "Run: Restart-Service postgresql-x64-16" -ForegroundColor Yellow
}
Write-Host ""

# Test connection
Write-Host "[INFO] Testing connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$env:PGPASSWORD = "postgres"
try {
    $testResult = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Connection successful!" -ForegroundColor Green
        Write-Host ""
        
        # Create database
        Write-Host "[INFO] Creating database 'erp_database'..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE erp_database;" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Database created successfully!" -ForegroundColor Green
        }
        else {
            Write-Host "[INFO] Database might already exist" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "[ERROR] Connection failed. Error:" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
    }
}
catch {
    Write-Host "[ERROR] Connection test failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run db:push" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
