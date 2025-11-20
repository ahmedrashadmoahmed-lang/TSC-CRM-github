import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [invoices, customers, expenses, products] = await Promise.all([
            prisma.invoice.findMany({ include: { customer: true } }),
            prisma.customer.findMany({ include: { invoices: true } }),
            prisma.expense.findMany(),
            prisma.product.findMany()
        ]);

        const recommendations = [];

        // 1. Collection Recommendations
        const overdueInvoices = invoices.filter(inv => {
            const daysSince = Math.floor((new Date() - new Date(inv.date)) / (1000 * 60 * 60 * 24));
            return inv.status === 'pending' && daysSince > 30;
        });

        if (overdueInvoices.length > 0) {
            recommendations.push({
                type: 'collection',
                priority: 'high',
                title: 'متابعة الفواتير المتأخرة',
                description: `لديك ${overdueInvoices.length} فاتورة متأخرة بإجمالي ${overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0).toLocaleString('ar-EG')} جنيه`,
                action: 'إرسال تذكيرات للعملاء',
                impact: 'تحسين التدفق النقدي',
                invoices: overdueInvoices.slice(0, 5).map(inv => ({
                    id: inv.id,
                    number: inv.invoiceNumber,
                    customer: inv.customer.name,
                    amount: inv.balance,
                    days: Math.floor((new Date() - new Date(inv.date)) / (1000 * 60 * 60 * 24))
                }))
            });
        }

        // 2. Customer Engagement
        const inactiveCustomers = customers.filter(customer => {
            if (customer.invoices.length === 0) return false;
            const lastInvoice = new Date(Math.max(...customer.invoices.map(inv => new Date(inv.date))));
            const daysSince = Math.floor((new Date() - lastInvoice) / (1000 * 60 * 60 * 24));
            return daysSince > 60;
        });

        if (inactiveCustomers.length > 0) {
            recommendations.push({
                type: 'engagement',
                priority: 'medium',
                title: 'إعادة تفعيل العملاء غير النشطين',
                description: `${inactiveCustomers.length} عميل لم يشتروا منذ أكثر من شهرين`,
                action: 'تواصل مع العملاء وقدم عروض خاصة',
                impact: 'زيادة المبيعات',
                customers: inactiveCustomers.slice(0, 5).map(c => ({
                    name: c.name,
                    lastPurchase: new Date(Math.max(...c.invoices.map(inv => new Date(inv.date)))).toLocaleDateString('ar-EG'),
                    totalValue: c.totalValue
                }))
            });
        }

        // 3. Inventory Management
        const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.status === 'active');

        if (lowStockProducts.length > 0) {
            recommendations.push({
                type: 'inventory',
                priority: 'high',
                title: 'تجديد المخزون',
                description: `${lowStockProducts.length} منتج وصل للحد الأدنى`,
                action: 'إنشاء أوامر شراء جديدة',
                impact: 'تجنب نفاد المخزون',
                products: lowStockProducts.map(p => ({
                    name: p.name,
                    current: p.stock,
                    minimum: p.minStock,
                    needed: Math.max(p.minStock * 2 - p.stock, 0)
                }))
            });
        }

        // 4. Expense Optimization
        const monthlyExpenses = {};
        expenses.forEach(exp => {
            const month = new Date(exp.date).toISOString().slice(0, 7);
            monthlyExpenses[month] = (monthlyExpenses[month] || 0) + exp.amount;
        });

        const months = Object.keys(monthlyExpenses).sort();
        if (months.length >= 2) {
            const lastMonth = monthlyExpenses[months[months.length - 1]];
            const prevMonth = monthlyExpenses[months[months.length - 2]];
            const increase = ((lastMonth - prevMonth) / prevMonth) * 100;

            if (increase > 20) {
                recommendations.push({
                    type: 'expense',
                    priority: 'medium',
                    title: 'ارتفاع المصروفات',
                    description: `المصروفات ارتفعت ${Math.round(increase)}% عن الشهر الماضي`,
                    action: 'مراجعة المصروفات وتحديد الزيادات غير الضرورية',
                    impact: 'تحسين الربحية',
                    data: {
                        lastMonth: Math.round(lastMonth),
                        prevMonth: Math.round(prevMonth),
                        increase: Math.round(increase)
                    }
                });
            }
        }

        // 5. Sales Opportunities
        const topCustomers = customers
            .filter(c => c.totalValue > 0)
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, 5);

        if (topCustomers.length > 0) {
            recommendations.push({
                type: 'opportunity',
                priority: 'low',
                title: 'فرص البيع للعملاء المميزين',
                description: 'ركز على أفضل 5 عملاء لزيادة المبيعات',
                action: 'تقديم عروض حصرية وخدمات إضافية',
                impact: 'زيادة قيمة العميل',
                customers: topCustomers.map(c => ({
                    name: c.name,
                    value: c.totalValue,
                    potential: Math.round(c.totalValue * 0.2) // 20% growth potential
                }))
            });
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return NextResponse.json({
            recommendations,
            summary: {
                total: recommendations.length,
                high: recommendations.filter(r => r.priority === 'high').length,
                medium: recommendations.filter(r => r.priority === 'medium').length,
                low: recommendations.filter(r => r.priority === 'low').length
            }
        });

    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
