import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assignedTo = searchParams.get('assignedTo');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (assignedTo) where.assignedTo = assignedTo;

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                include: {
                    client: { select: { id: true, name: true } },
                    deal: { select: { id: true, title: true } },
                    assignee: { select: { id: true, name: true } }
                },
                orderBy: [
                    { priority: 'desc' },
                    { dueDate: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma.task.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: { tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { title, description, priority, dueDate, assignedTo, clientId, dealId } = await request.json();

        if (!title) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedTo,
                clientId,
                dealId,
                tenantId: 'demo'
            },
            include: { client: true, deal: true, assignee: true }
        });

        await prisma.activity.create({
            data: {
                type: 'task_created',
                description: `New task created: ${title}`,
                userId: 'demo-user',
                entityType: 'task',
                entityId: task.id,
                tenantId: 'demo'
            }
        });

        return NextResponse.json({ success: true, data: task }, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
    }
}
