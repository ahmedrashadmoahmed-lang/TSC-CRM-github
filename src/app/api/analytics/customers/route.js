import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [customers, invoices] = await Promise.all([
            prisma.customer.findMany({
                include: {
                    invoices: true
                }
            }),
            prisma.invoice.findMany()
        ]);

        // Analyze customer behavior
        const customerInsights = customers.map(customer => {
            const customerInvoices = customer.invoices;
            const totalValue = customerInvoices.reduce((sum, inv) => sum + inv.finalValue, 0);
            const totalCollected = customerInvoices.reduce((sum, inv) => sum + inv.collected, 0);
            const avgInvoiceValue = totalValue / (customerInvoices.length || 1);
            const collectionRate = totalValue > 0 ? (totalCollected / totalValue) * 100 : 0;

            // Calculate recency (days since last invoice)
            const lastInvoiceDate = customerInvoices.length > 0
                ? new Date(Math.max(...customerInvoices.map(inv => new Date(inv.date))))
                : null;
            const daysSinceLastInvoice = lastInvoiceDate
                ? Math.floor((new Date() - lastInvoiceDate) / (1000 * 60 * 60 * 24))
                : 999;

            // Customer score (0-100)
            const valueScore = Math.min(100, (totalValue / 100000) * 50);
            const frequencyScore = Math.min(100, (customerInvoices.length / 10) * 30);
            const recencyScore = Math.max(0, 20 - (daysSinceLastInvoice / 30));
            const customerScore = Math.round(valueScore + frequencyScore + recencyScore);

            // Risk assessment
            let riskLevel = 'low';
            if (collectionRate < 50) riskLevel = 'high';
            else if (collectionRate < 80) riskLevel = 'medium';

            return {
                id: customer.id,
                name: customer.name,
                totalValue: Math.round(totalValue),
                totalInvoices: customerInvoices.length,
                avgInvoiceValue: Math.round(avgInvoiceValue),
                collectionRate: Math.round(collectionRate),
                daysSinceLastInvoice,
                customerScore,
                riskLevel,
                segment: getCustomerSegment(customerScore, totalValue)
            };
        });

        // Sort by score
        customerInsights.sort((a, b) => b.customerScore - a.customerScore);

        // Top customers
        const topCustomers = customerInsights.slice(0, 5);

        // At-risk customers
        const atRiskCustomers = customerInsights.filter(c => c.riskLevel === 'high');

        // Segment distribution
        const segments = {
            vip: customerInsights.filter(c => c.segment === 'VIP').length,
            high: customerInsights.filter(c => c.segment === 'High Value').length,
            medium: customerInsights.filter(c => c.segment === 'Medium Value').length,
            low: customerInsights.filter(c => c.segment === 'Low Value').length
        };

        return NextResponse.json({
            insights: customerInsights,
            topCustomers,
            atRiskCustomers,
            segments,
            summary: {
                totalCustomers: customers.length,
                avgCustomerValue: Math.round(customerInsights.reduce((sum, c) => sum + c.totalValue, 0) / customers.length),
                avgCollectionRate: Math.round(customerInsights.reduce((sum, c) => sum + c.collectionRate, 0) / customers.length),
                highRiskCount: atRiskCustomers.length
            }
        });

    } catch (error) {
        console.error('Customer insights error:', error);
        return NextResponse.json(
            { error: 'Failed to generate customer insights' },
            { status: 500 }
        );
    }
}

function getCustomerSegment(score, totalValue) {
    if (score >= 80 && totalValue >= 100000) return 'VIP';
    if (score >= 60 || totalValue >= 50000) return 'High Value';
    if (score >= 40 || totalValue >= 20000) return 'Medium Value';
    return 'Low Value';
}
