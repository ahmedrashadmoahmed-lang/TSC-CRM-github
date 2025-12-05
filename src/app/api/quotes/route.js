import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: List Quotes
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');
        const opportunityId = searchParams.get('opportunityId');

        const where = {
            tenantId: session.user.tenantId,
            ...(status && { status }),
            ...(customerId && { customerId }),
            ...(opportunityId && { opportunityId }),
        };

        const quotes = await prisma.customerQuote.findMany({
            where,
            include: {
                customer: { select: { name: true, email: true } },
                opportunity: { select: { title: true } },
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

// POST: Create Quote
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Generate Quote Number (e.g., Q-2025-001)
        const count = await prisma.customerQuote.count({
            where: { tenantId: session.user.tenantId }
        });
        const quoteNumber = `Q-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

        const quote = await prisma.customerQuote.create({
            data: {
                quoteNumber,
                opportunityId: data.opportunityId,
                customerId: data.customerId,
                status: 'draft',
                validUntil: new Date(data.validUntil),
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount || 0,
                total: data.total,
                terms: data.terms,
                notes: data.notes,
                tenantId: session.user.tenantId,
                createdBy: session.user.id,
                items: {
                    create: data.items.map(item => ({
                        productId: item.productId,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        cost: item.cost || 0,
                        tax: item.tax || 0,
                        discount: item.discount || 0,
                        total: item.total,
                    }))
                }
            }
        });

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error creating quote:', error);
        return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
    }
}
