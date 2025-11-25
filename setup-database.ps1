# ========================================
# Database Setup Script for ERP System
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ERP Database Setup - PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostgreSQL Installation
Write-Host "[1/5] Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first or add it to your PATH" -ForegroundColor Red
    Write-Host "Installation file: postgresql-18.1-1-windows-x64.exe" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check if .env file exists
Write-Host "[2/5] Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    
    # Read DATABASE_URL
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match 'DATABASE_URL="([^"]+)"') {
        $dbUrl = $matches[1]
        if ($dbUrl -like "*your_password*") {
            Write-Host "⚠ WARNING: You need to update the password in .env file!" -ForegroundColor Yellow
            Write-Host "  Please replace 'your_password' with your actual PostgreSQL password" -ForegroundColor Yellow
            Write-Host ""
            $continue = Read-Host "Have you updated the password? (y/n)"
            if ($continue -ne "y") {
                Write-Host "Please update .env file and run this script again" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "✓ DATABASE_URL is configured" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create Database
Write-Host "[3/5] Creating database..." -ForegroundColor Yellow
Write-Host "Please enter your PostgreSQL password when prompted" -ForegroundColor Cyan

# Check if database exists
$dbExists = psql -U postgres -lqt 2>$null | Select-String -Pattern "erp_database"

if ($dbExists) {
    Write-Host "✓ Database 'erp_database' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating database 'erp_database'..." -ForegroundColor Cyan
    $createDb = "CREATE DATABASE erp_database;"
    echo $createDb | psql -U postgres 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        Write-Host "Please create it manually using pgAdmin or psql" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Step 4: Install Dependencies
Write-Host "[4/5] Installing dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 5: Setup Prisma
Write-Host "[5/5] Setting up database schema..." -ForegroundColor Yellow

Write-Host "  → Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "  → Creating database tables..." -ForegroundColor Cyan
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create database tables" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database schema created successfully" -ForegroundColor Green

Write-Host ""

# Optional: Seed Database
Write-Host "========================================" -ForegroundColor Cyan
$seedChoice = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($seedChoice -eq "y") {
    Write-Host "Seeding database..." -ForegroundColor Cyan
    node prisma/seed.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Seeding failed or was skipped" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "  2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  3. (Optional) Run 'npx prisma studio' to view database" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
