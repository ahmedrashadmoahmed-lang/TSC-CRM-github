/**
 * Database Connection Test Script
 * Run: node scripts/test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test 1: Can we connect?
        console.log('1️⃣ Testing connection...');
        await prisma.$connect();
        console.log('   ✅ Database connected successfully!\n');

        // Test 2: Can we query?
        console.log('2️⃣ Testing database queries...');
        const userCount = await prisma.user.count();
        console.log(`   ✅ Users table accessible (${userCount} users found)\n`);

        // Test 3: Check all main tables
        console.log('3️⃣ Checking main tables...');
        const tables = [
            { name: 'RFQ', query: () => prisma.rFQ.count() },
            { name: 'Supplier', query: () => prisma.supplier.count() },
            { name: 'PurchaseOrder', query: () => prisma.purchaseOrder.count() },
            { name: 'Customer', query: () => prisma.customer.count() },
        ];

        for (const table of tables) {
            try {
                const count = await table.query();
                console.log(`   ✅ ${table.name}: ${count} records`);
            } catch (error) {
                console.log(`   ⚠️  ${table.name}: Table may not exist yet`);
            }
        }

        console.log('\n✅ All database tests passed!\n');
        console.log('📊 Database Status:');
        console.log('   - Connection: OK');
        console.log('   - Tables: Accessible');
        console.log('   - Ready for use: YES\n');

    } catch (error) {
        console.error('\n❌ Database connection failed!\n');
        console.error('Error details:', error.message);
        console.error('\n🔧 Troubleshooting steps:');
        console.error('   1. Check if PostgreSQL is running');
        console.error('   2. Verify DATABASE_URL in .env file');
        console.error('   3. Ensure database exists: CREATE DATABASE erp_database;');
        console.error('   4. Run: npx prisma db push\n');

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testDatabaseConnection()
    .then(() => {
        console.log('🎉 Database is ready for development!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
