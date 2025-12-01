import { prisma } from '@/lib/prisma';

/**
 * Auto-generate journal entry from invoice
 * Called when invoice is created or payment is received
 */
export async function generateInvoiceEntry(invoice, type = 'create') {
    try {
        const tenant = await prisma.tenant.findFirst();

        // Get accounts
        const cashAccount = await prisma.account.findFirst({
            where: { code: '1111', tenantId: tenant.id }, // Cash
        });
        const receivablesAccount = await prisma.account.findFirst({
            where: { code: '1121', tenantId: tenant.id }, // Accounts Receivable
        });
        const revenueAccount = await prisma.account.findFirst({
            where: { code: '4110', tenantId: tenant.id }, // Sales Revenue
        });
        const taxAccount = await prisma.account.findFirst({
            where: { code: '2121', tenantId: tenant.id }, // VAT Payable
        });

        if (type === 'create') {
            // When invoice is created: Debit Receivables, Credit Revenue & Tax
            const lastEntry = await prisma.journalEntry.findFirst({
                orderBy: { entryNumber: 'desc' },
            });
            const nextNumber = lastEntry
                ? parseInt(lastEntry.entryNumber.replace('JE-', '')) + 1
                : 1;
            const entryNumber = `JE-${String(nextNumber).padStart(6, '0')}`;

            const entry = await prisma.journalEntry.create({
                data: {
                    entryNumber,
                    date: new Date(invoice.issueDate),
                    description: `فاتورة مبيعات رقم ${invoice.invoiceNumber}`,
                    reference: invoice.invoiceNumber,
                    status: 'posted',
                    tenantId: tenant.id,
                    lines: {
                        create: [
                            {
                                accountId: receivablesAccount.id,
                                debit: invoice.total,
                                credit: 0,
                                description: `العميل: ${invoice.customer?.name || 'غير محدد'}`,
                            },
                            {
                                accountId: revenueAccount.id,
                                debit: 0,
                                credit: invoice.subtotal,
                                description: 'إيرادات مبيعات',
                            },
                            ...(invoice.tax > 0 ? [{
                                accountId: taxAccount.id,
                                debit: 0,
                                credit: invoice.tax,
                                description: 'ضريبة القيمة المضافة',
                            }] : []),
                        ],
                    },
                },
            });

            // Update account balances
            await prisma.account.update({
                where: { id: receivablesAccount.id },
                data: { balance: { increment: invoice.total } },
            });
            await prisma.account.update({
                where: { id: revenueAccount.id },
                data: { balance: { increment: invoice.subtotal } },
            });
            if (invoice.tax > 0) {
                await prisma.account.update({
                    where: { id: taxAccount.id },
                    data: { balance: { increment: invoice.tax } },
                });
            }

            return entry;
        } else if (type === 'payment') {
            // When payment is received: Debit Cash, Credit Receivables
            const lastEntry = await prisma.journalEntry.findFirst({
                orderBy: { entryNumber: 'desc' },
            });
            const nextNumber = lastEntry
                ? parseInt(lastEntry.entryNumber.replace('JE-', '')) + 1
                : 1;
            const entryNumber = `JE-${String(nextNumber).padStart(6, '0')}`;

            const entry = await prisma.journalEntry.create({
                data: {
                    entryNumber,
                    date: new Date(),
                    description: `تحصيل فاتورة رقم ${invoice.invoiceNumber}`,
                    reference: invoice.invoiceNumber,
                    status: 'posted',
                    tenantId: tenant.id,
                    lines: {
                        create: [
                            {
                                accountId: cashAccount.id,
                                debit: invoice.paidAmount,
                                credit: 0,
                                description: 'تحصيل نقدي',
                            },
                            {
                                accountId: receivablesAccount.id,
                                debit: 0,
                                credit: invoice.paidAmount,
                                description: `العميل: ${invoice.customer?.name || 'غير محدد'}`,
                            },
                        ],
                    },
                },
            });

            // Update account balances
            await prisma.account.update({
                where: { id: cashAccount.id },
                data: { balance: { increment: invoice.paidAmount } },
            });
            await prisma.account.update({
                where: { id: receivablesAccount.id },
                data: { balance: { decrement: invoice.paidAmount } },
            });

            return entry;
        }
    } catch (error) {
        console.error('Error generating invoice entry:', error);
        throw error;
    }
}

/**
 * Auto-generate journal entry from expense
 */
export async function generateExpenseEntry(expense) {
    try {
        const tenant = await prisma.tenant.findFirst();

        // Get accounts
        const cashAccount = await prisma.account.findFirst({
            where: { code: '1111', tenantId: tenant.id }, // Cash
        });

        // Map expense category to account
        const categoryAccountMap = {
            'مرتبات': '5210',
            'إيجار': '5220',
            'كهرباء': '5230',
            'اتصالات': '5240',
            'قرطاسية': '5250',
            'إعلانات': '5310',
        };

        const expenseAccountCode = categoryAccountMap[expense.category] || '5200';
        const expenseAccount = await prisma.account.findFirst({
            where: { code: expenseAccountCode, tenantId: tenant.id },
        });

        // Generate entry number
        const lastEntry = await prisma.journalEntry.findFirst({
            orderBy: { entryNumber: 'desc' },
        });
        const nextNumber = lastEntry
            ? parseInt(lastEntry.entryNumber.replace('JE-', '')) + 1
            : 1;
        const entryNumber = `JE-${String(nextNumber).padStart(6, '0')}`;

        const entry = await prisma.journalEntry.create({
            data: {
                entryNumber,
                date: new Date(expense.date),
                description: `مصروف: ${expense.description}`,
                reference: expense.receipt || null,
                status: 'posted',
                tenantId: tenant.id,
                lines: {
                    create: [
                        {
                            accountId: expenseAccount.id,
                            debit: expense.amount,
                            credit: 0,
                            description: expense.category,
                        },
                        {
                            accountId: cashAccount.id,
                            debit: 0,
                            credit: expense.amount,
                            description: 'دفع نقدي',
                        },
                    ],
                },
            },
        });

        // Update account balances
        await prisma.account.update({
            where: { id: expenseAccount.id },
            data: { balance: { increment: expense.amount } },
        });
        await prisma.account.update({
            where: { id: cashAccount.id },
            data: { balance: { decrement: expense.amount } },
        });

        return entry;
    } catch (error) {
        console.error('Error generating expense entry:', error);
        throw error;
    }
}
