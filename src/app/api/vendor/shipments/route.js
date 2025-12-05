import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST update shipment status (vendor)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get supplier
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

        const body = await request.json();
        const {
            shipmentId,
            status,
            currentLocation,
            notes,
            estimatedArrival
        } = body;

        if (!shipmentId || !status) {
            return NextResponse.json(
                { error: 'Shipment ID and status are required' },
                { status: 400 }
            );
        }

        // Verify shipment belongs to supplier's PO
        const shipment = await prisma.pOShipment.findUnique({
            where: { id: shipmentId },
            include: {
                po: true
            }
        });

        if (!shipment || shipment.po.supplierId !== supplier.id) {
            return NextResponse.json(
                { error: 'Shipment not found or unauthorized' },
                { status: 404 }
            );
        }

        // Update shipment
        const updateData = {
            status,
            notes
        };

        if (currentLocation) {
            updateData.currentLocation = currentLocation;
        }

        if (estimatedArrival) {
            updateData.expectedArrival = new Date(estimatedArrival);
        }

        if (status === 'delivered') {
            updateData.actualArrival = new Date();
        }

        const updatedShipment = await prisma.pOShipment.update({
            where: { id: shipmentId },
            data: updateData
        });

        // Update PO status if delivered
        if (status === 'delivered') {
            await prisma.advancedPurchaseOrder.update({
                where: { id: shipment.poId },
                data: { status: 'delivered' }
            });
        }

        return NextResponse.json({
            success: true,
            data: updatedShipment,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø´Ø­Ù†Ø© Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error updating shipment:', error);
        return NextResponse.json(
            { error: 'Failed to update shipment' },
            { status: 500 }
        );
    }
}
