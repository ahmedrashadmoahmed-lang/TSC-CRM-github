import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET advanced predictions
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;

        // Get customer data with invoices
        const customers = await prisma.customer.findMany({
            where: { tenantId },
            include: {
                invoices: {
                    orderBy: { issueDate: 'desc' }
                }
            }
        });

        const predictions = customers.map(customer => {
            const invoices = customer.invoices;

            // Calculate metrics
            const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
            const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
            const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

            // Calculate recency (days since last invoice)
            const lastInvoiceDate = invoices.length > 0
                ? new Date(invoices[0].issueDate)
                : null;
            const daysSinceLastInvoice = lastInvoiceDate
                ? Math.floor((new Date() - lastInvoiceDate) / (1000 * 60 * 60 * 24))
                : 999;

            // Calculate frequency (invoices per month)
            const firstInvoiceDate = invoices.length > 0
                ? new Date(invoices[invoices.length - 1].issueDate)
                : null;
            const monthsSinceFirst = firstInvoiceDate
                ? Math.max(1, Math.floor((new Date() - firstInvoiceDate) / (1000 * 60 * 60 * 24 * 30)))
                : 1;
            const frequency = invoices.length / monthsSinceFirst;

            // Calculate payment behavior
            const paymentRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

            // Churn Prediction (0-100)
            let churnScore = 0;
            if (daysSinceLastInvoice > 90) churnScore += 40;
            else if (daysSinceLastInvoice > 60) churnScore += 25;
            else if (daysSinceLastInvoice > 30) churnScore += 10;

            if (frequency < 0.5) churnScore += 30;
            else if (frequency < 1) churnScore += 15;

            if (paymentRate < 50) churnScore += 30;
            else if (paymentRate < 80) churnScore += 15;

            churnScore = Math.min(100, churnScore);

            // Customer Lifetime Value (CLV) Prediction
            const avgMonthlyRevenue = totalRevenue / Math.max(1, monthsSinceFirst);
            const expectedLifetimeMonths = churnScore < 30 ? 24 : churnScore < 60 ? 12 : 6;
            const predictedCLV = avgMonthlyRevenue * expectedLifetimeMonths;

            // Next Purchase Prediction (days)
            const avgDaysBetweenPurchases = invoices.length > 1
                ? calculateAvgDaysBetweenPurchases(invoices)
                : 30;
            const nextPurchaseDays = Math.round(avgDaysBetweenPurchases);

            // Customer Health Score (0-100)
            let healthScore = 100;
            healthScore -= churnScore * 0.5; // Churn impact
            if (paymentRate < 80) healthScore -= 20;
            if (frequency < 1) healthScore -= 15;
            healthScore = Math.max(0, Math.round(healthScore));

            return {
                customerId: customer.id,
                customerName: customer.name,
                metrics: {
                    totalRevenue: Math.round(totalRevenue),
                    totalInvoices: invoices.length,
                    avgInvoiceValue: Math.round(avgInvoiceValue),
                    paymentRate: Math.round(paymentRate),
                    frequency: Math.round(frequency * 10) / 10,
                    daysSinceLastInvoice
                },
                predictions: {
                    churnScore: Math.round(churnScore),
                    churnRisk: churnScore > 60 ? 'high' : churnScore > 30 ? 'medium' : 'low',
                    predictedCLV: Math.round(predictedCLV),
                    nextPurchaseDays,
                    healthScore,
                    healthStatus: healthScore > 70 ? 'healthy' : healthScore > 40 ? 'at-risk' : 'critical'
                },
                recommendations: generateRecommendations(churnScore, healthScore, paymentRate, frequency)
            };
        });

        // Sort by churn score (highest first)
        predictions.sort((a, b) => b.predictions.churnScore - a.predictions.churnScore);

        // Calculate summary statistics
        const summary = {
            totalCustomers: predictions.length,
            highChurnRisk: predictions.filter(p => p.predictions.churnRisk === 'high').length,
            mediumChurnRisk: predictions.filter(p => p.predictions.churnRisk === 'medium').length,
            lowChurnRisk: predictions.filter(p => p.predictions.churnRisk === 'low').length,
            avgHealthScore: Math.round(predictions.reduce((sum, p) => sum + p.predictions.healthScore, 0) / predictions.length),
            totalPredictedCLV: Math.round(predictions.reduce((sum, p) => sum + p.predictions.predictedCLV, 0)),
            criticalCustomers: predictions.filter(p => p.predictions.healthStatus === 'critical').length
        };

        return NextResponse.json({
            success: true,
            data: {
                predictions,
                summary
            }
        });

    } catch (error) {
        console.error('Error generating predictions:', error);
        return NextResponse.json(
            { error: 'Failed to generate predictions' },
            { status: 500 }
        );
    }
}

// Helper: Calculate average days between purchases
function calculateAvgDaysBetweenPurchases(invoices) {
    if (invoices.length < 2) return 30;

    let totalDays = 0;
    for (let i = 0; i < invoices.length - 1; i++) {
        const date1 = new Date(invoices[i].issueDate);
        const date2 = new Date(invoices[i + 1].issueDate);
        const days = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
        totalDays += days;
    }

    return totalDays / (invoices.length - 1);
}

// Helper: Generate recommendations
function generateRecommendations(churnScore, healthScore, paymentRate, frequency) {
    const recommendations = [];

    if (churnScore > 60) {
        recommendations.push({
            priority: 'high',
            action: 'ØªÙˆØ§ØµÙ„ ÙÙˆØ±ÙŠ',
            description: 'Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù…Ø¹Ø±Ø¶ Ù„Ø®Ø·Ø± ÙƒØ¨ÙŠØ± Ù„Ù„ØªÙˆÙ‚Ù Ø¹Ù† Ø§Ù„Ø´Ø±Ø§Ø¡'
        });
    }

    if (paymentRate < 50) {
        recommendations.push({
            priority: 'high',
            action: 'Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„ØªØ­ØµÙŠÙ„',
            description: 'Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø¯ÙØ¹ Ù…Ù†Ø®ÙØ¶ Ø¬Ø¯Ø§Ù‹'
        });
    }

    if (frequency < 0.5) {
        recommendations.push({
            priority: 'medium',
            action: 'Ø­Ù…Ù„Ø© ØªØ³ÙˆÙŠÙ‚ÙŠØ©',
            description: 'ØªÙƒØ±Ø§Ø± Ø§Ù„Ø´Ø±Ø§Ø¡ Ù…Ù†Ø®ÙØ¶'
        });
    }

    if (healthScore > 70) {
        recommendations.push({
            priority: 'low',
            action: 'ÙØ±ØµØ© Ù„Ù„Ø¨ÙŠØ¹ Ø§Ù„Ø¥Ø¶Ø§ÙÙŠ',
            description: 'Ø¹Ù…ÙŠÙ„ ØµØ­ÙŠ - ÙØ±ØµØ© Ù„Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù‚ÙŠÙ…Ø©'
        });
    }

    return recommendations;
}
