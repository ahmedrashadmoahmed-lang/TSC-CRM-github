@echo off
echo ========================================
echo   PostgreSQL Database Setup Script
echo ========================================
echo.

REM Check if PostgreSQL service is running
echo Checking PostgreSQL service...
sc query postgresql-x64-16 | find "RUNNING" >nul
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL service is not running. Starting it...
    net start postgresql-x64-16
    timeout /t 3 >nul
) else (
    echo PostgreSQL service is already running.
)

echo.
echo Creating database 'erp_database'...
echo.

REM Create database
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE erp_database;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database 'erp_database' created successfully!
) else (
    echo.
    echo Database might already exist or there was an error.
    echo Trying to connect to verify...
    "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d erp_database -c "SELECT version();" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Database 'erp_database' exists and is accessible!
    ) else (
        echo ❌ Could not create or access database.
        echo.
        echo Please try manually:
        echo 1. Open pgAdmin 4
        echo 2. Connect to PostgreSQL 16
        echo 3. Right-click on Databases
        echo 4. Create → Database
        echo 5. Name: erp_database
    )
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
pause
