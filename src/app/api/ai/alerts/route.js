import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [invoices, expenses, products, customers] = await Promise.all([
            prisma.invoice.findMany(),
            prisma.expense.findMany(),
            prisma.product.findMany(),
            prisma.customer.findMany({ include: { invoices: true } })
        ]);

        const alerts = [];
        const now = new Date();

        // 1. Payment Due Alerts
        const upcomingDue = invoices.filter(inv => {
            if (inv.status !== 'pending') return false;
            const dueDate = new Date(inv.date);
            dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term
            const daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilDue >= 0 && daysUntilDue <= 7;
        });

        if (upcomingDue.length > 0) {
            alerts.push({
                type: 'payment_due',
                severity: 'warning',
                title: 'فواتير قريبة من موعد الاستحقاق',
                message: `${upcomingDue.length} فاتورة تستحق خلال أسبوع`,
                count: upcomingDue.length,
                totalAmount: upcomingDue.reduce((sum, inv) => sum + inv.balance, 0),
                action: 'إرسال تذكيرات',
                timestamp: now.toISOString()
            });
        }

        // 2. Overdue Invoices
        const overdue = invoices.filter(inv => {
            if (inv.status !== 'pending') return false;
            const dueDate = new Date(inv.date);
            dueDate.setDate(dueDate.getDate() + 30);
            return dueDate < now;
        });

        if (overdue.length > 0) {
            alerts.push({
                type: 'overdue',
                severity: 'critical',
                title: 'فواتير متأخرة',
                message: `${overdue.length} فاتورة متأخرة عن موعد السداد`,
                count: overdue.length,
                totalAmount: overdue.reduce((sum, inv) => sum + inv.balance, 0),
                action: 'متابعة فورية',
                timestamp: now.toISOString()
            });
        }

        // 3. Low Stock Alerts
        const criticalStock = products.filter(p =>
            p.status === 'active' && p.stock < p.minStock * 0.5
        );

        if (criticalStock.length > 0) {
            alerts.push({
                type: 'low_stock',
                severity: 'critical',
                title: 'مخزون منخفض جداً',
                message: `${criticalStock.length} منتج أقل من 50% من الحد الأدنى`,
                count: criticalStock.length,
                products: criticalStock.map(p => p.name),
                action: 'طلب فوري',
                timestamp: now.toISOString()
            });
        }

        // 4. High Expense Alert
        const thisMonth = now.toISOString().slice(0, 7);
        const thisMonthExpenses = expenses.filter(e =>
            e.date.toISOString().slice(0, 7) === thisMonth
        );
        const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Get last month average
        const lastMonths = [...new Set(expenses.map(e => e.date.toISOString().slice(0, 7)))]
            .sort()
            .slice(-3, -1);

        if (lastMonths.length > 0) {
            const avgExpenses = expenses
                .filter(e => lastMonths.includes(e.date.toISOString().slice(0, 7)))
                .reduce((sum, e) => sum + e.amount, 0) / lastMonths.length;

            if (thisMonthTotal > avgExpenses * 1.3) {
                alerts.push({
                    type: 'high_expense',
                    severity: 'warning',
                    title: 'مصروفات مرتفعة',
                    message: `المصروفات هذا الشهر أعلى بـ ${Math.round(((thisMonthTotal / avgExpenses) - 1) * 100)}% من المتوسط`,
                    currentMonth: Math.round(thisMonthTotal),
                    average: Math.round(avgExpenses),
                    action: 'مراجعة المصروفات',
                    timestamp: now.toISOString()
                });
            }
        }

        // 5. Inactive Customer Alert
        const inactiveCount = customers.filter(c => {
            if (c.invoices.length === 0) return false;
            const lastInvoice = new Date(Math.max(...c.invoices.map(inv => new Date(inv.date))));
            const daysSince = Math.floor((now - lastInvoice) / (1000 * 60 * 60 * 24));
            return daysSince > 90;
        }).length;

        if (inactiveCount > 0) {
            alerts.push({
                type: 'inactive_customers',
                severity: 'info',
                title: 'عملاء غير نشطين',
                message: `${inactiveCount} عميل لم يشتروا منذ 3 أشهر`,
                count: inactiveCount,
                action: 'حملة تسويقية',
                timestamp: now.toISOString()
            });
        }

        // Sort by severity
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return NextResponse.json({
            alerts,
            summary: {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                warning: alerts.filter(a => a.severity === 'warning').length,
                info: alerts.filter(a => a.severity === 'info').length
            },
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Alerts error:', error);
        return NextResponse.json(
            { error: 'Failed to generate alerts' },
            { status: 500 }
        );
    }
}
