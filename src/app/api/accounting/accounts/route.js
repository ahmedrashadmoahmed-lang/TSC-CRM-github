import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all accounts
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const active = searchParams.get('active');

        const where = {};
        if (type) where.type = type;
        if (active !== null) where.isActive = active === 'true';

        const accounts = await prisma.account.findMany({
            where,
            include: {
                parent: true,
                children: true,
                currency: true,
                taxRate: true,
            },
            orderBy: {
                code: 'asc',
            },
        });

        return NextResponse.json({ success: true, data: accounts });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}

// POST create new account
export async function POST(request) {
    try {
        const body = await request.json();
        const { code, name, type, parentId, currencyId, taxRateId, level } = body;

        // Get tenant (simplified - should come from session)
        const tenant = await prisma.tenant.findFirst();

        const account = await prisma.account.create({
            data: {
                code,
                name,
                type,
                parentId: parentId || null,
                level: level || 0,
                currencyId: currencyId || null,
                taxRateId: taxRateId || null,
                isActive: true,
                tenantId: tenant.id,
            },
            include: {
                parent: true,
                currency: true,
                taxRate: true,
            },
        });

        return NextResponse.json({ success: true, data: account });
    } catch (error) {
        console.error('Error creating account:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
