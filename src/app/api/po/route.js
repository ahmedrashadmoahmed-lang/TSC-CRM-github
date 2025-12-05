import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all purchase orders
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const supplierId = searchParams.get('supplierId');

        const where = {
            tenantId: session.user.tenantId
        };

        if (status) where.status = status;
        if (supplierId) where.supplierId = supplierId;

        const purchaseOrders = await prisma.advancedPurchaseOrder.findMany({
            where,
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                },
                shipments: true,
                approvals: true,
                qualityChecks: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: purchaseOrders
        });

    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchase orders' },
            { status: 500 }
        );
    }
}

// POST create new purchase order
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            supplierId,
            items,
            expectedDelivery,
            warehouseId,
            deliveryAddress,
            paymentTerms,
            notes,
            rfqId
        } = body;

        if (!supplierId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Supplier and items are required' },
                { status: 400 }
            );
        }

        // Generate PO number
        const count = await prisma.advancedPurchaseOrder.count({
            where: { tenantId: session.user.tenantId }
        });
        const poNumber = `PO-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        // Determine approval level based on amount
        let approvalLevel = 1;
        if (totalAmount > 50000) approvalLevel = 3;
        else if (totalAmount > 10000) approvalLevel = 2;

        // Create PO with items
        const purchaseOrder = await prisma.advancedPurchaseOrder.create({
            data: {
                poNumber,
                supplierId,
                status: 'draft',
                totalAmount,
                expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
                warehouseId,
                deliveryAddress,
                paymentTerms,
                notes,
                rfqId,
                approvalLevel,
                tenantId: session.user.tenantId,
                createdBy: session.user.id,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice,
                        quantityPending: item.quantity,
                        specifications: item.specifications ? JSON.stringify(item.specifications) : null
                    }))
                }
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: purchaseOrder,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø£Ù…Ø± Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to create purchase order' },
            { status: 500 }
        );
    }
}

// PATCH update purchase order
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, notes, expectedDelivery, actualDelivery } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (expectedDelivery) updateData.expectedDelivery = new Date(expectedDelivery);
        if (actualDelivery) updateData.actualDelivery = new Date(actualDelivery);

        const purchaseOrder = await prisma.advancedPurchaseOrder.update({
            where: { id },
            data: updateData,
            include: {
                supplier: true,
                items: true,
                shipments: true
            }
        });

        return NextResponse.json({
            success: true,
            data: purchaseOrder,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø£Ù…Ø± Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error updating purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to update purchase order' },
            { status: 500 }
        );
    }
}

// DELETE purchase order
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        await prisma.advancedPurchaseOrder.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø­Ø°Ù Ø£Ù…Ø± Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error deleting purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to delete purchase order' },
            { status: 500 }
        );
    }
}
