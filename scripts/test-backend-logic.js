const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runBackendTest() {
    console.log('🚀 Starting Backend Logic Integration Test (Sales -> RFQ)...\n');

    try {
        // 1. Fetch the Opportunity
        console.log('1️⃣ Fetching Opportunity...');
        const opportunity = await prisma.opportunity.findFirst({
            where: { title: 'Office Furniture Order - ABC Corp' },
            include: { customer: true }
        });

        if (!opportunity) {
            throw new Error('Opportunity not found! Did seed script run?');
        }
        console.log(`   ✅ Found: ${opportunity.title} ($${opportunity.value})`);

        // 2. Fetch Suppliers & Admin User
        console.log('\n2️⃣ Fetching Suppliers & Admin User...');
        const suppliers = await prisma.supplier.findMany({ take: 3 });
        const adminUser = await prisma.user.findFirst({ where: { email: 'admin@testcompany.local' } });

        if (suppliers.length === 0) throw new Error('No suppliers found!');
        if (!adminUser) throw new Error('Admin user not found!');

        console.log(`   ✅ Found ${suppliers.length} suppliers.`);
        console.log(`   ✅ Found Admin: ${adminUser.name}`);

        // 3. Simulate "Create RFQ" (Logic from API)
        console.log('\n3️⃣ Creating RFQ (Simulating API logic)...');

        // Create RFQ
        const rfq = await prisma.rFQ.create({
            data: {
                rfqNumber: `RFQ-${Date.now()}`,
                title: `RFQ for ${opportunity.title}`,
                status: 'open',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                opportunityId: opportunity.id,
                tenantId: opportunity.tenantId,
                items: {
                    create: [
                        {
                            productName: 'Executive Desk',
                            description: 'High-quality executive desk',
                            quantity: 5,
                            unit: 'pcs',
                        },
                        {
                            productName: 'Office Chair',
                            description: 'Ergonomic office chair',
                            quantity: 10,
                            unit: 'pcs',
                        }
                    ]
                },
                suppliers: {
                    create: suppliers.map(s => ({
                        supplierId: s.id,
                        status: 'pending'
                    }))
                },
                createdBy: adminUser.id,
            },
            include: {
                items: true,
                suppliers: {
                    include: { supplier: true }
                }
            }
        });

        console.log(`   ✅ RFQ Created: ${rfq.rfqNumber}`);
        console.log(`      - Items: ${rfq.items.length}`);
        console.log(`      - Suppliers: ${rfq.suppliers.length}`);

        // 4. Verify Linkage
        console.log('\n4️⃣ Verifying Linkage...');
        const updatedOpp = await prisma.opportunity.findUnique({
            where: { id: opportunity.id },
            include: { rfqs: true }
        });

        const linkedRfq = updatedOpp.rfqs.find(r => r.id === rfq.id);
        if (linkedRfq) {
            console.log('   ✅ Opportunity is correctly linked to RFQ.');
        } else {
            throw new Error('Linkage failed!');
        }

        console.log('\n✨ Backend Integration Test Passed!');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runBackendTest();
