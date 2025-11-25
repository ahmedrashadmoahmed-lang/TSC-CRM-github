import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all cost centers
export async function GET() {
    try {
        const costCenters = await prisma.costCenter.findMany({
            include: {
                parent: true,
                children: true,
            },
            orderBy: { code: 'asc' },
        });

        return NextResponse.json({ success: true, data: costCenters });
    } catch (error) {
        console.error('Error fetching cost centers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cost centers' },
            { status: 500 }
        );
    }
}

// POST create cost center
export async function POST(request) {
    try {
        const body = await request.json();
        const { code, name, description, parentId } = body;

        const tenant = await prisma.tenant.findFirst();

        const costCenter = await prisma.costCenter.create({
            data: {
                code,
                name,
                description: description || null,
                parentId: parentId || null,
                isActive: true,
                tenantId: tenant.id,
            },
            include: {
                parent: true,
            },
        });

        return NextResponse.json({ success: true, data: costCenter });
    } catch (error) {
        console.error('Error creating cost center:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create cost center' },
            { status: 500 }
        );
    }
}
