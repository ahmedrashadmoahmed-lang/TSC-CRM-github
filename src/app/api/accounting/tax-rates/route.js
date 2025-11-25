import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all tax rates
export async function GET() {
    try {
        const taxRates = await prisma.taxRate.findMany({
            include: {
                account: true,
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ success: true, data: taxRates });
    } catch (error) {
        console.error('Error fetching tax rates:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tax rates' },
            { status: 500 }
        );
    }
}

// POST create tax rate
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, rate, type, accountId } = body;

        const tenant = await prisma.tenant.findFirst();

        const taxRate = await prisma.taxRate.create({
            data: {
                name,
                rate,
                type,
                accountId,
                isActive: true,
                tenantId: tenant.id,
            },
            include: {
                account: true,
            },
        });

        return NextResponse.json({ success: true, data: taxRate });
    } catch (error) {
        console.error('Error creating tax rate:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create tax rate' },
            { status: 500 }
        );
    }
}
