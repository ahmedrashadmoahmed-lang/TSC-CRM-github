import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET cohort analysis
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'monthly'; // monthly, quarterly
        const metric = searchParams.get('metric') || 'retention'; // retention, revenue

        const tenantId = session.user.tenantId;

        // Get all customers with their first purchase date
        const customers = await prisma.customer.findMany({
            where: { tenantId },
            include: {
                invoices: {
                    orderBy: { issueDate: 'asc' }
                }
            }
        });

        // Build cohorts
        const cohorts = {};

        customers.forEach(customer => {
            if (customer.invoices.length === 0) return;

            const firstPurchase = new Date(customer.invoices[0].issueDate);
            const cohortKey = getCohortKey(firstPurchase, period);

            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = {
                    cohort: cohortKey,
                    customers: [],
                    size: 0,
                    periods: {}
                };
            }

            cohorts[cohortKey].customers.push({
                id: customer.id,
                name: customer.name,
                firstPurchase,
                invoices: customer.invoices
            });
            cohorts[cohortKey].size++;
        });

        // Calculate retention/revenue for each period
        const cohortAnalysis = Object.values(cohorts).map(cohort => {
            const periods = {};

            // Calculate for each period (0-11 months or 0-3 quarters)
            const maxPeriods = period === 'monthly' ? 12 : 4;

            for (let p = 0; p < maxPeriods; p++) {
                let activeCustomers = 0;
                let totalRevenue = 0;

                cohort.customers.forEach(customer => {
                    const periodStart = new Date(customer.firstPurchase);
                    if (period === 'monthly') {
                        periodStart.setMonth(periodStart.getMonth() + p);
                    } else {
                        periodStart.setMonth(periodStart.getMonth() + (p * 3));
                    }

                    const periodEnd = new Date(periodStart);
                    if (period === 'monthly') {
                        periodEnd.setMonth(periodEnd.getMonth() + 1);
                    } else {
                        periodEnd.setMonth(periodEnd.getMonth() + 3);
                    }

                    // Check if customer made purchase in this period
                    const periodInvoices = customer.invoices.filter(inv => {
                        const invDate = new Date(inv.issueDate);
                        return invDate >= periodStart && invDate < periodEnd;
                    });

                    if (periodInvoices.length > 0) {
                        activeCustomers++;
                        totalRevenue += periodInvoices.reduce((sum, inv) => sum + inv.total, 0);
                    }
                });

                periods[`period_${p}`] = {
                    activeCustomers,
                    retentionRate: cohort.size > 0 ? (activeCustomers / cohort.size) * 100 : 0,
                    revenue: totalRevenue,
                    avgRevenuePerCustomer: activeCustomers > 0 ? totalRevenue / activeCustomers : 0
                };
            }

            return {
                cohort: cohort.cohort,
                size: cohort.size,
                periods
            };
        });

        // Sort by cohort date
        cohortAnalysis.sort((a, b) => a.cohort.localeCompare(b.cohort));

        return NextResponse.json({
            success: true,
            data: {
                cohorts: cohortAnalysis,
                period,
                metric,
                summary: {
                    totalCohorts: cohortAnalysis.length,
                    avgCohortSize: cohortAnalysis.reduce((sum, c) => sum + c.size, 0) / cohortAnalysis.length,
                    avgRetentionMonth1: calculateAvgRetention(cohortAnalysis, 1),
                    avgRetentionMonth3: calculateAvgRetention(cohortAnalysis, 3),
                    avgRetentionMonth6: calculateAvgRetention(cohortAnalysis, 6)
                }
            }
        });

    } catch (error) {
        console.error('Error generating cohort analysis:', error);
        return NextResponse.json(
            { error: 'Failed to generate cohort analysis' },
            { status: 500 }
        );
    }
}

// Helper: Get cohort key based on period
function getCohortKey(date, period) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (period === 'monthly') {
        return `${year}-${String(month).padStart(2, '0')}`;
    } else {
        const quarter = Math.ceil(month / 3);
        return `${year}-Q${quarter}`;
    }
}

// Helper: Calculate average retention for a specific period
function calculateAvgRetention(cohorts, periodIndex) {
    const validCohorts = cohorts.filter(c => c.periods[`period_${periodIndex}`]);
    if (validCohorts.length === 0) return 0;

    const totalRetention = validCohorts.reduce((sum, c) =>
        sum + c.periods[`period_${periodIndex}`].retentionRate, 0
    );

    return Math.round((totalRetention / validCohorts.length) * 10) / 10;
}
