import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { checkPermission } from './permissions';
import { prisma, getTenantFromRequest } from './prisma';

// Require authentication
export async function requireAuth(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }

    return session;
}

// Require specific permission
export async function requirePermission(request, permission) {
    const session = await requireAuth(request);

    const hasPermission = await checkPermission(session.user.id, permission, prisma);

    if (!hasPermission) {
        throw new Error(`Forbidden: Missing permission ${permission}`);
    }

    return session;
}

// Require any of the permissions
export async function requireAnyPermission(request, permissions) {
    const session = await requireAuth(request);

    for (const permission of permissions) {
        const has = await checkPermission(session.user.id, permission, prisma);
        if (has) return session;
    }

    throw new Error('Forbidden: Insufficient permissions');
}

// Higher-order function to wrap API routes with auth
export function withAuth(handler, options = {}) {
    return async (request, context) => {
        try {
            // Get session
            const session = await getServerSession(authOptions);

            if (!session || !session.user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            // Check permission if required
            if (options.permission) {
                const hasPermission = await checkPermission(
                    session.user.id,
                    options.permission,
                    prisma
                );

                if (!hasPermission) {
                    return NextResponse.json(
                        { error: 'Forbidden: Insufficient permissions' },
                        { status: 403 }
                    );
                }
            }

            // Get tenant
            const tenant = await getTenantFromRequest(request);

            if (!tenant) {
                return NextResponse.json(
                    { error: 'Tenant not found' },
                    { status: 404 }
                );
            }

            // Add to request context
            request.session = session;
            request.tenant = tenant;
            request.user = session.user;

            // Call the actual handler
            return await handler(request, context);
        } catch (error) {
            console.error('Auth middleware error:', error);

            if (error.message === 'Unauthorized') {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            if (error.message.startsWith('Forbidden')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

// Middleware for tenant-scoped operations
export async function withTenant(handler) {
    return async (request, context) => {
        try {
            const tenant = await getTenantFromRequest(request);

            if (!tenant) {
                return NextResponse.json(
                    { error: 'Tenant not found' },
                    { status: 404 }
                );
            }

            request.tenant = tenant;

            return await handler(request, context);
        } catch (error) {
            console.error('Tenant middleware error:', error);
            return NextResponse.json(
                { error: 'Tenant error' },
                { status: 500 }
            );
        }
    };
}
