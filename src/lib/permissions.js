// Permission definitions
export const PERMISSIONS = {
    // Invoice permissions
    INVOICE_CREATE: 'invoice.create',
    INVOICE_READ: 'invoice.read',
    INVOICE_UPDATE: 'invoice.update',
    INVOICE_DELETE: 'invoice.delete',
    INVOICE_APPROVE: 'invoice.approve',
    INVOICE_EXPORT: 'invoice.export',

    // Customer permissions
    CUSTOMER_CREATE: 'customer.create',
    CUSTOMER_READ: 'customer.read',
    CUSTOMER_UPDATE: 'customer.update',
    CUSTOMER_DELETE: 'customer.delete',

    // Purchase Order permissions
    PO_CREATE: 'po.create',
    PO_READ: 'po.read',
    PO_UPDATE: 'po.update',
    PO_APPROVE: 'po.approve',

    // Inventory permissions
    INVENTORY_READ: 'inventory.read',
    INVENTORY_ADJUST: 'inventory.adjust',
    INVENTORY_TRANSFER: 'inventory.transfer',

    // Report permissions
    REPORT_VIEW: 'report.view',
    REPORT_EXPORT: 'report.export',

    // Settings permissions
    SETTINGS_MANAGE: 'settings.manage',
    USER_MANAGE: 'user.manage',

    // Employee permissions
    EMPLOYEE_CREATE: 'employee.create',
    EMPLOYEE_READ: 'employee.read',
    EMPLOYEE_UPDATE: 'employee.update',
    EMPLOYEE_DELETE: 'employee.delete',

    // Payroll permissions
    PAYROLL_CREATE: 'payroll.create',
    PAYROLL_READ: 'payroll.read',
    PAYROLL_APPROVE: 'payroll.approve',

    // Supplier permissions
    SUPPLIER_CREATE: 'supplier.create',
    SUPPLIER_READ: 'supplier.read',
    SUPPLIER_UPDATE: 'supplier.update',
    SUPPLIER_DELETE: 'supplier.delete',

    // Product permissions
    PRODUCT_CREATE: 'product.create',
    PRODUCT_READ: 'product.read',
    PRODUCT_UPDATE: 'product.update',
    PRODUCT_DELETE: 'product.delete',

    // Accounting permissions
    ACCOUNTING_VIEW: 'accounting.view',
    ACCOUNTING_ENTRY: 'accounting.entry',
    ACCOUNTING_APPROVE: 'accounting.approve',
};

// Role-Permission matrix
export const ROLE_PERMISSIONS = {
    admin: Object.values(PERMISSIONS),

    sales: [
        PERMISSIONS.INVOICE_CREATE,
        PERMISSIONS.INVOICE_READ,
        PERMISSIONS.INVOICE_UPDATE,
        PERMISSIONS.INVOICE_EXPORT,
        PERMISSIONS.CUSTOMER_CREATE,
        PERMISSIONS.CUSTOMER_READ,
        PERMISSIONS.CUSTOMER_UPDATE,
        PERMISSIONS.PRODUCT_READ,
        PERMISSIONS.REPORT_VIEW,
    ],

    purchasing: [
        PERMISSIONS.PO_CREATE,
        PERMISSIONS.PO_READ,
        PERMISSIONS.PO_UPDATE,
        PERMISSIONS.SUPPLIER_CREATE,
        PERMISSIONS.SUPPLIER_READ,
        PERMISSIONS.SUPPLIER_UPDATE,
        PERMISSIONS.PRODUCT_READ,
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.REPORT_VIEW,
    ],

    accounting: [
        PERMISSIONS.INVOICE_READ,
        PERMISSIONS.INVOICE_APPROVE,
        PERMISSIONS.INVOICE_EXPORT,
        PERMISSIONS.PO_READ,
        PERMISSIONS.CUSTOMER_READ,
        PERMISSIONS.SUPPLIER_READ,
        PERMISSIONS.ACCOUNTING_VIEW,
        PERMISSIONS.ACCOUNTING_ENTRY,
        PERMISSIONS.ACCOUNTING_APPROVE,
        PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.REPORT_EXPORT,
    ],

    warehouse: [
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.INVENTORY_ADJUST,
        PERMISSIONS.INVENTORY_TRANSFER,
        PERMISSIONS.PRODUCT_READ,
        PERMISSIONS.PRODUCT_UPDATE,
        PERMISSIONS.PO_READ,
        PERMISSIONS.REPORT_VIEW,
    ],

    hr: [
        PERMISSIONS.EMPLOYEE_CREATE,
        PERMISSIONS.EMPLOYEE_READ,
        PERMISSIONS.EMPLOYEE_UPDATE,
        PERMISSIONS.PAYROLL_CREATE,
        PERMISSIONS.PAYROLL_READ,
        PERMISSIONS.PAYROLL_APPROVE,
        PERMISSIONS.REPORT_VIEW,
    ],

    manager: [
        PERMISSIONS.INVOICE_READ,
        PERMISSIONS.INVOICE_APPROVE,
        PERMISSIONS.INVOICE_EXPORT,
        PERMISSIONS.PO_READ,
        PERMISSIONS.PO_APPROVE,
        PERMISSIONS.CUSTOMER_READ,
        PERMISSIONS.SUPPLIER_READ,
        PERMISSIONS.EMPLOYEE_READ,
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.ACCOUNTING_VIEW,
        PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.REPORT_EXPORT,
    ],
};

// Separation of Duties rules
export const SEPARATION_OF_DUTIES = [
    {
        name: 'Invoice Creation and Approval',
        description: 'User cannot both create and approve invoices',
        conflictingPermissions: [
            [PERMISSIONS.INVOICE_CREATE, PERMISSIONS.INVOICE_APPROVE],
        ],
    },
    {
        name: 'PO Creation and Approval',
        description: 'User cannot both create and approve purchase orders',
        conflictingPermissions: [
            [PERMISSIONS.PO_CREATE, PERMISSIONS.PO_APPROVE],
        ],
    },
    {
        name: 'Inventory Adjustment and Approval',
        description: 'User cannot both adjust and approve inventory',
        conflictingPermissions: [
            [PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.ACCOUNTING_APPROVE],
        ],
    },
    {
        name: 'Payroll Creation and Approval',
        description: 'User cannot both create and approve payroll',
        conflictingPermissions: [
            [PERMISSIONS.PAYROLL_CREATE, PERMISSIONS.PAYROLL_APPROVE],
        ],
    },
];

// Check if user has permission
export async function checkPermission(userId, permission, prisma) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return false;
        }

        // Check if user has the permission through any of their roles
        const hasPermission = user.roles.some(userRole =>
            userRole.role.permissions.some(rolePermission => {
                const permString = `${rolePermission.permission.resource}.${rolePermission.permission.action}`;
                return permString === permission;
            })
        );

        return hasPermission;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

// Check if user has any of the permissions
export async function checkAnyPermission(userId, permissions, prisma) {
    for (const permission of permissions) {
        const has = await checkPermission(userId, permission, prisma);
        if (has) return true;
    }
    return false;
}

// Check if user has all permissions
export async function checkAllPermissions(userId, permissions, prisma) {
    for (const permission of permissions) {
        const has = await checkPermission(userId, permission, prisma);
        if (!has) return false;
    }
    return true;
}

// Get all user permissions
export async function getUserPermissions(userId, prisma) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return [];
        }

        const permissions = new Set();

        user.roles.forEach(userRole => {
            userRole.role.permissions.forEach(rolePermission => {
                const permString = `${rolePermission.permission.resource}.${rolePermission.permission.action}`;
                permissions.add(permString);
            });
        });

        return Array.from(permissions);
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
}

// Check Separation of Duties violations
export async function checkSoDViolations(userId, newPermissions, prisma) {
    const currentPermissions = await getUserPermissions(userId, prisma);
    const allPermissions = [...currentPermissions, ...newPermissions];

    const violations = [];

    for (const sod of SEPARATION_OF_DUTIES) {
        for (const conflictPair of sod.conflictingPermissions) {
            const hasAll = conflictPair.every(perm => allPermissions.includes(perm));
            if (hasAll) {
                violations.push({
                    rule: sod.name,
                    description: sod.description,
                    conflictingPermissions: conflictPair,
                });
            }
        }
    }

    return violations;
}
