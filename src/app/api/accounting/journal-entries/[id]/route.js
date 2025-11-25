import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single journal entry
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const entry = await prisma.journalEntry.findUnique({
            where: { id },
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

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Journal entry not found' },
                { status: 404 }
            );
        }

        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

        return NextResponse.json({
            success: true,
            data: { ...entry, totalDebit, totalCredit },
        });
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch journal entry' },
            { status: 500 }
        );
    }
}

// PUT update journal entry
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        // Check if entry is already posted
        const existing = await prisma.journalEntry.findUnique({
            where: { id },
        });

        if (existing.status === 'posted') {
            return NextResponse.json(
                { success: false, error: 'Cannot edit posted journal entry' },
                { status: 400 }
            );
        }

        const entry = await prisma.journalEntry.update({
            where: { id },
            data: {
                date: body.date ? new Date(body.date) : undefined,
                description: body.description,
                reference: body.reference,
                status: body.status,
            },
            include: {
                lines: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('Error updating journal entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update journal entry' },
            { status: 500 }
        );
    }
}

// DELETE journal entry
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check if entry is posted
        const entry = await prisma.journalEntry.findUnique({
            where: { id },
            include: { lines: true },
        });

        if (entry.status === 'posted') {
            return NextResponse.json(
                { success: false, error: 'Cannot delete posted journal entry' },
                { status: 400 }
            );
        }

        // Reverse account balances
        for (const line of entry.lines) {
            const account = await prisma.account.findUnique({
                where: { id: line.accountId },
            });

            let balanceChange = 0;
            if (account.type === 'asset' || account.type === 'expense') {
                balanceChange = (line.credit || 0) - (line.debit || 0);
            } else {
                balanceChange = (line.debit || 0) - (line.credit || 0);
            }

            await prisma.account.update({
                where: { id: line.accountId },
                data: { balance: account.balance + balanceChange },
            });
        }

        // Delete entry (cascade will delete lines)
        await prisma.journalEntry.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Journal entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete journal entry' },
            { status: 500 }
        );
    }
}
