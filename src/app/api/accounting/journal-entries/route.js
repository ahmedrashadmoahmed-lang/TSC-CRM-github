import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all journal entries
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where = {};
        if (status) where.status = status;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const entries = await prisma.journalEntry.findMany({
            where,
            include: {
                lines: {
                    include: {
                        account: true,
                        costCenter: true,
                        currency: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        // Calculate totals for each entry
        const entriesWithTotals = entries.map(entry => ({
            ...entry,
            totalDebit: entry.lines.reduce((sum, line) => sum + line.debit, 0),
            totalCredit: entry.lines.reduce((sum, line) => sum + line.credit, 0),
        }));

        return NextResponse.json({ success: true, data: entriesWithTotals });
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch journal entries' },
            { status: 500 }
        );
    }
}

// POST create new journal entry
export async function POST(request) {
    try {
        const body = await request.json();
        const { date, description, reference, lines } = body;

        // Validate debit = credit
        const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return NextResponse.json(
                { success: false, error: 'Total debits must equal total credits' },
                { status: 400 }
            );
        }

        // Get tenant
        const tenant = await prisma.tenant.findFirst();

        // Generate entry number
        const lastEntry = await prisma.journalEntry.findFirst({
            orderBy: { entryNumber: 'desc' },
        });
        const nextNumber = lastEntry
            ? parseInt(lastEntry.entryNumber.replace('JE-', '')) + 1
            : 1;
        const entryNumber = `JE-${String(nextNumber).padStart(6, '0')}`;

        // Create journal entry with lines
        const entry = await prisma.journalEntry.create({
            data: {
                entryNumber,
                date: new Date(date),
                description,
                reference: reference || null,
                status: 'draft',
                tenantId: tenant.id,
                lines: {
                    create: lines.map(line => ({
                        accountId: line.accountId,
                        debit: line.debit || 0,
                        credit: line.credit || 0,
                        description: line.description || null,
                        costCenterId: line.costCenterId || null,
                        currencyId: line.currencyId || null,
                        exchangeRate: line.exchangeRate || 1,
                        taxAmount: line.taxAmount || 0,
                    })),
                },
            },
            include: {
                lines: {
                    include: {
                        account: true,
                        costCenter: true,
                        currency: true,
                    },
                },
            },
        });

        // Update account balances
        for (const line of lines) {
            const account = await prisma.account.findUnique({
                where: { id: line.accountId },
            });

            let balanceChange = 0;
            if (account.type === 'asset' || account.type === 'expense') {
                balanceChange = (line.debit || 0) - (line.credit || 0);
            } else {
                balanceChange = (line.credit || 0) - (line.debit || 0);
            }

            await prisma.account.update({
                where: { id: line.accountId },
                data: { balance: account.balance + balanceChange },
            });
        }

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create journal entry' },
            { status: 500 }
        );
    }
}
