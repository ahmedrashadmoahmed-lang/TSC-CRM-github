// RFQ Analytics API
// Dashboard analytics and metrics

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId') || 'default';
        const timeRange = parseInt(searchParams.get('timeRange')) || 30; // days

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Fetch RFQs with all relations
        const rfqs = await prisma.rFQ.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                items: true,
                suppliers: {
                    include: {
                        supplier: true
                    }
                },
                quotes: {
                    include: {
                        supplier: true,
                        items: true
                    }
                },
                timeline: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate metrics
        const metrics = {
            overview: {
                totalRFQs: rfqs.length,
                activeRFQs: rfqs.filter(r => r.status === 'active' && r.stage !== 'closed').length,
                closedRFQs: rfqs.filter(r => r.stage === 'closed').length,
                draftRFQs: rfqs.filter(r => r.stage === 'draft').length
            },

            financial: {
                totalValue: rfqs.reduce((sum, r) => sum + (r.estimatedCost || r.budget || 0), 0),
                totalBudget: rfqs.reduce((sum, r) => sum + (r.budget || 0), 0),
                totalSavings: 0 // Will calculate
            },

            performance: {
                avgCycleTime: 0, // Will calculate
                avgQuotesPerRFQ: 0, // Will calculate
                responseRate: 0, // Will calculate
                completionRate: 0
            },

            distribution: {
                byStage: {},
                byPriority: {},
                byStatus: {}
            },

            suppliers: [],

            trends: {
                daily: [],
                weekly: [],
                monthly: []
            }
        };

        // Completion rate
        if (metrics.overview.totalRFQs > 0) {
            metrics.performance.completionRate =
                (metrics.overview.closedRFQs / metrics.overview.totalRFQs) * 100;
        }

        // Average cycle time
        const completedRFQs = rfqs.filter(r => r.stage === 'closed' && r.createdAt && r.closedAt);
        if (completedRFQs.length > 0) {
            const totalDays = completedRFQs.reduce((sum, rfq) => {
                const days = (new Date(rfq.closedAt) - new Date(rfq.createdAt)) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0);
            metrics.performance.avgCycleTime = totalDays / completedRFQs.length;
        }

        // Average quotes per RFQ
        const rfqsWithQuotes = rfqs.filter(r => r.quotes && r.quotes.length > 0);
        if (rfqsWithQuotes.length > 0) {
            const totalQuotes = rfqsWithQuotes.reduce((sum, r) => sum + r.quotes.length, 0);
            metrics.performance.avgQuotesPerRFQ = totalQuotes / rfqsWithQuotes.length;
        }

        // Response rate
        const totalInvitations = rfqs.reduce((sum, r) => sum + (r.suppliers?.length || 0), 0);
        const totalResponses = rfqs.reduce((sum, r) => sum + (r.quotes?.length || 0), 0);
        if (totalInvitations > 0) {
            metrics.performance.responseRate = (totalResponses / totalInvitations) * 100;
        }

        // Total savings
        rfqs.forEach(rfq => {
            const selectedQuote = rfq.quotes?.find(q => q.isSelected);
            if (selectedQuote && rfq.budget && selectedQuote.totalPrice < rfq.budget) {
                metrics.financial.totalSavings += (rfq.budget - selectedQuote.totalPrice);
            }
        });

        // Distribution by stage
        rfqs.forEach(rfq => {
            metrics.distribution.byStage[rfq.stage] =
                (metrics.distribution.byStage[rfq.stage] || 0) + 1;

            metrics.distribution.byPriority[rfq.priority] =
                (metrics.distribution.byPriority[rfq.priority] || 0) + 1;

            metrics.distribution.byStatus[rfq.status] =
                (metrics.distribution.byStatus[rfq.status] || 0) + 1;
        });

        // Top suppliers
        const supplierStats = {};
        rfqs.forEach(rfq => {
            rfq.quotes?.forEach(quote => {
                const supplierId = quote.supplierId;
                if (!supplierStats[supplierId]) {
                    supplierStats[supplierId] = {
                        id: supplierId,
                        name: quote.supplier?.name || 'Unknown',
                        quotesSubmitted: 0,
                        quotesSelected: 0,
                        totalValue: 0,
                        avgResponseTime: 0
                    };
                }
                supplierStats[supplierId].quotesSubmitted++;
                if (quote.isSelected) {
                    supplierStats[supplierId].quotesSelected++;
                    supplierStats[supplierId].totalValue += quote.totalPrice || 0;
                }
            });
        });

        metrics.suppliers = Object.values(supplierStats)
            .map(s => ({
                ...s,
                winRate: s.quotesSubmitted > 0 ? (s.quotesSelected / s.quotesSubmitted) * 100 : 0
            }))
            .sort((a, b) => b.quotesSelected - a.quotesSelected)
            .slice(0, 10);

        // Daily trends (last 7 days)
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayRFQs = rfqs.filter(r => {
                const rfqDate = new Date(r.createdAt).toISOString().split('T')[0];
                return rfqDate === dateStr;
            });

            metrics.trends.daily.push({
                date: dateStr,
                count: dayRFQs.length,
                value: dayRFQs.reduce((sum, r) => sum + (r.estimatedCost || r.budget || 0), 0)
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                metrics,
                timeRange: {
                    start: startDate,
                    end: endDate,
                    days: timeRange
                },
                generatedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error fetching RFQ analytics:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

