import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET budgets
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const accountId = searchParams.get('accountId');

        const where = {};
        if (year) where.year = parseInt(year);
        if (accountId) where.accountId = accountId;

        const budgets = await prisma.budget.findMany({
            where,
            include: {
                account: true,
            },
            orderBy: [
                { year: 'desc' },
                { month: 'asc' },
            ],
        });

        return NextResponse.json({ success: true, data: budgets });
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch budgets' },
            { status: 500 }
        );
    }
}

// POST create budget
export async function POST(request) {
    try {
        const body = await request.json();
        const { accountId, year, month, amount } = body;

        const tenant = await prisma.tenant.findFirst();

        const budget = await prisma.budget.create({
            data: {
                accountId,
                year,
                month: month || null,
                amount,
                actual: 0,
                variance: 0,
                tenantId: tenant.id,
            },
            include: {
                account: true,
            },
        });

        return NextResponse.json({ success: true, data: budget });
    } catch (error) {
        console.error('Error creating budget:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create budget' },
            { status: 500 }
        );
    }
}
