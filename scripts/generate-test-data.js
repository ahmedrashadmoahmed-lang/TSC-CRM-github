/**
 * Test Data Generator for Integration Testing
 * Generates realistic test data for the complete workflow
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test data configuration
const TEST_DATA = {
    tenant: {
        name: 'Test Company Ltd',
        domain: 'testcompany.local',
    },
    user: {
        name: 'Test Admin',
        email: 'admin@testcompany.local',
        password: 'Test123!',
        role: 'admin',
    },
    customer: {
        name: 'ABC Corporation',
        email: 'contact@abccorp.com',
        phone: '+1234567890',
        address: '123 Business St, City, Country',
    },
    suppliers: [
        {
            name: 'Furniture Plus',
            email: 'sales@furnitureplus.com',
            phone: '+1234567891',
            rating: 4.5,
            responseTime: 'fast',
        },
        {
            name: 'Office Solutions',
            email: 'info@officesolutions.com',
            phone: '+1234567892',
            rating: 4.2,
            responseTime: 'medium',
        },
        {
            name: 'Premium Furnishings',
            email: 'contact@premiumfurnishings.com',
            phone: '+1234567893',
            rating: 4.8,
            responseTime: 'slow',
        },
    ],
    opportunity: {
        title: 'Office Furniture Order - ABC Corp',
        description: 'Complete office furniture package for new branch',
        value: 150000,
        stage: 'lead',
        probability: 70,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    items: [
        {
            name: 'Executive Desk',
            description: 'Premium executive desk with drawers',
            quantity: 10,
            unitPrice: 5000,
            category: 'Furniture',
        },
        {
            name: 'Office Chair',
            description: 'Ergonomic office chair with lumbar support',
            quantity: 20,
            unitPrice: 2000,
            category: 'Furniture',
        },
        {
            name: 'Filing Cabinet',
            description: '4-drawer filing cabinet',
            quantity: 15,
            unitPrice: 3000,
            category: 'Storage',
        },
    ],
};

async function generateTestData() {
    console.log('🚀 Starting test data generation...\n');

    try {
        // 1. Create Tenant
        console.log('1️⃣ Creating tenant...');
        const tenant = await prisma.tenant.create({
            data: {
                name: TEST_DATA.tenant.name,
                domain: TEST_DATA.tenant.domain,
                settings: {},
            },
        });
        console.log(`✅ Tenant created: ${tenant.name} (ID: ${tenant.id})\n`);

        // 2. Create User
        console.log('2️⃣ Creating admin user...');
        const hashedPassword = await bcrypt.hash(TEST_DATA.user.password, 10);
        const user = await prisma.user.create({
            data: {
                name: TEST_DATA.user.name,
                email: TEST_DATA.user.email,
                password: hashedPassword,
                role: TEST_DATA.user.role,
                tenantId: tenant.id,
                status: 'active',
            },
        });
        console.log(`✅ User created: ${user.email}\n`);

        // 3. Create Customer
        console.log('3️⃣ Creating customer...');
        const customer = await prisma.customer.create({
            data: {
                name: TEST_DATA.customer.name,
                email: TEST_DATA.customer.email,
                phone: TEST_DATA.customer.phone,
                address: TEST_DATA.customer.address,
                tenantId: tenant.id,
                status: 'active',
            },
        });
        console.log(`✅ Customer created: ${customer.name} (ID: ${customer.id})\n`);

        // 4. Create Suppliers
        console.log('4️⃣ Creating suppliers...');
        const suppliers = [];
        for (const supplierData of TEST_DATA.suppliers) {
            const supplier = await prisma.supplier.create({
                data: {
                    ...supplierData,
                    tenantId: tenant.id,
                    status: 'active',
                },
            });
            suppliers.push(supplier);
            console.log(`   ✅ ${supplier.name}`);
        }
        console.log('');

        // 5. Create Opportunity
        console.log('5️⃣ Creating sales opportunity...');
        const opportunity = await prisma.opportunity.create({
            data: {
                ...TEST_DATA.opportunity,
                customerId: customer.id,
                tenantId: tenant.id,
                ownerId: user.id,
                source: 'direct',
                status: 'active',
            },
        });
        console.log(`✅ Opportunity created: ${opportunity.title} (ID: ${opportunity.id})\n`);

        // 6. Create Products
        console.log('6️⃣ Creating products...');
        const products = [];
        for (const itemData of TEST_DATA.items) {
            const product = await prisma.product.create({
                data: {
                    name: itemData.name,
                    description: itemData.description,
                    category: itemData.category,
                    price: itemData.unitPrice,
                    tenantId: tenant.id,
                    status: 'active',
                    stock: 0, // Will be updated after receiving
                },
            });
            products.push(product);
            console.log(`   ✅ ${product.name} - $${product.price}`);
        }
        console.log('');

        // 7. Summary
        console.log('✨ Test data generation complete!\n');
        console.log('📊 Summary:');
        console.log(`   - Tenant: ${tenant.name}`);
        console.log(`   - User: ${user.email} (Password: ${TEST_DATA.user.password})`);
        console.log(`   - Customer: ${customer.name}`);
        console.log(`   - Suppliers: ${suppliers.length}`);
        console.log(`   - Opportunity: ${opportunity.title} ($${opportunity.value})`);
        console.log(`   - Products: ${products.length}`);
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Login at http://localhost:3000/auth/signin');
        console.log(`   2. Email: ${user.email}`);
        console.log(`   3. Password: ${TEST_DATA.user.password}`);
        console.log('   4. Navigate to Sales Pipeline');
        console.log('   5. Find opportunity: ' + opportunity.title);
        console.log('   6. Start the workflow test!');
        console.log('');

        return {
            tenant,
            user,
            customer,
            suppliers,
            opportunity,
            products,
        };
    } catch (error) {
        console.error('❌ Error generating test data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
    generateTestData()
        .then(() => {
            console.log('✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed:', error);
            process.exit(1);
        });
}

export default generateTestData;
