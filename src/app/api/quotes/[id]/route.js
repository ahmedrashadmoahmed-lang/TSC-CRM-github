import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Get Quote Details
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const quote = await prisma.customerQuote.findUnique({
            where: {
                id: params.id,
                tenantId: session.user.tenantId,
            },
            include: {
                customer: true,
                opportunity: true,
                items: {
                    include: {
                        product: true
                    }
                },
            },
        });

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error fetching quote:', error);
        return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
    }
}

// PUT: Update Quote
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // 1. Delete existing items
        await prisma.customerQuoteItem.deleteMany({
            where: { quoteId: params.id }
        });

        // 2. Update quote and create new items
        const updatedQuote = await prisma.customerQuote.update({
            where: {
                id: params.id,
                tenantId: session.user.tenantId,
            },
            data: {
                status: data.status,
                validUntil: new Date(data.validUntil),
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount || 0,
                total: data.total,
                terms: data.terms,
                notes: data.notes,
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
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(updatedQuote);
    } catch (error) {
        console.error('Error updating quote:', error);
        return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
    }
}

// DELETE: Delete Quote
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.customerQuote.delete({
            where: {
                id: params.id,
                tenantId: session.user.tenantId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting quote:', error);
        return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
    }
}
