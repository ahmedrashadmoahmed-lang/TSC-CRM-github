import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST approve/post journal entry
export async function POST(request, { params }) {
    try {
        const { id } = params;

        const entry = await prisma.journalEntry.findUnique({
            where: { id },
            include: { lines: true },
        });

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Journal entry not found' },
                { status: 404 }
            );
        }

        if (entry.status === 'posted') {
            return NextResponse.json(
                { success: false, error: 'Entry already posted' },
                { status: 400 }
            );
        }

        // Validate debit = credit
        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return NextResponse.json(
                { success: false, error: 'Total debits must equal total credits' },
                { status: 400 }
            );
        }

        const updated = await prisma.journalEntry.update({
            where: { id },
            data: { status: 'posted' },
            include: {
                lines: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error posting journal entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to post journal entry' },
            { status: 500 }
        );
    }
}
