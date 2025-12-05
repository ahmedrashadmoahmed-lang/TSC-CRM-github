# 🚀 Database Setup Guide

## Prerequisites

1. **PostgreSQL Installation**
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

2. **Verify Installation**
   ```bash
   psql --version
   # Should output: psql (PostgreSQL) 14.x or higher
   ```

---

## Step-by-Step Setup

### 1. Create Database

Open PowerShell or Command Prompt:

```bash
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres

# Create database
CREATE DATABASE erp_database;

# Verify it was created
\l

# Exit psql
\q
```

### 2. Configure Environment Variables

Copy the example file and update it:

```bash
# Copy template
cp .env.example .env

# Edit .env file and update:
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/erp_database"
```

**Important**: Replace:
- `postgres` with your PostgreSQL username
- `yourpassword` with your PostgreSQL password
- `5432` with your PostgreSQL port (default is 5432)

### 3. Apply Database Schema

```bash
# Push Prisma schema to database
npx prisma db push

# Expected output:
# ✔ Your database is now in sync with your Prisma schema.
```

### 4. Test Database Connection

```bash
# Run connection test
node scripts/test-db-connection.js

# Expected output:
# ✅ Database connected successfully!
# ✅ Users table accessible
# ✅ All database tests passed!
```

### 5. Seed Test Data

```bash
# Populate database with test data
npx prisma db seed

# Expected output:
# ✅ Created 3 users
# ✅ Created 4 suppliers
# ✅ Created 2 customers
# ✅ Created 3 RFQs
# ✅ Created 1 purchase order
```

---

## Verification

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

This will open http://localhost:5555 where you can:
- View all tables
- Browse seed data
- Manually edit records

### Test Login

After seeding, you can login with:
- **Admin**: admin@erp.com / password123
- **Manager**: manager@erp.com / password123
- **User**: user@erp.com / password123

---

## Troubleshooting

### ❌ "Can't reach database server"

**Solutions**:
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Start if not running
   Start-Service postgresql-x64-14
   ```

2. Verify port in .env matches PostgreSQL port:
   ```bash
   # Check PostgreSQL port
   psql -U postgres -c "SHOW port;"
   ```

3. Check PostgreSQL logs:
   ```
   C:\Program Files\PostgreSQL\14\data\log\
   ```

### ❌ "Authentication failed"

**Solutions**:
1. Verify username and password in .env
2. Reset PostgreSQL password:
   ```bash
   psql -U postgres
   ALTER USER postgres PASSWORD 'newpassword';
   ```

### ❌ "Database does not exist"

**Solution**:
```bash
psql -U postgres -c "CREATE DATABASE erp_database;"
```

### ❌ Seed script fails

**Solutions**:
1. Ensure schema is applied first:
   ```bash
   npx prisma db push
   ```

2. Check for missing dependencies:
   ```bash
   npm install bcryptjs
   ```

---

## Database Management Commands

```bash
# View database schema
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy
```

---

## Next Steps

Once database is setup:
1. ✅ Run `npm run dev` to start the application
2. ✅ Navigate to http://localhost:3000
3. ✅ Login with test credentials
4. ✅ Test RFQ workflows

---

## Support

If you encounter issues:
1. Check PostgreSQL logs
2. Verify .env configuration
3. Run `node scripts/test-db-connection.js`
4. Check Prisma documentation: https://www.prisma.io/docs
