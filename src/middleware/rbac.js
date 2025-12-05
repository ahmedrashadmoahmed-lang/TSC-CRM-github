/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles, permissions, and access control rules
 */

// Available roles in the system
export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    USER: 'USER',
    VIEWER: 'VIEWER',
};

// Permission definitions
export const PERMISSIONS = {
    // RFQ Permissions
    'rfq:create': ['ADMIN', 'MANAGER', 'USER'],
    'rfq:read': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'rfq:update': ['ADMIN', 'MANAGER', 'USER'],
    'rfq:delete': ['ADMIN', 'MANAGER'],
    'rfq:approve': ['ADMIN', 'MANAGER'],
    'rfq:convert_to_po': ['ADMIN', 'MANAGER'],

    // Invoice Permissions
    'invoice:create': ['ADMIN', 'MANAGER'],
    'invoice:read': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'invoice:update': ['ADMIN', 'MANAGER'],
    'invoice:delete': ['ADMIN'],
    'invoice:approve': ['ADMIN', 'MANAGER'],

    // Purchase Order Permissions
    'po:create': ['ADMIN', 'MANAGER'],
    'po:read': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'po:update': ['ADMIN', 'MANAGER'],
    'po:delete': ['ADMIN'],
    'po:approve': ['ADMIN', 'MANAGER'],

    // Customer Permissions
    'customer:create': ['ADMIN', 'MANAGER', 'USER'],
    'customer:read': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'customer:update': ['ADMIN', 'MANAGER', 'USER'],
    'customer:delete': ['ADMIN', 'MANAGER'],

    // Supplier Permissions
    'supplier:create': ['ADMIN', 'MANAGER'],
    'supplier:read': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'supplier:update': ['ADMIN', 'MANAGER'],
    'supplier:delete': ['ADMIN'],

    // Product Permissions
    'product:create': ['ADMIN', 'MANAGER'],
    'product:read': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'product:update': ['ADMIN', 'MANAGER'],
    'product:delete': ['ADMIN'],

    // User Management
    'user:create': ['ADMIN'],
    'user:read': ['ADMIN', 'MANAGER'],
    'user:update': ['ADMIN'],
    'user:delete': ['ADMIN'],
    'user:change_role': ['ADMIN'],

    // Reports & Analytics
    'reports:view': ['ADMIN', 'MANAGER', 'USER'],
    'reports:export': ['ADMIN', 'MANAGER'],
    'reports:financial': ['ADMIN', 'MANAGER'],

    // Settings
    'settings:view': ['ADMIN', 'MANAGER'],
    'settings:update': ['ADMIN'],

    // Audit Logs
    'audit:view': ['ADMIN'],
    'audit:export': ['ADMIN'],

    // Dashboard
    'dashboard:view': ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    'dashboard:customize': ['ADMIN', 'MANAGER', 'USER'],
};

/**
 * Check if a role has a specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
        console.warn(`Permission "${permission}" not defined`);
        return false;
    }

    return allowedRoles.includes(userRole);
}

/**
 * Check if a role has all specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(userRole, permissions) {
    return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Check if a role has any of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(userRole, permissions) {
    return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 * @param {string} userRole - User's role
 * @returns {string[]} Array of permissions
 */
export function getRolePermissions(userRole) {
    return Object.keys(PERMISSIONS).filter(permission =>
        hasPermission(userRole, permission)
    );
}

/**
 * Middleware wrapper to require specific permission
 * @param {string} permission - Required permission
 * @returns {Function} Middleware function
 */
export function requirePermission(permission) {
    return async (request, session) => {
        if (!session || !session.user) {
            return {
                error: 'Unauthorized',
                status: 401,
            };
        }

        const userRole = session.user.role;

        if (!hasPermission(userRole, permission)) {
            return {
                error: `Forbidden - Missing permission: ${permission}`,
                required: permission,
                userRole,
                status: 403,
            };
        }

        return { authorized: true };
    };
}

/**
 * Middleware wrapper to require any of multiple permissions
 * @param {string[]} permissions - Array of permissions (user needs at least one)
 * @returns {Function} Middleware function
 */
export function requireAnyPermission(permissions) {
    return async (request, session) => {
        if (!session || !session.user) {
            return {
                error: 'Unauthorized',
                status: 401,
            };
        }

        const userRole = session.user.role;

        if (!hasAnyPermission(userRole, permissions)) {
            return {
                error: 'Forbidden - Missing required permissions',
                required: permissions,
                userRole,
                status: 403,
            };
        }

        return { authorized: true };
    };
}

/**
 * Middleware wrapper to require all of multiple permissions
 * @param {string[]} permissions - Array of permissions (user needs all)
 * @returns {Function} Middleware function
 */
export function requireAllPermissions(permissions) {
    return async (request, session) => {
        if (!session || !session.user) {
            return {
                error: 'Unauthorized',
                status: 401,
            };
        }

        const userRole = session.user.role;

        if (!hasAllPermissions(userRole, permissions)) {
            const missing = permissions.filter(p => !hasPermission(userRole, p));
            return {
                error: 'Forbidden - Missing required permissions',
                required: permissions,
                missing,
                userRole,
                status: 403,
            };
        }

        return { authorized: true };
    };
}

/**
 * Check if user is admin
 * @param {any} session - NextAuth session
 * @returns {boolean}
 */
export function isAdmin(session) {
    return session?.user?.role === ROLES.ADMIN;
}

/**
 * Check if user is manager or admin
 * @param {any} session - NextAuth session
 * @returns {boolean}
 */
export function isManagerOrAdmin(session) {
    const role = session?.user?.role;
    return role === ROLES.ADMIN || role === ROLES.MANAGER;
}
