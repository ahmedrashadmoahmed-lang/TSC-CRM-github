import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers - Get all customers
export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                invoices: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

// POST /api/customers - Create new customer
export async function POST(request) {
    try {
        const body = await request.json();

        const customer = await prisma.customer.create({
            data: {
                name: body.name,
                type: body.type,
                status: body.status || 'active'
            }
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
}
