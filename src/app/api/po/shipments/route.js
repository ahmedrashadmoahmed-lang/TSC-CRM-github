import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET shipments for a PO
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const poId = searchParams.get('poId');

        if (!poId) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        const shipments = await prisma.pOShipment.findMany({
            where: { poId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: shipments
        });

    } catch (error) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipments' },
            { status: 500 }
        );
    }
}

// POST create shipment
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            poId,
            type,
            carrier,
            trackingNumber,
            trackingUrl,
            shippedDate,
            expectedArrival,
            origin,
            destination,
            items,
            notes
        } = body;

        if (!poId) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        // Generate shipment number
        const count = await prisma.pOShipment.count();
        const shipmentNumber = `SH-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

        const shipment = await prisma.pOShipment.create({
            data: {
                poId,
                shipmentNumber,
                type: type || 'full',
                status: 'pending',
                carrier,
                trackingNumber,
                trackingUrl,
                shippedDate: shippedDate ? new Date(shippedDate) : null,
                expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
                origin,
                destination,
                items: items ? JSON.stringify(items) : null,
                notes
            }
        });

        // Update PO status to shipped if not already
        await prisma.advancedPurchaseOrder.update({
            where: { id: poId },
            data: { status: 'shipped' }
        });

        return NextResponse.json({
            success: true,
            data: shipment,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø´Ø­Ù†Ø© Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating shipment:', error);
        return NextResponse.json(
            { error: 'Failed to create shipment' },
            { status: 500 }
        );
    }
}

// PATCH update shipment status
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, currentLocation, actualArrival } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Shipment ID is required' },
                { status: 400 }
            );
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (currentLocation) updateData.currentLocation = currentLocation;
        if (actualArrival) updateData.actualArrival = new Date(actualArrival);

        const shipment = await prisma.pOShipment.update({
            where: { id },
            data: updateData
        });

        // If delivered, update PO status
        if (status === 'delivered') {
            await prisma.advancedPurchaseOrder.update({
                where: { id: shipment.poId },
                data: { status: 'delivered', actualDelivery: new Date() }
            });
        }

        return NextResponse.json({
            success: true,
            data: shipment,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø´Ø­Ù†Ø©'
        });

    } catch (error) {
        console.error('Error updating shipment:', error);
        return NextResponse.json(
            { error: 'Failed to update shipment' },
            { status: 500 }
        );
    }
}
