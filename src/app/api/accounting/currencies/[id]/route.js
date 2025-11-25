import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update currency
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        // If setting as base, unset others
        if (body.isBase) {
            await prisma.currency.updateMany({
                data: { isBase: false },
            });
        }

        const currency = await prisma.currency.update({
            where: { id },
            data: {
                name: body.name,
                symbol: body.symbol,
                rate: body.rate,
                isBase: body.isBase,
                isActive: body.isActive,
            },
        });

        return NextResponse.json({ success: true, data: currency });
    } catch (error) {
        console.error('Error updating currency:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update currency' },
            { status: 500 }
        );
    }
}

// DELETE currency
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check if currency is in use
        const accountsUsing = await prisma.account.count({
            where: { currencyId: id },
        });

        if (accountsUsing > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete currency in use by accounts' },
                { status: 400 }
            );
        }

        await prisma.currency.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'Currency deleted' });
    } catch (error) {
        console.error('Error deleting currency:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete currency' },
            { status: 500 }
        );
    }
}
