import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET vendor's purchase orders
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get supplier for this user
        const supplier = await prisma.supplier.findFirst({
            where: {
                email: session.user.email,
                tenantId: session.user.tenantId
            }
        });

        if (!supplier) {
            return NextResponse.json(
                { error: 'Supplier not found' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = {
            supplierId: supplier.id,
            tenantId: session.user.tenantId
        };

        if (status) {
            where.status = status;
        }

        const purchaseOrders = await prisma.advancedPurchaseOrder.findMany({
            where,
            include: {
                items: true,
                shipments: {
                    orderBy: { createdAt: 'desc' }
                },
                documents: {
                    where: {
                        accessLevel: {
                            in: ['public', 'supplier']
                        }
                    }
                },
                payments: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: purchaseOrders,
            supplier: {
                id: supplier.id,
                name: supplier.name
            }
        });

    } catch (error) {
        console.error('Error fetching vendor POs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchase orders' },
            { status: 500 }
        );
    }
}
