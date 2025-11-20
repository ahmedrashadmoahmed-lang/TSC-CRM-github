const { PrismaClient } = require('@prisma/client');
const realData = require('../src/data/realData');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting data migration...\n');

    try {
        // 1. Migrate Customers
        console.log('📦 Migrating customers...');
        for (const customer of realData.customers) {
            await prisma.customer.create({
                data: {
                    name: customer.name,
                    type: customer.type,
                    totalInvoices: customer.totalInvoices,
                    totalValue: customer.totalValue,
                    status: customer.status
                }
            });
        }
        console.log(`✅ Migrated ${realData.customers.length} customers\n`);

        // 2. Migrate Invoices
        console.log('📄 Migrating invoices...');
        for (const invoice of realData.invoices) {
            const customer = await prisma.customer.findFirst({
                where: { name: invoice.customerName }
            });

            if (customer) {
                await prisma.invoice.create({
                    data: {
                        invoiceNumber: invoice.id,
                        date: new Date(invoice.date),
                        customerId: customer.id,
                        description: invoice.description,
                        salesPerson: invoice.salesPerson,
                        type: invoice.type,
                        salesValue: invoice.salesValue,
                        profitTax: invoice.profitTax,
                        vat: invoice.vat,
                        hasDiscount: invoice.hasDiscount,
                        discounts: invoice.discounts,
                        finalValue: invoice.finalValue,
                        collected: invoice.collected,
                        collectionDate: invoice.collectionDate ? new Date(invoice.collectionDate) : null,
                        balance: invoice.balance,
                        status: invoice.status,
                        notes: invoice.notes || ''
                    }
                });
            }
        }
        console.log(`✅ Migrated ${realData.invoices.length} invoices\n`);

        // 3. Migrate Employees
        console.log('👥 Migrating employees...');
        for (const employee of realData.employees) {
            await prisma.employee.create({
                data: {
                    name: employee.name,
                    position: employee.position,
                    baseSalary: employee.baseSalary,
                    status: employee.status,
                    joinDate: new Date(employee.joinDate)
                }
            });
        }
        console.log(`✅ Migrated ${realData.employees.length} employees\n`);

        // 4. Migrate Payroll
        console.log('💰 Migrating payroll records...');
        for (const payroll of realData.payrollRecords) {
            const employee = await prisma.employee.findFirst({
                where: { name: payroll.employeeName }
            });

            if (employee) {
                await prisma.payroll.create({
                    data: {
                        employeeId: employee.id,
                        month: payroll.month,
                        year: 2025,
                        baseSalary: payroll.baseSalary,
                        additions: payroll.additions,
                        deductions: payroll.deductions,
                        netSalary: payroll.netSalary,
                        paid: payroll.paid,
                        signature: payroll.signature
                    }
                });
            }
        }
        console.log(`✅ Migrated ${realData.payrollRecords.length} payroll records\n`);

        // 5. Migrate Expenses
        console.log('💸 Migrating expenses...');
        let expenseCount = 0;
        for (const expense of realData.expenses) {
            await prisma.expense.create({
                data: {
                    date: new Date(expense.date),
                    description: expense.description,
                    amount: expense.amount,
                    category: expense.category
                }
            });
            expenseCount++;
        }
        console.log(`✅ Migrated ${expenseCount} expenses\n`);

        // 6. Migrate Suppliers
        console.log('🏭 Migrating suppliers...');
        for (const supplier of realData.suppliers) {
            await prisma.supplier.create({
                data: {
                    name: supplier.name,
                    category: supplier.category,
                    totalOrders: supplier.totalOrders,
                    totalValue: supplier.totalValue,
                    status: supplier.status
                }
            });
        }
        console.log(`✅ Migrated ${realData.suppliers.length} suppliers\n`);

        // 7. Migrate Purchase Orders
        console.log('📋 Migrating purchase orders...');
        for (const po of realData.purchaseOrders) {
            const supplier = await prisma.supplier.findFirst({
                where: { name: po.supplierName }
            });

            if (supplier) {
                await prisma.purchaseOrder.create({
                    data: {
                        poNumber: po.id,
                        date: new Date(po.date),
                        supplierId: supplier.id,
                        description: po.description,
                        amount: po.finalValue,
                        status: po.status
                    }
                });
            }
        }
        console.log(`✅ Migrated ${realData.purchaseOrders.length} purchase orders\n`);

        // 8. Migrate Products
        console.log('📦 Migrating products...');
        for (const product of realData.products) {
            await prisma.product.create({
                data: {
                    name: product.name,
                    sku: product.id,
                    category: product.category,
                    stock: product.stock,
                    minStock: product.minStock,
                    price: product.price,
                    cost: product.price * 0.7,
                    status: 'active'
                }
            });
        }
        console.log(`✅ Migrated ${realData.products.length} products\n`);

        // 9. Migrate Bank Guarantees
        console.log('🏦 Migrating bank guarantees...');
        for (const guarantee of realData.bankGuarantees) {
            await prisma.bankGuarantee.create({
                data: {
                    type: guarantee.type,
                    amount: guarantee.amount,
                    status: guarantee.status,
                    issueDate: guarantee.issueDate ? new Date(guarantee.issueDate) : new Date(),
                    returnDate: guarantee.returnDate ? new Date(guarantee.returnDate) : null,
                    description: guarantee.beneficiary || guarantee.type
                }
            });
        }
        console.log(`✅ Migrated ${realData.bankGuarantees.length} bank guarantees\n`);

        console.log('🎉 Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Customers: ${realData.customers.length}`);
        console.log(`   - Invoices: ${realData.invoices.length}`);
        console.log(`   - Employees: ${realData.employees.length}`);
        console.log(`   - Payroll: ${realData.payrollRecords.length}`);
        console.log(`   - Expenses: ${expenseCount}`);
        console.log(`   - Suppliers: ${realData.suppliers.length}`);
        console.log(`   - Purchase Orders: ${realData.purchaseOrders.length}`);
        console.log(`   - Products: ${realData.products.length}`);
        console.log(`   - Bank Guarantees: ${realData.bankGuarantees.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
