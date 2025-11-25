/**
 * Permission Definitions
 * Defines all permissions in the system for RBAC
 */

export const PERMISSIONS = {
    // Customer Permissions
    CUSTOMERS_VIEW: 'customers:view',
    CUSTOMERS_CREATE: 'customers:create',
    CUSTOMERS_UPDATE: 'customers:update',
    CUSTOMERS_DELETE: 'customers:delete',

    // Supplier Permissions
    SUPPLIERS_VIEW: 'suppliers:view',
    SUPPLIERS_CREATE: 'suppliers:create',
    SUPPLIERS_UPDATE: 'suppliers:update',
    SUPPLIERS_DELETE: 'suppliers:delete',

    // Product Permissions
    PRODUCTS_VIEW: 'products:view',
    PRODUCTS_CREATE: 'products:create',
    PRODUCTS_UPDATE: 'products:update',
    PRODUCTS_DELETE: 'products:delete',

    // Invoice Permissions
    INVOICES_VIEW: 'invoices:view',
    INVOICES_CREATE: 'invoices:create',
    INVOICES_UPDATE: 'invoices:update',
    INVOICES_DELETE: 'invoices:delete',
    INVOICES_APPROVE: 'invoices:approve',

    // Purchase Order Permissions
    PO_VIEW: 'po:view',
    PO_CREATE: 'po:create',
    PO_UPDATE: 'po:update',
    PO_DELETE: 'po:delete',
    PO_APPROVE: 'po:approve',

    // Employee Permissions
    EMPLOYEES_VIEW: 'employees:view',
    EMPLOYEES_CREATE: 'employees:create',
    EMPLOYEES_UPDATE: 'employees:update',
    EMPLOYEES_DELETE: 'employees:delete',

    // Payroll Permissions
    PAYROLL_VIEW: 'payroll:view',
    PAYROLL_CREATE: 'payroll:create',
    PAYROLL_UPDATE: 'payroll:update',
    PAYROLL_DELETE: 'payroll:delete',
    PAYROLL_APPROVE: 'payroll:approve',

    // Accounting Permissions
    ACCOUNTING_VIEW: 'accounting:view',
    ACCOUNTING_CREATE: 'accounting:create',
    ACCOUNTING_UPDATE: 'accounting:update',
    ACCOUNTING_DELETE: 'accounting:delete',

    // Report Permissions
    REPORTS_VIEW: 'reports:view',
    REPORTS_EXPORT: 'reports:export',
    REPORTS_FINANCIAL: 'reports:financial',

    // Analytics Permissions
    ANALYTICS_VIEW: 'analytics:view',
    ANALYTICS_ADVANCED: 'analytics:advanced',

    // User Management Permissions
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',

    // Role Management Permissions
    ROLES_VIEW: 'roles:view',
    ROLES_MANAGE: 'roles:manage',

    // Audit Log Permissions
    AUDIT_VIEW: 'audit:view',
    AUDIT_EXPORT: 'audit:export',

    // Settings Permissions
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_UPDATE: 'settings:update',
    SETTINGS_SYSTEM: 'settings:system',
};

/**
 * Role Definitions
 * Maps roles to their permissions
 */
export const ROLES = {
    ADMIN: {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        permissions: Object.values(PERMISSIONS), // All permissions
    },

    MANAGER: {
        name: 'manager',
        displayName: 'Manager',
        description: 'Management level access',
        permissions: [
            // Customers
            PERMISSIONS.CUSTOMERS_VIEW,
            PERMISSIONS.CUSTOMERS_CREATE,
            PERMISSIONS.CUSTOMERS_UPDATE,

            // Suppliers
            PERMISSIONS.SUPPLIERS_VIEW,
            PERMISSIONS.SUPPLIERS_CREATE,
            PERMISSIONS.SUPPLIERS_UPDATE,

            // Products
            PERMISSIONS.PRODUCTS_VIEW,
            PERMISSIONS.PRODUCTS_CREATE,
            PERMISSIONS.PRODUCTS_UPDATE,

            // Invoices
            PERMISSIONS.INVOICES_VIEW,
            PERMISSIONS.INVOICES_CREATE,
            PERMISSIONS.INVOICES_UPDATE,
            PERMISSIONS.INVOICES_APPROVE,

            // Purchase Orders
            PERMISSIONS.PO_VIEW,
            PERMISSIONS.PO_CREATE,
            PERMISSIONS.PO_UPDATE,
            PERMISSIONS.PO_APPROVE,

            // Employees
            PERMISSIONS.EMPLOYEES_VIEW,
            PERMISSIONS.EMPLOYEES_CREATE,
            PERMISSIONS.EMPLOYEES_UPDATE,

            // Payroll
            PERMISSIONS.PAYROLL_VIEW,
            PERMISSIONS.PAYROLL_APPROVE,

            // Reports & Analytics
            PERMISSIONS.REPORTS_VIEW,
            PERMISSIONS.REPORTS_EXPORT,
            PERMISSIONS.REPORTS_FINANCIAL,
            PERMISSIONS.ANALYTICS_VIEW,
            PERMISSIONS.ANALYTICS_ADVANCED,

            // Audit
            PERMISSIONS.AUDIT_VIEW,
        ],
    },

    ACCOUNTANT: {
        name: 'accountant',
        displayName: 'Accountant',
        description: 'Financial and accounting access',
        permissions: [
            // Accounting
            PERMISSIONS.ACCOUNTING_VIEW,
            PERMISSIONS.ACCOUNTING_CREATE,
            PERMISSIONS.ACCOUNTING_UPDATE,

            // Invoices
            PERMISSIONS.INVOICES_VIEW,
            PERMISSIONS.INVOICES_CREATE,
            PERMISSIONS.INVOICES_UPDATE,

            // Purchase Orders
            PERMISSIONS.PO_VIEW,

            // Payroll
            PERMISSIONS.PAYROLL_VIEW,
            PERMISSIONS.PAYROLL_CREATE,
            PERMISSIONS.PAYROLL_UPDATE,

            // Reports
            PERMISSIONS.REPORTS_VIEW,
            PERMISSIONS.REPORTS_EXPORT,
            PERMISSIONS.REPORTS_FINANCIAL,

            // Analytics
            PERMISSIONS.ANALYTICS_VIEW,

            // Customers & Suppliers (view only)
            PERMISSIONS.CUSTOMERS_VIEW,
            PERMISSIONS.SUPPLIERS_VIEW,
            PERMISSIONS.PRODUCTS_VIEW,
        ],
    },

    SALES: {
        name: 'sales',
        displayName: 'Sales Representative',
        description: 'Sales and customer management',
        permissions: [
            // Customers
            PERMISSIONS.CUSTOMERS_VIEW,
            PERMISSIONS.CUSTOMERS_CREATE,
            PERMISSIONS.CUSTOMERS_UPDATE,

            // Products
            PERMISSIONS.PRODUCTS_VIEW,

            // Invoices
            PERMISSIONS.INVOICES_VIEW,
            PERMISSIONS.INVOICES_CREATE,
            PERMISSIONS.INVOICES_UPDATE,

            // Reports
            PERMISSIONS.REPORTS_VIEW,

            // Analytics
            PERMISSIONS.ANALYTICS_VIEW,
        ],
    },

    USER: {
        name: 'user',
        displayName: 'User',
        description: 'Basic user access',
        permissions: [
            PERMISSIONS.CUSTOMERS_VIEW,
            PERMISSIONS.SUPPLIERS_VIEW,
            PERMISSIONS.PRODUCTS_VIEW,
            PERMISSIONS.INVOICES_VIEW,
            PERMISSIONS.PO_VIEW,
            PERMISSIONS.REPORTS_VIEW,
            PERMISSIONS.ANALYTICS_VIEW,
        ],
    },

    VIEWER: {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access',
        permissions: [
            PERMISSIONS.CUSTOMERS_VIEW,
            PERMISSIONS.SUPPLIERS_VIEW,
            PERMISSIONS.PRODUCTS_VIEW,
            PERMISSIONS.INVOICES_VIEW,
            PERMISSIONS.PO_VIEW,
            PERMISSIONS.EMPLOYEES_VIEW,
            PERMISSIONS.REPORTS_VIEW,
            PERMISSIONS.ANALYTICS_VIEW,
        ],
    },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
    const roleConfig = ROLES[role?.toUpperCase()];
    if (!roleConfig) return false;
    return roleConfig.permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role, permissions) {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role, permissions) {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role) {
    const roleConfig = ROLES[role?.toUpperCase()];
    return roleConfig?.permissions || [];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role) {
    const roleConfig = ROLES[role?.toUpperCase()];
    return roleConfig?.displayName || role;
}

/**
 * Get all available roles
 */
export function getAllRoles() {
    return Object.values(ROLES);
}
