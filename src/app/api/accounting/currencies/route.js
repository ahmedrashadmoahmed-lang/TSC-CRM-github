import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all currencies
export async function GET() {
    try {
        const currencies = await prisma.currency.findMany({
            orderBy: { code: 'asc' },
        });

        return NextResponse.json({ success: true, data: currencies });
    } catch (error) {
        console.error('Error fetching currencies:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch currencies' },
            { status: 500 }
        );
    }
}

// POST create currency
export async function POST(request) {
    try {
        const body = await request.json();
        const { code, name, symbol, rate, isBase } = body;

        const tenant = await prisma.tenant.findFirst();

        // If setting as base currency, unset others
        if (isBase) {
            await prisma.currency.updateMany({
                where: { tenantId: tenant.id },
                data: { isBase: false },
            });
        }

        const currency = await prisma.currency.create({
            data: {
                code,
                name,
                symbol,
                rate: rate || 1,
                isBase: isBase || false,
                isActive: true,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ success: true, data: currency });
    } catch (error) {
        console.error('Error creating currency:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create currency' },
            { status: 500 }
        );
    }
}
