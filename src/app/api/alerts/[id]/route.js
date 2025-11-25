import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/alerts/:id - Get single alert
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const alert = await prisma.customAlert.findUnique({
            where: { id },
        });

        if (!alert) {
            return NextResponse.json(
                { error: 'Alert not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(alert);
    } catch (error) {
        console.error('Error fetching alert:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alert' },
            { status: 500 }
        );
    }
}

// PUT /api/alerts/:id - Update alert
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, condition, channels, isActive } = body;

        const alert = await prisma.customAlert.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(condition && { condition }),
                ...(channels && { channels }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(alert);
    } catch (error) {
        console.error('Error updating alert:', error);
        return NextResponse.json(
            { error: 'Failed to update alert' },
            { status: 500 }
        );
    }
}

// DELETE /api/alerts/:id - Delete alert
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        await prisma.customAlert.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting alert:', error);
        return NextResponse.json(
            { error: 'Failed to delete alert' },
            { status: 500 }
        );
    }
}

// PATCH /api/alerts/:id/trigger - Mark alert as triggered
export async function PATCH(request, { params }) {
    try {
        const { id } = params;

        const alert = await prisma.customAlert.update({
            where: { id },
            data: {
                lastTriggered: new Date(),
            },
        });

        return NextResponse.json(alert);
    } catch (error) {
        console.error('Error triggering alert:', error);
        return NextResponse.json(
            { error: 'Failed to trigger alert' },
            { status: 500 }
        );
    }
}
