import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { AnalyticsService } from '@/services/AnalyticsService';

// GET /api/analytics/sales
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const service = new AnalyticsService(
            request.tenantId,
            request.tenantSettings,
            request.userId,
            request.userName,
            request.userEmail
        );

        const analytics = await service.getSalesAnalytics(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        return NextResponse.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        console.error('Error fetching sales analytics:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب تحليلات المبيعات',
            },
            { status: 500 }
        );
    }
}, ['analytics:read']);
