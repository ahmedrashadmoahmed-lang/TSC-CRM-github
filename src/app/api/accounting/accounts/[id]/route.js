import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single account
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const account = await prisma.account.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                currency: true,
                taxRate: true,
                journalLines: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!account) {
            return NextResponse.json(
                { success: false, error: 'Account not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: account });
    } catch (error) {
        console.error('Error fetching account:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch account' },
            { status: 500 }
        );
    }
}

// PUT update account
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        const account = await prisma.account.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
                parentId: body.parentId || null,
                currencyId: body.currencyId || null,
                taxRateId: body.taxRateId || null,
                isActive: body.isActive,
            },
            include: {
                parent: true,
                currency: true,
                taxRate: true,
            },
        });

        return NextResponse.json({ success: true, data: account });
    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update account' },
            { status: 500 }
        );
    }
}

// DELETE account
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check if account has children
        const children = await prisma.account.count({
            where: { parentId: id },
        });

        if (children > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete account with sub-accounts' },
                { status: 400 }
            );
        }

        // Check if account has transactions
        const transactions = await prisma.journalLine.count({
            where: { accountId: id },
        });

        if (transactions > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete account with transactions' },
                { status: 400 }
            );
        }

        await prisma.account.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete account' },
            { status: 500 }
        );
    }
}
