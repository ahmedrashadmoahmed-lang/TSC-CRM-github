import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
    console.log('🔧 Creating test user...\n');

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: 'admin@testcompany.local' }
        });

        if (existingUser) {
            console.log('✅ User already exists!');
            console.log('Email:', existingUser.email);
            console.log('Role:', existingUser.role);
            console.log('\n🔑 Login credentials:');
            console.log('Email: admin@testcompany.local');
            console.log('Password: Test123!');
            return;
        }

        // Find or create tenant
        let tenant = await prisma.tenant.findFirst({
            where: { domain: 'testcompany.local' }
        });

        if (!tenant) {
            console.log('Creating tenant...');
            tenant = await prisma.tenant.create({
                data: {
                    name: 'Test Company Ltd',
                    domain: 'testcompany.local',
                },
            });
            console.log('✅ Tenant created:', tenant.name);
        }

        // Create user
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        const user = await prisma.user.create({
            data: {
                name: 'Test Admin',
                email: 'admin@testcompany.local',
                password: hashedPassword,
                role: 'admin',
                tenantId: tenant.id,
                status: 'active',
            },
        });

        console.log('\n✅ User created successfully!');
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('\n🔑 Login credentials:');
        console.log('Email: admin@testcompany.local');
        console.log('Password: Test123!');
        console.log('\n🌐 Login at: http://localhost:3000/auth/signin');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
