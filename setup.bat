@echo off
echo ========================================
echo   ERP System - Complete Setup
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [3/5] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file
    echo.
    echo IMPORTANT: Please edit .env file and add your PostgreSQL password!
    echo Press any key after you've edited .env file...
    pause >nul
) else (
    echo ✓ .env file already exists
)
echo.

echo [4/5] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma Client!
    pause
    exit /b 1
)
echo ✓ Prisma Client generated
echo.

echo [5/5] Creating database tables...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database tables!
    echo Make sure PostgreSQL is running and .env is configured correctly.
    pause
    exit /b 1
)
echo ✓ Database tables created
echo.

echo ========================================
echo   Setup Complete! 🎉
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
