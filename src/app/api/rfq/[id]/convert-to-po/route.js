import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rfqId = params.id;

        // Fetch RFQ with items and selected supplier quote
        const rfq = await prisma.rFQ.findUnique({
            where: { id: rfqId },
            include: {
                items: true,
                quotes: {
                    where: { status: 'selected' },
                    include: { supplier: true }
                }
            }
        });

        if (!rfq) {
            return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
        }

        if (rfq.stage !== 'selected') {
            return NextResponse.json({
                error: 'RFQ must be in selected stage to convert to PO'
            }, { status: 400 });
        }

        const selectedQuote = rfq.quotes[0];
        if (!selectedQuote) {
            return NextResponse.json({
                error: 'No supplier quote selected for this RFQ'
            }, { status: 400 });
        }

        // Generate PO number
        const lastPO = await prisma.purchaseOrder.findFirst({
            where: { tenantId: session.user.tenantId },
            orderBy: { createdAt: 'desc' }
        });

        const poNumber = lastPO
            ? `PO-${(parseInt(lastPO.poNumber.split('-')[1]) + 1).toString().padStart(5, '0')}`
            : 'PO-00001';

        // Create Purchase Order
        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                tenantId: session.user.tenantId,
                supplierId: selectedQuote.supplierId,
                rfqId: rfqId,
                status: 'draft',
                totalAmount: selectedQuote.totalAmount,
                currency: rfq.currency || 'EGP',
                paymentTerms: selectedQuote.paymentTerms || 'Net 30',
                deliveryDate: selectedQuote.deliveryDate,
                notes: `Created from RFQ ${rfq.rfqNumber}`,
                createdBy: session.user.id,
                items: {
                    create: rfq.items.map(item => ({
                        productName: item.productName,
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.estimatedPrice || 0,
                        totalPrice: (item.quantity * (item.estimatedPrice || 0)),
                        specifications: item.specifications
                    }))
                }
            },
            include: {
                supplier: true,
                items: true
            }
        });

        // Update RFQ stage to po_created
        await prisma.rFQ.update({
            where: { id: rfqId },
            data: { stage: 'po_created' }
        });

        return NextResponse.json({
            success: true,
            po,
            message: `Purchase Order ${poNumber} created successfully`
        });

    } catch (error) {
        console.error('Error converting RFQ to PO:', error);
        return NextResponse.json({
            error: 'Failed to convert RFQ to PO',
            details: error.message
        }, { status: 500 });
    }
}
