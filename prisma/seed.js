/**
 * Simple Database Seed Script for SQLite
 * Run: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\\n');

    try {
        // Clear existing data
        console.log('🧹 Cleaning existing data...');
        await prisma.tenant.deleteMany();
        console.log('   ✅ Cleanup complete\\n');

        // 1. Create Tenant
        console.log('🏢 Creating tenant...');
        const tenant = await prisma.tenant.create({
            data: {
                name: 'Demo Company',
                domain: 'demo.erp.local',
                status: 'active',
            },
        });
        console.log('   ✅ Tenant created\\n');

        // 2. Create Users
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@erp.com',
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
                tenantId: tenant.id,
            },
        });

        const manager = await prisma.user.create({
            data: {
                email: 'manager@erp.com',
                name: 'Manager User',
                password: hashedPassword,
                role: 'MANAGER',
                tenantId: tenant.id,
            },
        });

        const user = await prisma.user.create({
            data: {
                email: 'user@erp.com',
                name: 'Regular User',
                password: hashedPassword,
                role: 'USER',
                tenantId: tenant.id,
            },
        });

        console.log(`   ✅ Created 3 users\\n`);

        // Summary
        console.log('✅ Database seeding completed successfully!\\n');
        console.log('📊 Summary:');
        console.log(`   - Tenant: ${tenant.name}`);
        console.log(`   - Users: 3 (Admin, Manager, User)\\n`);
        console.log('🔐 Login credentials:');
        console.log('   - admin@erp.com / password123');
        console.log('   - manager@erp.com / password123');
        console.log('   - user@erp.com / password123\\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log('🎉 Seed completed!\\n');
    })
    .catch(async (e) => {
        console.error('Error during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
