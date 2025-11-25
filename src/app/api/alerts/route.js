import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/alerts - List all alerts for user
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const alerts = await prisma.customAlert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

// POST /api/alerts - Create new alert
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, name, condition, channels, isActive } = body;

        // Validation
        if (!userId || !name || !condition || !channels) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const alert = await prisma.customAlert.create({
            data: {
                userId,
                name,
                condition,
                channels,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return NextResponse.json(alert, { status: 201 });
    } catch (error) {
        console.error('Error creating alert:', error);
        return NextResponse.json(
            { error: 'Failed to create alert' },
            { status: 500 }
        );
    }
}
