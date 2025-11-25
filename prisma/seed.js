const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create Demo Tenant
    console.log('Creating demo tenant...');
    const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            name: 'Demo Company',
            subdomain: 'demo',
            plan: 'professional',
            status: 'active',
            billingEmail: 'billing@demo.com',
            maxUsers: 20,
            maxStorage: 5000,
        },
    });
    console.log('✅ Tenant created:', tenant.name);

    // 2. Create Tenant Settings
    console.log('Creating tenant settings...');
    await prisma.tenantSettings.upsert({
        where: { tenantId: tenant.id },
        update: {},
        create: {
            tenantId: tenant.id,
            defaultVatRate: 14.0,
            profitTaxRate: 2.5,
            currency: 'EGP',
            currencySymbol: 'ج.م',
            invoicePrefix: 'INV',
            invoiceNumberStart: 1000,
            paymentTermDays: 30,
            requireInvoiceApproval: false,
            requirePOApproval: true,
            poApprovalThreshold: 10000,
            defaultLanguage: 'ar',
            timezone: 'Africa/Cairo',
            dateFormat: 'DD/MM/YYYY',
            enableAI: true,
            enableMultiWarehouse: true,
            enableRealTimeNotifications: true,
        },
    });
    console.log('✅ Tenant settings created');

    // 3. Create Roles
    console.log('Creating roles...');
    const roles = [
        {
            name: 'admin',
            displayName: 'Administrator',
            displayNameAr: 'مدير النظام',
            description: 'Full system access',
            isSystem: true,
        },
        {
            name: 'sales',
            displayName: 'Sales',
            displayNameAr: 'مبيعات',
            description: 'Sales and customer management',
            isSystem: true,
        },
        {
            name: 'purchasing',
            displayName: 'Purchasing',
            displayNameAr: 'مشتريات',
            description: 'Purchase orders and supplier management',
            isSystem: true,
        },
        {
            name: 'accounting',
            displayName: 'Accounting',
            displayNameAr: 'محاسبة',
            description: 'Financial management and reporting',
            isSystem: true,
        },
        {
            name: 'warehouse',
            displayName: 'Warehouse',
            displayNameAr: 'مخازن',
            description: 'Inventory and warehouse management',
            isSystem: true,
        },
        {
            name: 'hr',
            displayName: 'Human Resources',
            displayNameAr: 'موارد بشرية',
            description: 'Employee and payroll management',
            isSystem: true,
        },
    ];

    for (const roleData of roles) {
        await prisma.role.upsert({
            where: { name: roleData.name },
            update: {},
            create: roleData,
        });
    }
    console.log('✅ Roles created');

    // 4. Create Permissions
    console.log('Creating permissions...');
    const permissions = [
        // Invoice permissions
        { resource: 'invoice', action: 'create', displayName: 'Create Invoice', displayNameAr: 'إنشاء فاتورة' },
        { resource: 'invoice', action: 'read', displayName: 'View Invoice', displayNameAr: 'عرض فاتورة' },
        { resource: 'invoice', action: 'update', displayName: 'Edit Invoice', displayNameAr: 'تعديل فاتورة' },
        { resource: 'invoice', action: 'delete', displayName: 'Delete Invoice', displayNameAr: 'حذف فاتورة' },
        { resource: 'invoice', action: 'approve', displayName: 'Approve Invoice', displayNameAr: 'اعتماد فاتورة' },
        { resource: 'invoice', action: 'export', displayName: 'Export Invoice', displayNameAr: 'تصدير فاتورة' },

        // Customer permissions
        { resource: 'customer', action: 'create', displayName: 'Create Customer', displayNameAr: 'إنشاء عميل' },
        { resource: 'customer', action: 'read', displayName: 'View Customer', displayNameAr: 'عرض عميل' },
        { resource: 'customer', action: 'update', displayName: 'Edit Customer', displayNameAr: 'تعديل عميل' },
        { resource: 'customer', action: 'delete', displayName: 'Delete Customer', displayNameAr: 'حذف عميل' },

        // PO permissions
        { resource: 'po', action: 'create', displayName: 'Create PO', displayNameAr: 'إنشاء أمر شراء' },
        { resource: 'po', action: 'read', displayName: 'View PO', displayNameAr: 'عرض أمر شراء' },
        { resource: 'po', action: 'update', displayName: 'Edit PO', displayNameAr: 'تعديل أمر شراء' },
        { resource: 'po', action: 'approve', displayName: 'Approve PO', displayNameAr: 'اعتماد أمر شراء' },

        // Inventory permissions
        { resource: 'inventory', action: 'read', displayName: 'View Inventory', displayNameAr: 'عرض مخزون' },
        { resource: 'inventory', action: 'adjust', displayName: 'Adjust Inventory', displayNameAr: 'تسوية مخزون' },
        { resource: 'inventory', action: 'transfer', displayName: 'Transfer Inventory', displayNameAr: 'نقل مخزون' },

        // Report permissions
        { resource: 'report', action: 'view', displayName: 'View Reports', displayNameAr: 'عرض تقارير' },
        { resource: 'report', action: 'export', displayName: 'Export Reports', displayNameAr: 'تصدير تقارير' },

        // Settings permissions
        { resource: 'settings', action: 'manage', displayName: 'Manage Settings', displayNameAr: 'إدارة الإعدادات' },
        { resource: 'user', action: 'manage', displayName: 'Manage Users', displayNameAr: 'إدارة المستخدمين' },
    ];

    for (const permData of permissions) {
        await prisma.permission.upsert({
            where: { resource_action: { resource: permData.resource, action: permData.action } },
            update: {},
            create: permData,
        });
    }
    console.log('✅ Permissions created');

    // 5. Assign Permissions to Roles
    console.log('Assigning permissions to roles...');

    // Admin gets all permissions
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const allPermissions = await prisma.permission.findMany();

    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: perm.id,
            },
        });
    }
    console.log('✅ Admin permissions assigned');

    // 6. Create Admin User
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'admin@example.com' } },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            status: 'active',
            emailVerified: new Date(),
            language: 'ar',
            theme: 'dark',
        },
    });

    // Assign admin role to user
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });
    console.log('✅ Admin user created');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin@123');

    // 7. Create Default Warehouse
    console.log('Creating default warehouse...');
    await prisma.warehouse.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: 'MAIN' } },
        update: {},
        create: {
            tenantId: tenant.id,
            code: 'MAIN',
            name: 'Main Warehouse',
            location: 'Cairo, Egypt',
            isDefault: true,
            isActive: true,
        },
    });
    console.log('✅ Warehouse created');

    // 8. Create Chart of Accounts
    console.log('Creating chart of accounts...');
    const accounts = [
        // Assets
        { code: '1000', name: 'Assets', nameAr: 'الأصول', type: 'asset', category: 'header', normalBalance: 'debit' },
        { code: '1100', name: 'Current Assets', nameAr: 'أصول متداولة', type: 'asset', category: 'current_asset', normalBalance: 'debit' },
        { code: '1110', name: 'Cash', nameAr: 'النقدية', type: 'asset', category: 'current_asset', normalBalance: 'debit' },
        { code: '1120', name: 'Bank', nameAr: 'البنك', type: 'asset', category: 'current_asset', normalBalance: 'debit' },
        { code: '1200', name: 'Accounts Receivable', nameAr: 'العملاء', type: 'asset', category: 'current_asset', normalBalance: 'debit' },
        { code: '1300', name: 'Inventory', nameAr: 'المخزون', type: 'asset', category: 'current_asset', normalBalance: 'debit' },

        // Liabilities
        { code: '2000', name: 'Liabilities', nameAr: 'الخصوم', type: 'liability', category: 'header', normalBalance: 'credit' },
        { code: '2100', name: 'VAT Payable', nameAr: 'ضريبة القيمة المضافة', type: 'liability', category: 'current_liability', normalBalance: 'credit' },
        { code: '2200', name: 'Accounts Payable', nameAr: 'الموردين', type: 'liability', category: 'current_liability', normalBalance: 'credit' },

        // Equity
        { code: '3000', name: 'Equity', nameAr: 'حقوق الملكية', type: 'equity', category: 'equity', normalBalance: 'credit' },
        { code: '3100', name: 'Capital', nameAr: 'رأس المال', type: 'equity', category: 'equity', normalBalance: 'credit' },

        // Revenue
        { code: '4000', name: 'Revenue', nameAr: 'الإيرادات', type: 'revenue', category: 'revenue', normalBalance: 'credit' },
        { code: '4100', name: 'Sales Revenue', nameAr: 'إيرادات المبيعات', type: 'revenue', category: 'revenue', normalBalance: 'credit' },

        // Expenses
        { code: '5000', name: 'Expenses', nameAr: 'المصروفات', type: 'expense', category: 'expense', normalBalance: 'debit' },
        { code: '5100', name: 'Cost of Goods Sold', nameAr: 'تكلفة البضاعة المباعة', type: 'expense', category: 'expense', normalBalance: 'debit' },
        { code: '5200', name: 'Operating Expenses', nameAr: 'مصروفات تشغيلية', type: 'expense', category: 'expense', normalBalance: 'debit' },
    ];

    for (const accData of accounts) {
        await prisma.account.upsert({
            where: { tenantId_code: { tenantId: tenant.id, code: accData.code } },
            update: {},
            create: {
                tenantId: tenant.id,
                ...accData,
            },
        });
    }
    console.log('✅ Chart of accounts created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin@123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
