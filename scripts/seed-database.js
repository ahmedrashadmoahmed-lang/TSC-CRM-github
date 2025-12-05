import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
    console.log('🌱 Seeding database with test data...\n');

    try {
        const tenant = await prisma.tenant.findFirst({
            where: { domain: 'testcompany.local' }
        });

        const user = await prisma.user.findFirst({
            where: { email: 'admin@testcompany.local' }
        });

        if (!tenant || !user) {
            console.error('❌ Tenant or User not found!');
            return;
        }

        console.log('✅ Found tenant:', tenant.name);
        console.log('✅ Found user:', user.email, '\n');

        // 1. Customer
        console.log('1️⃣ Creating customer...');
        const customer = await prisma.customer.create({
            data: {
                name: 'ABC Corporation',
                email: 'contact@abccorp.com',
                phone: '+1234567890',
                address: '123 Business St',
                tenantId: tenant.id,
                status: 'active',
            },
        });
        console.log('✅ Customer:', customer.name);

        // 2. Suppliers
        console.log('\n2️⃣ Creating suppliers...');
        const suppliers = [];
        for (const s of [
            { name: 'Furniture Plus', email: 'sales@fp.com', phone: '+111' },
            { name: 'Office Solutions', email: 'info@os.com', phone: '+222' },
            { name: 'Premium Furnishings', email: 'contact@pf.com', phone: '+333' },
        ]) {
            const supplier = await prisma.supplier.create({
                data: { ...s, address: '456 Ave', tenantId: tenant.id, status: 'active' },
            });
            suppliers.push(supplier);
            console.log('   ✅', supplier.name);
        }

        // 3. Products
        console.log('\n3️⃣ Creating products...');
        const products = [];
        for (const p of [
            { name: 'Executive Desk', desc: 'Premium desk', cat: 'Furniture', price: 5000, cost: 3500 },
            { name: 'Office Chair', desc: 'Ergonomic chair', cat: 'Furniture', price: 2000, cost: 1200 },
            { name: 'Filing Cabinet', desc: '4-drawer cabinet', cat: 'Storage', price: 3000, cost: 2000 },
        ]) {
            const product = await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.desc,
                    category: p.cat,
                    price: p.price,
                    cost: p.cost,
                    sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    tenantId: tenant.id,
                    status: 'active',
                    quantity: 0,
                },
            });
            products.push(product);
            console.log('   ✅', product.name, '-', `$${product.price}`);
        }

        // 4. Opportunity
        console.log('\n4️⃣ Creating opportunity...');
        const opportunity = await prisma.opportunity.create({
            data: {
                title: 'Office Furniture Order - ABC Corp',
                value: 150000,
                stage: 'qualified',
                probability: 70,
                customerId: customer.id,
                tenantId: tenant.id,
            },
        });
        console.log('✅ Opportunity:', opportunity.title);

        // 5. Invoices
        console.log('\n5️⃣ Creating invoices...');
        const invoices = [];
        const invoiceData = [
            { amount: 5000, status: 'paid', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, // 5 days ago
            { amount: 3000, status: 'paid', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }, // 15 days ago
            { amount: 2000, status: 'pending', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // 2 days ago
            { amount: 1500, status: 'overdue', date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) }, // 35 days ago
        ];

        for (const inv of invoiceData) {
            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
                    issueDate: inv.date,
                    dueDate: new Date(inv.date.getTime() + 30 * 24 * 60 * 60 * 1000),
                    status: inv.status,
                    subtotal: inv.amount,
                    tax: 0,
                    total: inv.amount,
                    paidAmount: inv.status === 'paid' ? inv.amount : 0,
                    customerId: customer.id,
                    tenantId: tenant.id,
                    items: {
                        create: {
                            description: 'Office Supplies',
                            quantity: 1,
                            unitPrice: inv.amount,
                            tax: 0,
                            total: inv.amount,
                            productId: products[0].id,
                        }
                    }
                },
            });
            invoices.push(invoice);
            console.log('   ✅', invoice.invoiceNumber, '-', `$${invoice.total}`, `(${invoice.status})`);
        }

        console.log('\n✨ Database seeded successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Customer: ${customer.name}`);
        console.log(`   - Suppliers: ${suppliers.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Opportunity: $${opportunity.value}`);
        console.log(`   - Invoices: ${invoices.length}`);
        console.log('\n🎯 Refresh dashboard: http://localhost:3000\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
