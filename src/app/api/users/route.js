import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET all users
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            where: { tenantId: session.user.tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLogin: true
            }
        });

        return NextResponse.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST create user
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'user',
                status: 'active',
                tenantId: session.user.tenantId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: user,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

// PATCH update user
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, email, role, status, password } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (status) updateData.status = status;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true
            }
        });

        return NextResponse.json({
            success: true,
            data: user,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE user
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
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        // Don't allow deleting yourself
        if (id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
