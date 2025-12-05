import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Authentication Middleware
 * Wraps API routes to ensure user is authenticated
 */
export function withAuth(handler) {
    return async (req, context) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session || !session.user) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please login' },
                    { status: 401 }
                );
            }

            // Attach session to request for use in handler
            req.session = session;
            req.user = session.user;

            return handler(req, context);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 500 }
            );
        }
    };
}

/**
 * Role-based Authorization Middleware
 * Checks if user has one of the required roles
 */
export function requireRole(allowedRoles) {
    return (handler) => {
        return async (req, context) => {
            const session = await getServerSession(authOptions);

            if (!session || !session.user) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please login' },
                    { status: 401 }
                );
            }

            const userRole = session.user.role;
            const hasRole = allowedRoles.includes(userRole);

            if (!hasRole) {
                return NextResponse.json(
                    {
                        error: 'Forbidden - Insufficient permissions',
                        required: allowedRoles,
                        current: userRole
                    },
                    { status: 403 }
                );
            }

            // Attach session to request
            req.session = session;
            req.user = session.user;

            return handler(req, context);
        };
    };
}

/**
 * Permission-based Authorization Middleware
 * Checks if user has required permissions
 */
export function requirePermission(requiredPermissions) {
    return (handler) => {
        return async (req, context) => {
            const session = await getServerSession(authOptions);

            if (!session || !session.user) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please login' },
                    { status: 401 }
                );
            }

            const userRole = session.user.role;

            // Import permissions dynamically to avoid circular dependencies
            const { hasAllPermissions } = await import('@/utils/permissions');

            const hasPermissions = hasAllPermissions(userRole, requiredPermissions);

            if (!hasPermissions) {
                return NextResponse.json(
                    {
                        error: 'Forbidden - Missing required permissions',
                        required: requiredPermissions,
                        role: userRole
                    },
                    { status: 403 }
                );
            }

            // Attach session to request
            req.session = session;
            req.user = session.user;

            return handler(req, context);
        };
    };
}

/**
 * Multi-tenant Isolation Middleware
 * Ensures user can only access their tenant's data
 */
export function withTenant(handler) {
    return async (req, context) => {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login' },
                { status: 401 }
            );
        }

        // Get tenant ID from user session
        const tenantId = session.user.tenantId;

        if (!tenantId) {
            return NextResponse.json(
                { error: 'Forbidden - No tenant assigned' },
                { status: 403 }
            );
        }

        // Attach tenant to request
        req.session = session;
        req.user = session.user;
        req.tenantId = tenantId;

        return handler(req, context);
    };
}

/**
 * Combined Auth + Role + Tenant Middleware
 * Most common use case
 */
export function withAuthAndRole(allowedRoles) {
    return (handler) => {
        return withAuth(
            withTenant(
                requireRole(allowedRoles)(handler)
            )
        );
    };
}

/**
 * Combined Auth + Permission + Tenant Middleware
 */
export function withAuthAndPermission(requiredPermissions) {
    return (handler) => {
        return withAuth(
            withTenant(
                requirePermission(requiredPermissions)(handler)
            )
        );
    };
}

/**
 * Admin Only Middleware
 * Shorthand for admin-only routes
 */
export function adminOnly(handler) {
    return withAuthAndRole(['admin'])(handler);
}

/**
 * Manager or Admin Middleware
 * Shorthand for management routes
 */
export function managerOrAdmin(handler) {
    return withAuthAndRole(['admin', 'manager'])(handler);
}
