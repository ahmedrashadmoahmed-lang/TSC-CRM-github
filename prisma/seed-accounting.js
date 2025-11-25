const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:Admin123@localhost:5433/erp_database?schema=public",
        },
    },
});

async function seedChartOfAccounts() {
    console.log('🌱 Seeding Chart of Accounts...');

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error('❌ No tenant found. Please create a tenant first.');
        return;
    }

    // Standard Chart of Accounts (Egyptian/Arabic)
    const accounts = [
        // ASSETS (الأصول)
        { code: '1000', name: 'الأصول', type: 'asset', level: 0, parentId: null },
        { code: '1100', name: 'الأصول المتداولة', type: 'asset', level: 1, parentCode: '1000' },
        { code: '1110', name: 'النقدية والبنوك', type: 'asset', level: 2, parentCode: '1100' },
        { code: '1111', name: 'الصندوق', type: 'asset', level: 3, parentCode: '1110' },
        { code: '1112', name: 'البنك - الحساب الجاري', type: 'asset', level: 3, parentCode: '1110' },
        { code: '1120', name: 'العملاء والمدينون', type: 'asset', level: 2, parentCode: '1100' },
        { code: '1121', name: 'حسابات العملاء', type: 'asset', level: 3, parentCode: '1120' },
        { code: '1130', name: 'المخزون', type: 'asset', level: 2, parentCode: '1100' },
        { code: '1131', name: 'مخزون البضائع', type: 'asset', level: 3, parentCode: '1130' },

        { code: '1200', name: 'الأصول الثابتة', type: 'asset', level: 1, parentCode: '1000' },
        { code: '1210', name: 'الأراضي والمباني', type: 'asset', level: 2, parentCode: '1200' },
        { code: '1220', name: 'الآلات والمعدات', type: 'asset', level: 2, parentCode: '1200' },
        { code: '1230', name: 'الأثاث والتجهيزات', type: 'asset', level: 2, parentCode: '1200' },
        { code: '1240', name: 'السيارات', type: 'asset', level: 2, parentCode: '1200' },
        { code: '1250', name: 'مجمع الإهلاك', type: 'asset', level: 2, parentCode: '1200' },

        // LIABILITIES (الخصوم)
        { code: '2000', name: 'الخصوم', type: 'liability', level: 0, parentId: null },
        { code: '2100', name: 'الخصوم المتداولة', type: 'liability', level: 1, parentCode: '2000' },
        { code: '2110', name: 'الموردون والدائنون', type: 'liability', level: 2, parentCode: '2100' },
        { code: '2111', name: 'حسابات الموردين', type: 'liability', level: 3, parentCode: '2110' },
        { code: '2120', name: 'الضرائب المستحقة', type: 'liability', level: 2, parentCode: '2100' },
        { code: '2121', name: 'ضريبة القيمة المضافة', type: 'liability', level: 3, parentCode: '2120' },
        { code: '2130', name: 'المرتبات المستحقة', type: 'liability', level: 2, parentCode: '2100' },

        { code: '2200', name: 'الخصوم طويلة الأجل', type: 'liability', level: 1, parentCode: '2000' },
        { code: '2210', name: 'القروض طويلة الأجل', type: 'liability', level: 2, parentCode: '2200' },

        // EQUITY (حقوق الملكية)
        { code: '3000', name: 'حقوق الملكية', type: 'equity', level: 0, parentId: null },
        { code: '3100', name: 'رأس المال', type: 'equity', level: 1, parentCode: '3000' },
        { code: '3200', name: 'الأرباح المحتجزة', type: 'equity', level: 1, parentCode: '3000' },
        { code: '3300', name: 'أرباح العام الحالي', type: 'equity', level: 1, parentCode: '3000' },

        // REVENUE (الإيرادات)
        { code: '4000', name: 'الإيرادات', type: 'revenue', level: 0, parentId: null },
        { code: '4100', name: 'إيرادات المبيعات', type: 'revenue', level: 1, parentCode: '4000' },
        { code: '4110', name: 'مبيعات البضائع', type: 'revenue', level: 2, parentCode: '4100' },
        { code: '4200', name: 'إيرادات أخرى', type: 'revenue', level: 1, parentCode: '4000' },

        // EXPENSES (المصروفات)
        { code: '5000', name: 'المصروفات', type: 'expense', level: 0, parentId: null },
        { code: '5100', name: 'تكلفة البضاعة المباعة', type: 'expense', level: 1, parentCode: '5000' },
        { code: '5200', name: 'المصروفات الإدارية', type: 'expense', level: 1, parentCode: '5000' },
        { code: '5210', name: 'المرتبات والأجور', type: 'expense', level: 2, parentCode: '5200' },
        { code: '5220', name: 'الإيجار', type: 'expense', level: 2, parentCode: '5200' },
        { code: '5230', name: 'الكهرباء والمياه', type: 'expense', level: 2, parentCode: '5200' },
        { code: '5240', name: 'الاتصالات', type: 'expense', level: 2, parentCode: '5200' },
        { code: '5250', name: 'القرطاسية', type: 'expense', level: 2, parentCode: '5200' },
        { code: '5300', name: 'المصروفات التسويقية', type: 'expense', level: 1, parentCode: '5000' },
        { code: '5310', name: 'الإعلانات', type: 'expense', level: 2, parentCode: '5300' },
        { code: '5400', name: 'المصروفات المالية', type: 'expense', level: 1, parentCode: '5000' },
        { code: '5410', name: 'فوائد القروض', type: 'expense', level: 2, parentCode: '5400' },
    ];

    // Create accounts with parent relationships
    const accountMap = new Map();

    for (const acc of accounts) {
        let parentId = null;
        if (acc.parentCode) {
            parentId = accountMap.get(acc.parentCode);
        }

        const created = await prisma.account.create({
            data: {
                code: acc.code,
                name: acc.name,
                type: acc.type,
                level: acc.level,
                parentId: parentId,
                isActive: true,
                tenantId: tenant.id,
            },
        });

        accountMap.set(acc.code, created.id);
        console.log(`✅ Created: ${acc.code} - ${acc.name}`);
    }

    console.log(`\n✅ Successfully seeded ${accounts.length} accounts!`);
}

async function seedCurrencies() {
    console.log('\n🌍 Seeding Currencies...');

    const tenant = await prisma.tenant.findFirst();

    const currencies = [
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', rate: 1, isBase: true },
        { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.032, isBase: false },
        { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.029, isBase: false },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 0.12, isBase: false },
    ];

    for (const curr of currencies) {
        await prisma.currency.create({
            data: {
                ...curr,
                tenantId: tenant.id,
            },
        });
        console.log(`✅ Created currency: ${curr.code} - ${curr.name}`);
    }

    console.log(`\n✅ Successfully seeded ${currencies.length} currencies!`);
}

async function main() {
    try {
        await seedChartOfAccounts();
        await seedCurrencies();
        console.log('\n🎉 Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
