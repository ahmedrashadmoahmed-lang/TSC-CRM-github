const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
    console.log('🔐 Creating admin user...\n');

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@erp.com' }
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user with tenant
        const admin = await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@erp.com',
                password: hashedPassword,
                role: 'admin',
                tenant: {
                    create: {
                        name: 'Default Tenant',
                        domain: 'default'
                    }
                }
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('\n📧 Email: admin@erp.com');
        console.log('🔑 Password: admin123');
        console.log('\n⚠️  Please change the password after first login!\n');

    } catch (error) {
        console.error('❌ Failed to create admin user:', error);
        throw error;
    }
}

createAdminUser()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
