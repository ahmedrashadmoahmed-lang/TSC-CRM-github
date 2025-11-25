import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import AdvancedAIService from '@/services/AdvancedAIService';
import logger from '@/lib/logger';

/**
 * Analyze historical data with AI
 * POST /api/ai/analyze
 */
export const POST = withAuth(async (req) => {
    try {
        const tenantId = req.tenantId;
        const { months, includeCustomers, includeProducts, includeInvoices } =
            await req.json();

        logger.info('Starting AI analysis', { tenantId, months });

        const result = await AdvancedAIService.analyzeHistoricalData(tenantId, {
            months: months || 12,
            includeCustomers: includeCustomers !== false,
            includeProducts: includeProducts !== false,
            includeInvoices: includeInvoices !== false,
        });

        return NextResponse.json(result);
    } catch (error) {
        logger.error('AI analysis error', { error: error.message });
        return NextResponse.json(
            { error: 'Failed to analyze data' },
            { status: 500 }
        );
    }
});
