import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class ReportService {
    /**
     * Generate sales report
     */
    static async generateSalesReport(tenantId, startDate, endDate, filters = {}) {
        const prisma = getTenantPrisma(tenantId);

        const where = {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        };

        if (filters.customerId) where.customerId = filters.customerId;
        if (filters.status) where.status = filters.status;

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                customer: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const summary = {
            totalInvoices: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
            totalPaid: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
            totalPending: invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0),
            byStatus: {},
            byCustomer: {},
            dailySales: {},
        };

        // Group by status
        invoices.forEach((inv) => {
            summary.byStatus[inv.status] = (summary.byStatus[inv.status] || 0) + 1;
        });

        // Group by customer
        invoices.forEach((inv) => {
            const customerName = inv.customer?.name || 'Unknown';
            if (!summary.byCustomer[customerName]) {
                summary.byCustomer[customerName] = {
                    count: 0,
                    total: 0,
                };
            }
            summary.byCustomer[customerName].count += 1;
            summary.byCustomer[customerName].total += inv.total;
        });

        // Daily sales
        invoices.forEach((inv) => {
            const date = inv.createdAt.toISOString().split('T')[0];
            summary.dailySales[date] = (summary.dailySales[date] || 0) + inv.total;
        });

        return {
            summary,
            invoices,
            period: { startDate, endDate },
        };
    }

    /**
     * Generate inventory report
     */
    static async generateInventoryReport(tenantId, filters = {}) {
        const prisma = getTenantPrisma(tenantId);

        const where = {};
        if (filters.category) where.category = filters.category;
        if (filters.lowStock) {
            where.quantity = { lte: prisma.product.fields.reorderPoint };
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        const summary = {
            totalProducts: products.length,
            totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
            lowStockItems: products.filter((p) => p.quantity <= (p.reorderPoint || 10)).length,
            outOfStock: products.filter((p) => p.quantity === 0).length,
            byCategory: {},
        };

        // Group by category
        products.forEach((p) => {
            const category = p.category || 'Uncategorized';
            if (!summary.byCategory[category]) {
                summary.byCategory[category] = {
                    count: 0,
                    totalValue: 0,
                    totalQuantity: 0,
                };
            }
            summary.byCategory[category].count += 1;
            summary.byCategory[category].totalValue += p.quantity * p.price;
            summary.byCategory[category].totalQuantity += p.quantity;
        });

        return {
            summary,
            products,
        };
    }

    /**
     * Generate customer report
     */
    static async generateCustomerReport(tenantId, startDate, endDate) {
        const prisma = getTenantPrisma(tenantId);

        const customers = await prisma.customer.findMany({
            include: {
                invoices: {
                    where: {
                        createdAt: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        const customersWithStats = customers.map((customer) => {
            const totalInvoices = customer.invoices.length;
            const totalAmount = customer.invoices.reduce((sum, inv) => sum + inv.total, 0);
            const totalPaid = customer.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
            const totalPending = totalAmount - totalPaid;

            return {
                ...customer,
                stats: {
                    totalInvoices,
                    totalAmount,
                    totalPaid,
                    totalPending,
                    averageInvoice: totalInvoices > 0 ? totalAmount / totalInvoices : 0,
                },
            };
        });

        const summary = {
            totalCustomers: customers.length,
            activeCustomers: customersWithStats.filter((c) => c.stats.totalInvoices > 0).length,
            totalRevenue: customersWithStats.reduce((sum, c) => sum + c.stats.totalAmount, 0),
            topCustomers: customersWithStats
                .sort((a, b) => b.stats.totalAmount - a.stats.totalAmount)
                .slice(0, 10),
        };

        return {
            summary,
            customers: customersWithStats,
            period: { startDate, endDate },
        };
    }

    /**
     * Generate financial report
     */
    static async generateFinancialReport(tenantId, startDate, endDate) {
        const prisma = getTenantPrisma(tenantId);

        const [invoices, expenses, payroll] = await Promise.all([
            prisma.invoice.findMany({
                where: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            }),
            prisma.journalEntry.findMany({
                where: {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                    type: 'expense',
                },
            }),
            prisma.payroll.findMany({
                where: {
                    payPeriodStart: {
                        gte: new Date(startDate),
                    },
                    payPeriodEnd: {
                        lte: new Date(endDate),
                    },
                },
            }),
        ]);

        const revenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const expenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const payrollAmount = payroll.reduce((sum, p) => sum + p.netPay, 0);
        const totalExpenses = expenseAmount + payrollAmount;
        const netProfit = revenue - totalExpenses;

        return {
            summary: {
                revenue,
                expenses: totalExpenses,
                expenseBreakdown: {
                    operational: expenseAmount,
                    payroll: payrollAmount,
                },
                netProfit,
                profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
            },
            details: {
                invoices,
                expenses,
                payroll,
            },
            period: { startDate, endDate },
        };
    }

    /**
     * Generate employee performance report
     */
    static async generateEmployeeReport(tenantId) {
        const prisma = getTenantPrisma(tenantId);

        const employees = await prisma.employee.findMany({
            include: {
                payroll: {
                    orderBy: { payPeriodEnd: 'desc' },
                    take: 3,
                },
            },
            orderBy: { name: 'asc' },
        });

        const summary = {
            totalEmployees: employees.length,
            activeEmployees: employees.filter((e) => e.status === 'active').length,
            byDepartment: {},
            byPosition: {},
            totalMonthlySalary: employees
                .filter((e) => e.status === 'active')
                .reduce((sum, e) => sum + e.salary, 0),
        };

        // Group by department
        employees.forEach((e) => {
            const dept = e.department || 'Unassigned';
            summary.byDepartment[dept] = (summary.byDepartment[dept] || 0) + 1;
        });

        // Group by position
        employees.forEach((e) => {
            const pos = e.position || 'Unassigned';
            summary.byPosition[pos] = (summary.byPosition[pos] || 0) + 1;
        });

        return {
            summary,
            employees,
        };
    }

    /**
     * Generate purchase order report
     */
    static async generatePurchaseReport(tenantId, startDate, endDate) {
        const prisma = getTenantPrisma(tenantId);

        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where: {
                orderDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                supplier: true,
                items: true,
            },
            orderBy: { orderDate: 'desc' },
        });

        const summary = {
            totalOrders: purchaseOrders.length,
            totalAmount: purchaseOrders.reduce((sum, po) => sum + po.total, 0),
            byStatus: {},
            bySupplier: {},
            averageOrderValue: 0,
        };

        // Group by status
        purchaseOrders.forEach((po) => {
            summary.byStatus[po.status] = (summary.byStatus[po.status] || 0) + 1;
        });

        // Group by supplier
        purchaseOrders.forEach((po) => {
            const supplierName = po.supplier?.name || 'Unknown';
            if (!summary.bySupplier[supplierName]) {
                summary.bySupplier[supplierName] = {
                    count: 0,
                    total: 0,
                };
            }
            summary.bySupplier[supplierName].count += 1;
            summary.bySupplier[supplierName].total += po.total;
        });

        summary.averageOrderValue = summary.totalOrders > 0
            ? summary.totalAmount / summary.totalOrders
            : 0;

        return {
            summary,
            purchaseOrders,
            period: { startDate, endDate },
        };
    }
}
