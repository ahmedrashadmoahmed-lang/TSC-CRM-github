import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CostEstimationEngine from '@/lib/costEstimationEngine';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { budget, currency = 'EGP' } = await request.json();

        // 1. Get RFQ with items and quotes
        const rfq = await prisma.rFQ.findUnique({
            where: { id },
            include: {
                items: true,
                quotes: true
            }
        });

        if (!rfq) {
            return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
        }

        // 2. Estimate cost if no quotes yet
        let estimatedCost = 0;
        let lowestQuote = null;

        if (rfq.quotes && rfq.quotes.length > 0) {
            // Use lowest quote
            lowestQuote = Math.min(...rfq.quotes.map(q => q.totalPrice));
            estimatedCost = lowestQuote;
        } else {
            // Estimate from historical data
            // TODO: Fetch historical data for estimation
            const estimation = CostEstimationEngine.estimateRFQCost(
                rfq.items,
                [], // historical data
                { currency }
            );
            estimatedCost = estimation.totalEstimate;
        }

        // 3. Compare with budget
        const comparison = CostEstimationEngine.compareWithBudget(
            { totalEstimate: estimatedCost, currency },
            budget
        );

        // 4. Generate validation result
        const validation = {
            isValid: comparison.status === 'within_budget',
            status: comparison.status,
            budget: budget,
            estimatedCost: estimatedCost,
            difference: comparison.difference,
            percentDiff: comparison.percentDiff,
            message: comparison.message
        };

        // 5. Add warnings and recommendations
        const warnings = [];
        const recommendations = [];

        if (comparison.status.includes('over_budget')) {
            warnings.push({
                type: 'error',
                message: `Estimated cost exceeds budget by ${Math.abs(comparison.percentDiff)}%`
            });

            if (Math.abs(comparison.percentDiff) > 20) {
                recommendations.push('Consider revising budget or reducing scope');
                recommendations.push('Negotiate with suppliers for better pricing');
            } else if (Math.abs(comparison.percentDiff) > 10) {
                recommendations.push('Review RFQ items for cost optimization');
                recommendations.push('Request volume discounts from suppliers');
            }
        } else if (Math.abs(comparison.difference) < budget * 0.1) {
            warnings.push({
                type: 'info',
                message: 'Estimated cost is close to budget limit'
            });
            recommendations.push('Consider adding buffer for contingencies');
        }

        // 6. Add cost breakdown
        const breakdown = {
            budget,
            estimatedCost,
            remaining: budget - estimatedCost,
            utilizationPercent: (estimatedCost / budget) * 100,
            hasQuotes: rfq.quotes && rfq.quotes.length > 0,
            quotesCount: rfq.quotes?.length || 0
        };

        return NextResponse.json({
            success: true,
            data: {
                validation,
                warnings,
                recommendations,
                breakdown
            }
        });

    } catch (error) {
        console.error('Error validating budget:', error);
        return NextResponse.json({ error: 'Failed to validate budget' }, { status: 500 });
    }
}
