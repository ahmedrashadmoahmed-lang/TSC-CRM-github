import { prisma } from './prisma';

// Log audit event
export async function logAudit({
    tenantId,
    userId,
    userName,
    userEmail,
    action,
    entity,
    entityId,
    before = null,
    after = null,
    metadata = null,
    request = null,
}) {
    try {
        const changes = before && after ? calculateDiff(before, after) : null;

        await prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                userName,
                userEmail,
                action,
                entity,
                entityId,
                before,
                after,
                changes,
                ipAddress: request?.headers?.get('x-forwarded-for') || request?.headers?.get('x-real-ip') || null,
                userAgent: request?.headers?.get('user-agent') || null,
                requestId: request?.headers?.get('x-request-id') || null,
                metadata,
            },
        });
    } catch (error) {
        console.error('Error logging audit:', error);
        // Don't throw - audit logging should not break the main operation
    }
}

// Calculate diff between two objects
function calculateDiff(before, after) {
    const changes = {};

    // Get all keys from both objects
    const allKeys = new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {}),
    ]);

    for (const key of allKeys) {
        const beforeValue = before?.[key];
        const afterValue = after?.[key];

        // Skip if values are the same
        if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
            continue;
        }

        changes[key] = {
            from: beforeValue,
            to: afterValue,
        };
    }

    return Object.keys(changes).length > 0 ? changes : null;
}

// Audit actions
export const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    EXPORT: 'EXPORT',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    VIEW: 'VIEW',
};

// Get audit logs for entity
export async function getAuditLogs(tenantId, entity, entityId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    return await prisma.auditLog.findMany({
        where: {
            tenantId,
            entity,
            entityId,
        },
        orderBy: {
            timestamp: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

// Get recent audit logs for tenant
export async function getRecentAuditLogs(tenantId, options = {}) {
    const { limit = 100, offset = 0, userId = null, action = null, entity = null } = options;

    const where = { tenantId };

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    return await prisma.auditLog.findMany({
        where,
        orderBy: {
            timestamp: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

// Get audit statistics
export async function getAuditStats(tenantId, startDate, endDate) {
    const where = {
        tenantId,
        timestamp: {
            gte: startDate,
            lte: endDate,
        },
    };

    const [total, byAction, byEntity, byUser] = await Promise.all([
        // Total count
        prisma.auditLog.count({ where }),

        // By action
        prisma.auditLog.groupBy({
            by: ['action'],
            where,
            _count: true,
        }),

        // By entity
        prisma.auditLog.groupBy({
            by: ['entity'],
            where,
            _count: true,
        }),

        // By user
        prisma.auditLog.groupBy({
            by: ['userId'],
            where,
            _count: true,
            orderBy: {
                _count: {
                    userId: 'desc',
                },
            },
            take: 10,
        }),
    ]);

    return {
        total,
        byAction: byAction.map(item => ({
            action: item.action,
            count: item._count,
        })),
        byEntity: byEntity.map(item => ({
            entity: item.entity,
            count: item._count,
        })),
        topUsers: byUser.map(item => ({
            userId: item.userId,
            count: item._count,
        })),
    };
}
