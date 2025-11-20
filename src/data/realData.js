// Real business data from user's spreadsheet - Complete ERP Data

// Sales Invoices (9 sample invoices from 77 total)
export const invoices = [
    {
        id: 'INV-243-1233',
        date: '2025-01-09',
        customerId: 'C-202121',
        customerName: 'الإسكندرية للمنتجات البترولية - اسبك',
        description: '2*59A Copy',
        salesPerson: 'منة',
        type: 'ضريبية',
        salesValue: 1916.67,
        profitTax: 19.17,
        vat: 268.33,
        hasDiscount: true,
        discounts: 0,
        finalValue: 2165.84,
        collected: 2185.00,
        collectionDate: '2025-01-09',
        balance: -19.16,
        status: 'paid',
        notes: 'تم التحصيل و تم استلام اشعار الخصم'
    },
    {
        id: 'INV-244-1234',
        date: '2025-01-15',
        customerId: 'C-202162',
        customerName: 'نادي سموحة',
        description: '3*indoor UNV',
        salesPerson: 'منة',
        type: 'ضريبية',
        salesValue: 3242.11,
        profitTax: 32.42,
        vat: 453.90,
        hasDiscount: true,
        discounts: 0,
        finalValue: 3663.58,
        collected: 3665.00,
        collectionDate: '2025-01-15',
        balance: -1.42,
        status: 'paid',
        notes: 'تم التحصيل و تم استلام اشعار الخصم'
    },
    {
        id: 'INV-245-1235',
        date: '2025-01-19',
        customerId: 'C-202174',
        customerName: 'مستشفي سموحة الدولي',
        description: '25*kingstone data traeler 64gb',
        salesPerson: 'منة',
        type: 'ضريبية',
        salesValue: 6030.70,
        profitTax: 60.31,
        vat: 844.30,
        hasDiscount: true,
        discounts: 0,
        finalValue: 6814.69,
        collected: 6875.00,
        collectionDate: '2025-02-05',
        balance: -60.31,
        status: 'paid',
        notes: 'تم التحصيل و تم استلام اشعار الخصم'
    },
    {
        id: 'INV-246-1236',
        date: '2025-01-28',
        customerId: 'C-202190',
        customerName: 'Madar Group مدار جروب',
        description: '1*toner xerox',
        salesPerson: 'هبة',
        type: 'ضريبية',
        salesValue: 22000.00,
        profitTax: 220.00,
        vat: 3080.00,
        hasDiscount: true,
        discounts: 0,
        finalValue: 24860.00,
        collected: 24860.00,
        collectionDate: '2025-02-18',
        balance: 0,
        status: 'paid',
        notes: 'تم التحصيل و لم يتم استلام اشعار الخصم'
    },
    {
        id: 'INV-261-1251',
        date: '2025-01-28',
        customerId: 'C-202197',
        customerName: 'New Marina Plastic industries',
        description: 'toner hp 4* 1102 - 2* 1018 * 2*2055',
        salesPerson: 'منة',
        type: 'ضريبية',
        salesValue: 34857.02,
        profitTax: 348.57,
        vat: 4879.98,
        hasDiscount: true,
        discounts: 0,
        finalValue: 39388.43,
        collected: 39388.43,
        collectionDate: '2025-04-09',
        balance: 0,
        status: 'paid',
        notes: 'تم التحصيل و تم استلام اشعار الخصم'
    },
    {
        id: 'INV-1313',
        date: '2025-10-13',
        customerId: 'C-202188',
        customerName: 'جامعة فاروس PUA',
        description: 'جهاز مسح ضوئى',
        salesPerson: 'دعاء',
        type: 'ضريبية',
        salesValue: 8940.35,
        profitTax: 89.40,
        vat: 1251.65,
        hasDiscount: true,
        discounts: 0,
        finalValue: 10102.59,
        collected: 0,
        collectionDate: null,
        balance: 10102.59,
        status: 'pending',
        notes: ''
    },
    {
        id: 'INV-1316',
        date: '2025-10-22',
        customerId: 'C-202110',
        customerName: 'شركة الاسكندرية لتوزيع الكهرباء',
        description: '67 كاميرا +8 هارد+2دى فى ار +2كابل',
        salesPerson: 'دعاء',
        type: 'ضريبية',
        salesValue: 230447.00,
        profitTax: 0,
        vat: 23262.59,
        hasDiscount: false,
        discounts: 0,
        finalValue: 262709.68,
        collected: 0,
        collectionDate: null,
        balance: 262709.68,
        status: 'pending',
        notes: ''
    },
    {
        id: 'INV-1318',
        date: '2025-11-13',
        customerId: 'C-202122',
        customerName: 'شركة صقر للأغذية',
        description: 'طابعه hp',
        salesPerson: 'دعاء',
        type: 'ضريبية',
        salesValue: 9386.00,
        profitTax: 0,
        vat: 1314.04,
        hasDiscount: false,
        discounts: 0,
        finalValue: 10700.04,
        collected: 0,
        collectionDate: null,
        balance: 10700.04,
        status: 'pending',
        notes: ''
    },
    {
        id: 'INV-1319',
        date: '2025-11-13',
        customerId: 'C-202177',
        customerName: 'جمعية سيدي جابر الخيرية',
        description: '12 كاميرا وبند أكسوارات وهارد ودى فى ار  وتركيب برو راك',
        salesPerson: 'منة',
        type: 'ضريبية',
        salesValue: 35751.26,
        profitTax: 0,
        vat: 5005.18,
        hasDiscount: false,
        discounts: 0,
        finalValue: 40756.44,
        collected: 0,
        collectionDate: null,
        balance: 40756.44,
        status: 'pending',
        notes: ''
    }
];

// Purchase Orders (7 sample POs from user's data)
export const purchaseOrders = [
    {
        id: 'PO-23',
        date: '2025-01-16',
        salesInvoiceId: 'INV-243-1233',
        supplierId: 'S-202114',
        supplierName: 'المتحدة',
        category: 'اخري',
        description: '2*59A Copy',
        type: 'ضريبية',
        purchaseValue: 1270.00,
        profitTax: 12.70,
        vat: 177.80,
        hasDiscount: true,
        finalValue: 1435.10,
        paymentDate: '2025-01-16',
        paid: 1435,
        balance: 0,
        status: 'paid',
        notes: 'تم تسليم اشعار الخصم'
    },
    {
        id: 'PO-10',
        date: '2025-01-19',
        salesInvoiceId: 'INV-244-1234',
        supplierId: 'S-202134',
        supplierName: 'كرنفال',
        category: 'اخري',
        description: '3*indoor UNV',
        type: 'ضريبية',
        purchaseValue: 2947.38,
        profitTax: 29.47,
        vat: 412.63,
        hasDiscount: true,
        finalValue: 3330.54,
        paymentDate: '2025-01-19',
        paid: 3331,
        balance: 0,
        status: 'paid',
        notes: 'تم تسليم اشعار الخصم'
    },
    {
        id: 'PO-Inv-9044',
        date: '2025-01-23',
        salesInvoiceId: 'INV-245-1235',
        supplierId: 'S-202274',
        supplierName: 'تقنية للتوكيلات التجارية',
        category: 'اخري',
        description: '25*kingstone data traeler 64gb',
        type: 'ضريبية',
        purchaseValue: 4605.25,
        profitTax: 46.05,
        vat: 644.74,
        hasDiscount: true,
        finalValue: 5203.93,
        paymentDate: '2025-01-23',
        paid: 5204,
        balance: 0,
        status: 'paid',
        notes: 'تم تسليم اشعار الخصم'
    },
    {
        id: 'PO-7634',
        date: '2025-01-26',
        salesInvoiceId: 'INV-246-1236',
        supplierId: 'S-202273',
        supplierName: 'شركة المجد للتجارة',
        category: 'اخري',
        description: '1*Toner xerox 106R03745 set4',
        type: 'ضريبية',
        purchaseValue: 14693.00,
        profitTax: 146.93,
        vat: 2057.02,
        hasDiscount: true,
        finalValue: 16603.09,
        paymentDate: '2025-01-26',
        paid: 16603,
        balance: 0,
        status: 'paid',
        notes: 'تم تسليم اشعار الخصم'
    },
    {
        id: 'PO-276',
        date: '2025-10-15',
        salesInvoiceId: 'INV-1316',
        supplierId: 'S-202134',
        supplierName: 'كرنفال',
        category: 'كاميرات',
        description: '64 كاميرات',
        type: 'ضريبية',
        purchaseValue: 119912.00,
        profitTax: 1199.12,
        vat: 16787.68,
        hasDiscount: true,
        finalValue: 135500.56,
        paymentDate: null,
        paid: 135501,
        balance: 0,
        status: 'paid',
        notes: 'تم تسليم اشعار الخصم'
    },
    {
        id: 'PO-65512',
        date: '2025-11-09',
        salesInvoiceId: 'INV-1318',
        supplierId: 'S-202295',
        supplierName: 'اليجاس فور كمبيوتر ميديا',
        category: 'طابعات',
        description: 'طابعه أتش بى',
        type: 'ضريبية',
        purchaseValue: 8771.93,
        profitTax: 87.72,
        vat: 1228.07,
        hasDiscount: true,
        finalValue: 9912.28,
        paymentDate: '2025-11-09',
        paid: 9912,
        balance: 0,
        status: 'paid',
        notes: ''
    },
    {
        id: 'PO-3058',
        date: '2025-11-10',
        salesInvoiceId: 'INV-1319',
        supplierId: 'S-202296',
        supplierName: 'محمد محفوظ فكره',
        category: 'كاميرات',
        description: '12 كاميرا + جهاز دى فى أر',
        type: 'ضريبية',
        purchaseValue: 7264.00,
        profitTax: 72.64,
        vat: 1016.96,
        hasDiscount: false,
        finalValue: 8280.96,
        paymentDate: '2025-11-10',
        paid: 8281,
        balance: 0,
        status: 'paid',
        notes: ''
    }
];

// Suppliers (8 main suppliers)
export const suppliers = [
    {
        id: 'S-202114',
        name: 'المتحدة',
        category: 'اخري',
        totalOrders: 3,
        totalValue: 4500.00,
        rating: 4.8,
        status: 'active'
    },
    {
        id: 'S-202134',
        name: 'كرنفال',
        category: 'كاميرات',
        totalOrders: 5,
        totalValue: 250000.00,
        rating: 4.9,
        status: 'active'
    },
    {
        id: 'S-202274',
        name: 'تقنية للتوكيلات التجارية',
        category: 'تخزين',
        totalOrders: 2,
        totalValue: 15000.00,
        rating: 4.7,
        status: 'active'
    },
    {
        id: 'S-202273',
        name: 'شركة المجد للتجارة',
        category: 'طابعات',
        totalOrders: 1,
        totalValue: 16603.00,
        rating: 4.6,
        status: 'active'
    },
    {
        id: 'S-202267',
        name: 'Saudi Technology سعودي تكنولوجي',
        category: 'تخزين',
        totalOrders: 8,
        totalValue: 120000.00,
        rating: 4.9,
        status: 'active'
    },
    {
        id: 'S-202101',
        name: 'شرق اسيا للنظم والحاسبات',
        category: 'أجهزة',
        totalOrders: 6,
        totalValue: 95000.00,
        rating: 4.8,
        status: 'active'
    },
    {
        id: 'S-202132',
        name: 'بيتا نتورك',
        category: 'شبكات',
        totalOrders: 7,
        totalValue: 85000.00,
        rating: 4.7,
        status: 'active'
    },
    {
        id: 'S-202105',
        name: 'وينر براند',
        category: 'طابعات',
        totalOrders: 5,
        totalValue: 55000.00,
        rating: 4.6,
        status: 'active'
    }
];

// Customers (10 main customers)
export const customers = [
    {
        id: 'C-202121',
        name: 'الإسكندرية للمنتجات البترولية - اسبك',
        type: 'corporate',
        totalInvoices: 3,
        totalValue: 9445.20,
        status: 'active'
    },
    {
        id: 'C-202162',
        name: 'نادي سموحة',
        type: 'corporate',
        totalInvoices: 3,
        totalValue: 15457.18,
        status: 'active'
    },
    {
        id: 'C-202174',
        name: 'مستشفي سموحة الدولي',
        type: 'corporate',
        totalInvoices: 6,
        totalValue: 62318.11,
        status: 'active'
    },
    {
        id: 'C-202190',
        name: 'Madar Group مدار جروب',
        type: 'corporate',
        totalInvoices: 3,
        totalValue: 36260.57,
        status: 'active'
    },
    {
        id: 'C-202110',
        name: 'شركة الاسكندرية لتوزيع الكهرباء',
        type: 'corporate',
        totalInvoices: 10,
        totalValue: 640000.00,
        status: 'active'
    },
    {
        id: 'C-202188',
        name: 'جامعة فاروس PUA',
        type: 'corporate',
        totalInvoices: 4,
        totalValue: 54249.90,
        status: 'active'
    },
    {
        id: 'C-202111',
        name: 'نهضة مصر للخدمات البيئية',
        type: 'corporate',
        totalInvoices: 5,
        totalValue: 69640.51,
        status: 'active'
    },
    {
        id: 'C-202198',
        name: 'شركة صقر للاستثمار',
        type: 'corporate',
        totalInvoices: 4,
        totalValue: 43978.38,
        status: 'active'
    },
    {
        id: 'C-202122',
        name: 'شركة صقر للأغذية',
        type: 'corporate',
        totalInvoices: 4,
        totalValue: 113793.44,
        status: 'active'
    },
    {
        id: 'C-202177',
        name: 'جمعية سيدي جابر الخيرية',
        type: 'nonprofit',
        totalInvoices: 9,
        totalValue: 59000.00,
        status: 'active'
    }
];

// Sales People
export const salesPeople = [
    { id: 1, name: 'منة', totalSales: 450000, invoiceCount: 25 },
    { id: 2, name: 'هبة', totalSales: 680000, invoiceCount: 32 },
    { id: 3, name: 'دعاء', totalSales: 520000, invoiceCount: 28 }
];

// Products Inventory
export const products = [
    { id: 'P-001', name: 'Kingston Flash Memory 64GB', category: 'Storage', stock: 150, price: 255, minStock: 50 },
    { id: 'P-002', name: 'WD Purple HDD 8TB', category: 'Storage', stock: 25, price: 8200, minStock: 10 },
    { id: 'P-003', name: 'HP Toner Cartridge', category: 'Consumables', stock: 80, price: 850, minStock: 30 },
    { id: 'P-004', name: 'Hikvision IP Camera', category: 'Security', stock: 45, price: 2500, minStock: 20 },
    { id: 'P-005', name: 'UNV Indoor Camera', category: 'Security', stock: 30, price: 1080, minStock: 15 },
    { id: 'P-006', name: 'Dell Monitor 22"', category: 'Displays', stock: 20, price: 4150, minStock: 10 },
    { id: 'P-007', name: 'Lenovo ThinkPad Laptop', category: 'Computers', stock: 12, price: 36000, minStock: 5 },
    { id: 'P-008', name: 'D-Link Switch 24P', category: 'Networking', stock: 15, price: 3500, minStock: 8 },
    { id: 'P-009', name: 'HP Printer LaserJet', category: 'Printers', stock: 18, price: 9500, minStock: 10 },
    { id: 'P-010', name: 'Logitech Keyboard+Mouse', category: 'Accessories', stock: 100, price: 450, minStock: 40 }
];

// Calculate Business Statistics
export const stats = {
    totalSales: invoices.reduce((sum, inv) => sum + inv.finalValue, 0),
    totalCollected: invoices.reduce((sum, inv) => sum + inv.collected, 0),
    pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.balance, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
    totalCustomers: customers.length,
    totalPurchases: purchaseOrders.reduce((sum, po) => sum + po.finalValue, 0),
    totalPurchasesPaid: purchaseOrders.reduce((sum, po) => sum + po.paid, 0),
    totalSuppliers: suppliers.length,
    profitMargin: 0 // Will be calculated below
};

// Calculate profit margin
stats.profitMargin = ((stats.totalSales - stats.totalPurchases) / stats.totalSales * 100).toFixed(2);

// Employees & Payroll Data
export const employees = [
    {
        id: 'EMP-001',
        name: 'منة',
        position: 'مندوب مبيعات',
        baseSalary: 5500,
        status: 'active',
        joinDate: '2024-01-01'
    },
    {
        id: 'EMP-002',
        name: 'هبة',
        position: 'مندوب مبيعات',
        baseSalary: 3400,
        status: 'active',
        joinDate: '2024-01-01'
    },
    {
        id: 'EMP-003',
        name: 'حسام',
        position: 'موظف',
        baseSalary: 3300,
        status: 'active',
        joinDate: '2024-01-01'
    },
    {
        id: 'EMP-004',
        name: 'دعاء',
        position: 'مندوب مبيعات',
        baseSalary: 3000,
        status: 'active',
        joinDate: '2025-01-01'
    }
];

// Payroll Records (Monthly salaries for 2025)
export const payrollRecords = [
    // منة
    { employeeId: 'EMP-001', employeeName: 'منة', month: 'يناير', year: 2025, baseSalary: 5500, additions: 1500, deductions: 0, totalSalary: 7000, advance: 0, netSalary: 7000, paid: true, signature: 'منة' },
    { employeeId: 'EMP-001', employeeName: 'منة', month: 'فبراير', year: 2025, baseSalary: 5500, additions: 1500, deductions: 0, totalSalary: 7000, advance: 0, netSalary: 7000, paid: true, signature: 'منة' },
    { employeeId: 'EMP-001', employeeName: 'منة', month: 'مارس', year: 2025, baseSalary: 5500, additions: 1500, deductions: 180, totalSalary: 6820, advance: 0, netSalary: 6820, paid: true, signature: 'منة' },
    { employeeId: 'EMP-001', employeeName: 'منة', month: 'أبريل', year: 2025, baseSalary: 5500, additions: 1500, deductions: 0, totalSalary: 7000, advance: 0, netSalary: 7000, paid: true, signature: 'منة' },
    { employeeId: 'EMP-001', employeeName: 'منة', month: 'أغسطس', year: 2025, baseSalary: 5500, additions: 1500, deductions: 0, totalSalary: 7000, advance: 0, netSalary: 7000, paid: true, signature: 'منه' },

    // هبة
    { employeeId: 'EMP-002', employeeName: 'هبة', month: 'يناير', year: 2025, baseSalary: 3400, additions: 0, deductions: 0, totalSalary: 3400, advance: 0, netSalary: 3400, paid: true, signature: 'هبة' },
    { employeeId: 'EMP-002', employeeName: 'هبة', month: 'فبراير', year: 2025, baseSalary: 3400, additions: 0, deductions: 0, totalSalary: 3400, advance: 0, netSalary: 3400, paid: true, signature: 'هبة' },
    { employeeId: 'EMP-002', employeeName: 'هبة', month: 'مارس', year: 2025, baseSalary: 3400, additions: 0, deductions: 225, totalSalary: 3175, advance: 0, netSalary: 3175, paid: true, signature: 'هبة' },
    { employeeId: 'EMP-002', employeeName: 'هبة', month: 'أبريل', year: 2025, baseSalary: 3400, additions: 0, deductions: 0, totalSalary: 3400, advance: 0, netSalary: 3400, paid: true, signature: 'هبة' },

    // حسام
    { employeeId: 'EMP-003', employeeName: 'حسام', month: 'يناير', year: 2025, baseSalary: 3300, additions: 250, deductions: 0, totalSalary: 3550, advance: 0, netSalary: 3550, paid: true, signature: 'حسام' },
    { employeeId: 'EMP-003', employeeName: 'حسام', month: 'فبراير', year: 2025, baseSalary: 3300, additions: 465, deductions: 0, totalSalary: 3765, advance: 0, netSalary: 3765, paid: true, signature: 'حسام' },
    { employeeId: 'EMP-003', employeeName: 'حسام', month: 'مارس', year: 2025, baseSalary: 3300, additions: 400, deductions: 165, totalSalary: 3535, advance: 0, netSalary: 3535, paid: true, signature: 'حسام' },
    { employeeId: 'EMP-003', employeeName: 'حسام', month: 'أبريل', year: 2025, baseSalary: 3300, additions: 170, deductions: 110, totalSalary: 3360, advance: 0, netSalary: 3360, paid: true, signature: 'حسام' },

    // دعاء (and others)
    { employeeId: 'EMP-004', employeeName: 'دعاء', month: 'يناير', year: 2025, baseSalary: 3000, additions: 0, deductions: 1400, totalSalary: 1600, advance: 0, netSalary: 1600, paid: true, signature: 'منار' },
    { employeeId: 'EMP-004', employeeName: 'دعاء', month: 'فبراير', year: 2025, baseSalary: 2000, additions: 0, deductions: 460, totalSalary: 1540, advance: 0, netSalary: 1540, paid: true, signature: 'احمد جمال' },
    { employeeId: 'EMP-004', employeeName: 'دعاء', month: 'مارس', year: 2025, baseSalary: 2000, additions: 0, deductions: 55, totalSalary: 1945, advance: 0, netSalary: 1945, paid: true, signature: 'احمد جمال' },
    { employeeId: 'EMP-004', employeeName: 'دعاء', month: 'أبريل', year: 2025, baseSalary: 2000, additions: 0, deductions: 0, totalSalary: 2000, advance: 0, netSalary: 2000, paid: true, signature: 'دعاء' },
    { employeeId: 'EMP-004', employeeName: 'دعاء', month: 'أغسطس', year: 2025, baseSalary: 3000, additions: 1000, deductions: 100, totalSalary: 3900, advance: 0, netSalary: 3900, paid: true, signature: 'دعاء' }
];

// Calculate payroll statistics
const totalPayrollPaid = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
const averageMonthlySalary = totalPayrollPaid / payrollRecords.length;

// Add payroll stats to main stats
stats.totalPayroll = totalPayrollPaid;
stats.averageSalary = averageMonthlySalary.toFixed(2);
stats.totalEmployees = employees.length;

// Expense Categories & Petty Cash Tracking (January 2025)
export const expenseCategories = [
    'انتقالات', 'سجل تجاري', 'أجور ومرتبات', 'شحن', 'ايجار', 'مياه', 'كهرباء',
    'نظافة', 'بوفيه وضيافة', 'صدقة', 'مصاريف أخرى', 'أدوات مكتبية', 'سلف/غرامات',
    'انترنت', 'كراسة شروط', 'محمول', 'كوميشيين', 'صيانه ونظافة العمارة',
    'مكتب المحاسبة', 'تامين مناقصات', 'تليفون ارضى', 'فوائد', 'غاز',
    'اكراميات', 'فروق سداد', 'ضرائب', 'ارباح للممولين', 'سفر'
];

export const expenses = [
    // January 2025
    { date: '2025-01-02', description: 'مواصلات حسام العامرية', amount: 42, category: 'انتقالات' },
    { date: '2025-02-02', description: 'شراء حبر للشركة', amount: 2600, category: 'أدوات مكتبية' },
    { date: '2025-02-02', description: 'مواصلات حسام', amount: 39, category: 'انتقالات' },
    { date: '2025-02-03', description: 'مواصلات حسام', amount: 30, category: 'انتقالات' },
    { date: '2025-02-03', description: 'مواصلات هبة اسبوع', amount: 53, category: 'انتقالات' },
    { date: '2025-02-04', description: 'مواصلات سفر حسام', amount: 437, category: 'سفر' },
    { date: '2025-02-04', description: 'عربية العامرية', amount: 500, category: 'انتقالات' },
    { date: '2025-02-04', description: 'شركة شحن اوردر صقر dlink', amount: 85, category: 'سجل تجاري' },
    { date: '2025-02-05', description: 'مواصلات حسام', amount: 59, category: 'انتقالات' },
    { date: '2025-02-06', description: 'مواصلات حسام', amount: 6, category: 'انتقالات' },
    { date: '2025-02-09', description: 'مصاريف سفر منة و حسام و هبة', amount: 2000, category: 'سفر' },
    { date: '2025-02-09', description: 'شحن شاشة', amount: 90, category: 'شحن' },
    { date: '2025-02-10', description: 'مواصلات حسام البرج + لفة', amount: 172, category: 'انتقالات' },
    { date: '2025-02-11', description: 'طباعة ورق', amount: 7, category: 'أدوات مكتبية' },
    { date: '2025-02-11', description: 'شحن اوردر اسبك', amount: 200, category: 'شحن' },
    { date: '2025-02-11', description: 'مواصلات حسام العامرية', amount: 71, category: 'انتقالات' },
    { date: '2025-02-11', description: 'مواصلات منة', amount: 22, category: 'انتقالات' },
    { date: '2025-02-12', description: 'مواصلات حسام', amount: 53, category: 'انتقالات' },
    { date: '2025-02-12', description: 'مواصلات هبة', amount: 23, category: 'انتقالات' },
    { date: '2025-02-13', description: 'تنضيف الشقة', amount: 260, category: 'نظافة' },
    { date: '2025-02-13', description: 'ادوات مكتبية', amount: 60, category: 'أدوات مكتبية' },
    { date: '2025-02-13', description: 'دفع عداد المياه', amount: 155, category: 'مياه' },
    { date: '2025-02-13', description: 'شراء من دريم 2000 كابل برنتر للشركة', amount: 110, category: 'أدوات مكتبية' },
    { date: '2025-02-13', description: 'مواصلات حسام', amount: 58, category: 'انتقالات' },
    { date: '2025-02-13', description: 'شحن كرنتوتين', amount: 170, category: 'شحن' },
    { date: '2025-02-16', description: 'مواصلات حسام البرج نيو مارينا + مدار', amount: 106, category: 'انتقالات' },
    { date: '2025-02-16', description: 'مواصلات هبة', amount: 16, category: 'انتقالات' },
    { date: '2025-02-17', description: 'مواصلات حسام العامرية', amount: 43, category: 'انتقالات' },
    { date: '2025-02-18', description: 'مواصلات حسام', amount: 46, category: 'انتقالات' },
    { date: '2025-02-18', description: 'مواصلات هبة', amount: 10, category: 'انتقالات' },
    { date: '2025-02-19', description: 'مواصلات حسام البرج', amount: 113, category: 'انتقالات' },
    { date: '2025-02-19', description: 'مواصلات منة و هبة', amount: 110, category: 'انتقالات' },
    { date: '2025-02-20', description: 'مواصلات حسام وادي القمر', amount: 23, category: 'انتقالات' },
    { date: '2025-02-22', description: 'السنترال', amount: 725, category: 'انترنت' },
    { date: '2025-02-22', description: 'Requiter لتعين موظف', amount: 1500, category: 'مصاريف أخرى' },
    { date: '2025-02-23', description: 'مصاريف سفر حسام القاهرة', amount: 432, category: 'سفر' },
    { date: '2025-02-23', description: 'مصاريف سفر احمد القاهرة', amount: 311, category: 'سفر' },
    { date: '2025-02-23', description: 'شحن جهاز صقر', amount: 515, category: 'شحن' },
    { date: '2025-02-24', description: 'مواصلات حسام', amount: 18, category: 'انتقالات' },
    { date: '2025-02-24', description: 'شراء كراسة شروط كهربا مناقصة', amount: 342, category: 'تامين مناقصات' },
    { date: '2025-02-25', description: 'مواصلات حسام', amount: 40, category: 'انتقالات' },
    { date: '2025-02-26', description: 'مواصلات حسام السعودي الالماني + لفة', amount: 50, category: 'انتقالات' },
    { date: '2025-02-26', description: 'دفع غاز', amount: 35, category: 'غاز' },
    { date: '2025-02-27', description: 'مواصلات حسام', amount: 10, category: 'انتقالات' },
    { date: '2025-02-27', description: 'مرتب حسام', amount: 3300, category: 'أجور ومرتبات' },
    { date: '2025-02-27', description: 'بونص سفريات', amount: 465, category: 'أجور ومرتبات' },
    { date: '2025-02-27', description: 'مرتب هبة', amount: 3400, category: 'أجور ومرتبات' },
    { date: '2025-02-27', description: 'مرتب منة', amount: 5500, category: 'أجور ومرتبات' },
    { date: '2025-02-27', description: 'بونص حسابات', amount: 1500, category: 'أجور ومرتبات' },
    { date: '2025-02-27', description: 'مرتب احمد جمال', amount: 1540, category: 'أجور ومرتبات' },
    { date: '2025-02-27', description: 'مواصلات احمد البرج + لفة', amount: 140, category: 'انتقالات' },
    { date: '2025-02-28', description: 'مواصلات احمد اسبوع', amount: 100, category: 'انتقالات' },
    { date: '2025-02-28', description: 'صدقة شهرين', amount: 500, category: 'صدقة' },
    { date: '2025-02-28', description: 'شحن عداد كهربا', amount: 205, category: 'كهرباء' },
    { date: '2025-02-28', description: 'مواصلات هبة', amount: 30, category: 'انتقالات' },
    { date: '2025-02-28', description: 'ايجار', amount: 7000, category: 'ايجار' },

    // March 2025
    { date: '2025-03-02', description: 'عامل نظافة', amount: 50, category: 'نظافة' },
    { date: '2025-03-02', description: 'ايصال مياه', amount: 234, category: 'مياه' },
    { date: '2025-03-03', description: 'مواصلات هبة', amount: 104, category: 'انتقالات' },
    { date: '2025-03-03', description: 'مواصلات حسام', amount: 55, category: 'انتقالات' },
    { date: '2025-03-04', description: 'رسوم شحن الفلاشات', amount: 89, category: 'شحن' },
    { date: '2025-03-04', description: 'مواصلات حسام العامرية', amount: 59, category: 'انتقالات' },
    { date: '2025-03-04', description: 'مواصلات هبة', amount: 104, category: 'انتقالات' },
    { date: '2025-03-05', description: 'مواصلات حسام وادي القمر + لفة', amount: 74, category: 'انتقالات' },
    { date: '2025-03-06', description: 'مواصلات حسام', amount: 18, category: 'انتقالات' },
    { date: '2025-03-06', description: 'شحن اوردر كهربا', amount: 150, category: 'شحن' },
    { date: '2025-03-09', description: 'مواصلات حسام', amount: 24, category: 'انتقالات' },
    { date: '2025-03-09', description: 'شحنة كهربا', amount: 150, category: 'شحن' },
    { date: '2025-03-09', description: 'مواصلات احمد', amount: 25, category: 'انتقالات' },
    { date: '2025-03-10', description: 'مواصلات حسام العامرية', amount: 49, category: 'انتقالات' },
    { date: '2025-03-11', description: 'تصوير و طباعة', amount: 12, category: 'أدوات مكتبية' },
    { date: '2025-03-11', description: 'مواصلات حسام', amount: 63, category: 'انتقالات' },
    { date: '2025-03-11', description: 'مواصلات هبة', amount: 15, category: 'انتقالات' },
    { date: '2025-03-12', description: 'مواصلات حسام', amount: 23, category: 'انتقالات' },
    { date: '2025-03-16', description: 'مواصلات حسام', amount: 54, category: 'انتقالات' },
    { date: '2025-03-17', description: 'مواصلات حسام', amount: 12, category: 'انتقالات' },
    { date: '2025-03-18', description: 'مواصلات حسام', amount: 16, category: 'انتقالات' },
    { date: '2025-03-18', description: 'ملو حبارات', amount: 500, category: 'أدوات مكتبية' },
    { date: '2025-03-18', description: 'شراء كراسة شروط شركة الكهربا', amount: 342, category: 'كراسة شروط' },
    { date: '2025-03-19', description: 'مواصلات حسام للبرج', amount: 99, category: 'انتقالات' },
    { date: '2025-03-19', description: 'مواصلات احمد', amount: 60, category: 'انتقالات' },
    { date: '2025-03-19', description: 'مواصلات هبة', amount: 35, category: 'انتقالات' },
    { date: '2025-03-20', description: 'مواصلات حسام رشيد + لفة', amount: 91, category: 'انتقالات' },
    { date: '2025-03-23', description: 'شحن اوردر ايلاب + مجمع الخلط + سموحة', amount: 170, category: 'شحن' },
    { date: '2025-03-23', description: 'مواصلات حسام', amount: 96, category: 'انتقالات' },
    { date: '2025-03-24', description: 'مواصلات حسام العامرية', amount: 96, category: 'انتقالات' },
    { date: '2025-03-25', description: 'مواصلات حسام', amount: 20, category: 'انتقالات' },
    { date: '2025-03-26', description: 'مواصلات حسام العامرية', amount: 49, category: 'انتقالات' },
    { date: '2025-03-27', description: 'مواصلات حسام العامرية + لفة', amount: 71, category: 'انتقالات' },
    { date: '2025-03-31', description: 'تحويل مرتب احمد مع خصم يوم', amount: 1945, category: 'أجور ومرتبات' },
    { date: '2025-03-31', description: 'مرتب حسام مع خصم يوم ونص', amount: 3135, category: 'أجور ومرتبات' },
    { date: '2025-03-31', description: 'بونص لحسام+بونص سفريات', amount: 400, category: 'أجور ومرتبات' },
    { date: '2025-03-31', description: 'مرتب هبة مع خصم يومين', amount: 3175, category: 'أجور ومرتبات' },
    { date: '2025-03-31', description: 'مرتب منة مع خصم', amount: 5320, category: 'أجور ومرتبات' },
    { date: '2025-03-31', description: 'بونص حسابات', amount: 1500, category: 'أجور ومرتبات' },
    { date: '2025-03-31', description: 'جزء من كوميشن هبة', amount: 4339, category: 'كوميشيين' },
    { date: '2025-03-31', description: 'جزء من كوميشن منة', amount: 5000, category: 'كوميشيين' },
    { date: '2025-03-31', description: 'ايجار', amount: 7000, category: 'ايجار' }
];

// Petty Cash Summary
export const pettyCash = {
    openingBalance: 5780,
    totalDeposits: 143600,
    totalExpenses: 33278,
    closingBalance: 116103
};

// Calculate expense statistics by category
export const expenseStats = expenseCategories.reduce((acc, category) => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    if (total > 0) {
        acc[category] = total;
    }
    return acc;
}, {});

// Add expense stats to main stats
stats.totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
stats.pettyCashBalance = pettyCash.closingBalance;

// Monthly Expense Summary for 2025 (Complete Year)
export const monthlyExpenses = [
    { month: 'يناير', total: 33278, transportation: 1818, commercialRegistry: 0, salaries: 15715, shipping: 310, rent: 7000, water: 302, electricity: 0, cleaning: 50, hospitality: 682, charity: 0, other: 0, stationery: 2330, advances: 0, internet: 0, tenderDocs: 346, mobile: 2070, commission: 0, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 324, profits: 0, travel: 2331 },
    { month: 'فبراير', total: 36110, transportation: 1938, commercialRegistry: 85, salaries: 15705, shipping: 975, rent: 7000, water: 155, electricity: 205, cleaning: 310, hospitality: 0, charity: 500, other: 1500, stationery: 3455, advances: 0, internet: 725, tenderDocs: 0, mobile: 0, commission: 0, buildingMaintenance: 0, accounting: 0, tenderInsurance: 342, landline: 0, interest: 0, gas: 35, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 3180 },
    { month: 'مارس', total: 34820, transportation: 1309, commercialRegistry: 0, salaries: 15475, shipping: 559, rent: 7000, water: 234, electricity: 0, cleaning: 50, hospitality: 0, charity: 0, other: 0, stationery: 512, advances: 0, internet: 0, tenderDocs: 342, mobile: 0, commission: 9339, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 0 },
    { month: 'إبريل', total: 115510, transportation: 1222, commercialRegistry: 0, salaries: 15760, shipping: 190, rent: 7000, water: 0, electricity: 200, cleaning: 50, hospitality: 818, charity: 0, other: 54, stationery: 515, advances: 0, internet: 200, tenderDocs: 0, mobile: 2200, commission: 54477, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 28000, taxes: 3934, profits: 0, travel: 891 },
    { month: 'مايو', total: 7981, transportation: 224, commercialRegistry: 0, salaries: 0, shipping: 0, rent: 7000, water: 0, electricity: 0, cleaning: 0, hospitality: 480, charity: 0, other: 90, stationery: 137, advances: 0, internet: 0, tenderDocs: 0, mobile: 0, commission: 0, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 50, paymentDiff: 0, taxes: 0, profits: 0, travel: 0 },
    { month: 'يونيو', total: 10165, transportation: 0, commercialRegistry: 501, salaries: 0, shipping: 295, rent: 7000, water: 0, electricity: 0, cleaning: 0, hospitality: 0, charity: 0, other: 0, stationery: 0, advances: 0, internet: 0, tenderDocs: 0, mobile: 2369, commission: 0, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 0 },
    { month: 'يوليو', total: 7880, transportation: 0, commercialRegistry: 0, salaries: 0, shipping: 180, rent: 7700, water: 0, electricity: 0, cleaning: 0, hospitality: 0, charity: 0, other: 0, stationery: 0, advances: 0, internet: 0, tenderDocs: 0, mobile: 0, commission: 0, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 0 },
    { month: 'أغسطس', total: 11462, transportation: 250, commercialRegistry: 0, salaries: 0, shipping: 300, rent: 7700, water: 0, electricity: 0, cleaning: 0, hospitality: 0, charity: 0, other: 12, stationery: 0, advances: 0, internet: 0, tenderDocs: 0, mobile: 3050, commission: 0, buildingMaintenance: 150, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 0 },
    { month: 'سبتمبر', total: 41215, transportation: 1563, commercialRegistry: 0, salaries: 13140, shipping: 0, rent: 7700, water: 0, electricity: 0, cleaning: 260, hospitality: 262, charity: 0, other: 470, stationery: 460, advances: 1000, internet: 0, tenderDocs: 1102, mobile: 1988, commission: 2400, buildingMaintenance: 200, accounting: 0, tenderInsurance: 9000, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 1670 },
    { month: 'أكتوبر', total: 24065, transportation: 1814, commercialRegistry: 111, salaries: 0, shipping: 670, rent: 15400, water: 173, electricity: 0, cleaning: 20, hospitality: 240, charity: 0, other: 130, stationery: 0, advances: 0, internet: 0, tenderDocs: 341, mobile: 2537, commission: 0, buildingMaintenance: 0, accounting: 0, tenderInsurance: 1017, landline: 0, interest: 317, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 1295 },
    { month: 'نوفمبر', total: 18562, transportation: 728, commercialRegistry: 0, salaries: 9500, shipping: 220, rent: 0, water: 190, electricity: 300, cleaning: 50, hospitality: 540, charity: 0, other: 50, stationery: 0, advances: 0, internet: 0, tenderDocs: 1704, mobile: 0, commission: 1000, buildingMaintenance: 0, accounting: 0, tenderInsurance: 4000, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 280 }
];

// Quarterly Summaries
export const quarterlyExpenses = [
    { quarter: 'Q1', total: 104208, transportation: 5065, commercialRegistry: 85, salaries: 46895, shipping: 1844, rent: 21000, water: 691, electricity: 205, cleaning: 410, hospitality: 682, charity: 500, other: 1500, stationery: 6297, advances: 0, internet: 725, tenderDocs: 688, mobile: 2070, commission: 9339, buildingMaintenance: 0, accounting: 0, tenderInsurance: 342, landline: 0, interest: 0, gas: 35, tips: 0, paymentDiff: 0, taxes: 324, profits: 0, travel: 5511 },
    { quarter: 'Q2', total: 133656, transportation: 1445, commercialRegistry: 501, salaries: 15760, shipping: 485, rent: 21000, water: 0, electricity: 200, cleaning: 50, hospitality: 1298, charity: 0, other: 144, stationery: 652, advances: 0, internet: 200, tenderDocs: 0, mobile: 4569, commission: 54477, buildingMaintenance: 0, accounting: 0, tenderInsurance: 0, landline: 0, interest: 0, gas: 0, tips: 50, paymentDiff: 28000, taxes: 3934, profits: 0, travel: 891 },
    { quarter: 'Q3', total: 60557, transportation: 1813, commercialRegistry: 0, salaries: 13140, shipping: 480, rent: 23100, water: 0, electricity: 0, cleaning: 260, hospitality: 262, charity: 0, other: 482, stationery: 460, advances: 1000, internet: 0, tenderDocs: 1102, mobile: 5038, commission: 2400, buildingMaintenance: 350, accounting: 0, tenderInsurance: 9000, landline: 0, interest: 0, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 1670 },
    { quarter: 'Q4', total: 42627, transportation: 2542, commercialRegistry: 111, salaries: 9500, shipping: 890, rent: 15400, water: 363, electricity: 300, cleaning: 70, hospitality: 780, charity: 0, other: 180, stationery: 0, advances: 0, internet: 0, tenderDocs: 2045, mobile: 2537, commission: 1000, buildingMaintenance: 0, accounting: 0, tenderInsurance: 5017, landline: 0, interest: 317, gas: 0, tips: 0, paymentDiff: 0, taxes: 0, profits: 0, travel: 1575 }
];

// Yearly Total
export const yearlyExpenseSummary = {
    total: 341046,
    transportation: 10865,
    commercialRegistry: 697,
    salaries: 85295,
    shipping: 3699,
    rent: 80500,
    water: 1054,
    electricity: 705,
    cleaning: 790,
    hospitality: 3022,
    charity: 500,
    other: 2305,
    stationery: 7409,
    advances: 1000,
    internet: 925,
    tenderDocs: 3835,
    mobile: 14214,
    commission: 67216,
    buildingMaintenance: 350,
    accounting: 0,
    tenderInsurance: 14359,
    landline: 0,
    interest: 317,
    gas: 35,
    tips: 50,
    paymentDiff: 28000,
    taxes: 4258,
    profits: 0,
    travel: 9647
};

// Update main stats with yearly expense data
stats.totalYearlyExpenses = yearlyExpenseSummary.total;
stats.avgMonthlyExpenses = (yearlyExpenseSummary.total / 11).toFixed(2); // 11 months of data

// Bank Guarantees and Frozen Balances
export const bankGuarantees = [
    { type: 'تأمين ابتدائي', beneficiary: 'شركة الكهرباء', issueDate: '2023-02-25', expiryDate: '2025-05-20', status: 'returned', amount: 6860 },
    { type: 'تأمين ابتدائي', beneficiary: 'شركة الكهرباء', issueDate: '2023-03-11', expiryDate: '2025-05-20', status: 'returned', amount: 10291 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة اموك', issueDate: '2024-05-26', expiryDate: '2025-05-26', status: 'returned', amount: 4395 },
    { type: 'وديعة', beneficiary: 'تامين مقر الشركة', issueDate: '2024-07-14', expiryDate: '2026-07-14', status: 'active', amount: 7000 },
    { type: 'تأمين ابتدائي', beneficiary: 'شركة الجمهورية للأدوية', issueDate: '2025-01-13', expiryDate: '2025-04-27', status: 'returned', amount: 11250 },
    { type: 'تأمين ابتدائي', beneficiary: 'نادي سموحة', issueDate: '2025-01-28', expiryDate: '2025-02-27', status: 'returned', amount: 30000 },
    { type: 'حجز ضرائب', beneficiary: 'شركة مياه الشرب الإسكندرية', issueDate: '2023-08-09', expiryDate: null, status: 'active', amount: 4683 },
    { type: 'تأمين ابتدائي', beneficiary: 'ابوقير للبترول', issueDate: '2025-03-04', expiryDate: '2025-06-02', status: 'returned', amount: 30000 },
    { type: 'تأمين ابتدائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-03-03', expiryDate: '2025-05-04', status: 'returned', amount: 8000 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-02-27', expiryDate: null, status: 'active', amount: 1332.00 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة النقل البري و البحري', issueDate: '2025-03-27', expiryDate: '2025-05-29', status: 'returned', amount: 500 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-03-06', expiryDate: null, status: 'active', amount: 3003.51 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-03-19', expiryDate: null, status: 'active', amount: 3062.50 },
    { type: 'حجز ضرائب', beneficiary: 'PMS', issueDate: '2024-12-30', expiryDate: null, status: 'active', amount: 8550 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-05-04', expiryDate: null, status: 'active', amount: 4000 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-06-03', expiryDate: null, status: 'active', amount: 473 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-06-22', expiryDate: null, status: 'active', amount: 1230 },
    { type: 'خطاب ضمان ابتدائي', beneficiary: 'مستشفي البترول', issueDate: null, expiryDate: null, status: 'returned', amount: 5000 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-06-02', expiryDate: null, status: 'active', amount: 1245 },
    { type: 'خطاب ضمان ابتدائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-08-17', expiryDate: null, status: 'active', amount: 7200 },
    { type: 'خطاب ضمان ابتدائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-09-15', expiryDate: null, status: 'returned', amount: 6000 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-10-01', expiryDate: null, status: 'active', amount: 6513 },
    { type: 'خطاب ضمان نهائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-10-21', expiryDate: null, status: 'active', amount: 1017 },
    { type: 'خطاب ضمان ابتدائي', beneficiary: 'شركة الكهرباء', issueDate: '2025-09-21', expiryDate: null, status: 'active', amount: 3000 }
];

// Bank Guarantees Summary
export const guaranteesSummary = {
    totalValue: 164605,
    returnedValue: 112296,
    activeValue: 52309,
    totalCount: bankGuarantees.length,
    activeCount: bankGuarantees.filter(g => g.status === 'active').length,
    returnedCount: bankGuarantees.filter(g => g.status === 'returned').length
};

// Add guarantees to main stats
stats.totalGuarantees = guaranteesSummary.totalValue;
stats.activeGuarantees = guaranteesSummary.activeValue;
stats.frozenBalance = guaranteesSummary.activeValue;

