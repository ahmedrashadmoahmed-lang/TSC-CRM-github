import { NextResponse } from 'next/server';
import { adminOnly } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filtering and pagination
 */
export const GET = adminOnly(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');
        const search = searchParams.get('search') || '';
        const action = searchParams.get('action') || 'all';
        const entity = searchParams.get('entity') || 'all';
        const dateRange = searchParams.get('dateRange');

        const tenantId = req.tenantId;

        // Build where clause
        const where = {
            tenantId,
            ...(search && {
                OR: [
                    { userName: { contains: search, mode: 'insensitive' } },
                    { userEmail: { contains: search, mode: 'insensitive' } },
                    { entity: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(action !== 'all' && { action }),
            ...(entity !== 'all' && { entity }),
            ...(dateRange && {
                createdAt: {
                    gte: new Date(JSON.parse(dateRange).start),
                    lte: new Date(JSON.parse(dateRange).end),
                },
            }),
        };

        // Get total count
        const total = await prisma.auditLog.count({ where });

        // Get logs
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                userId: true,
                userName: true,
                userEmail: true,
                action: true,
                entity: true,
                entityId: true,
                ipAddress: true,
                userAgent: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            logs,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        return NextResponse.json(
            { error: 'Failed to get audit logs' },
            { status: 500 }
        );
    }
});
