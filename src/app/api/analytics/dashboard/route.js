import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { AnalyticsService } from '@/services/AnalyticsService';

// GET /api/analytics/dashboard
export const GET = withAuth(async (request) => {
    try {
        const service = new AnalyticsService(
            request.tenantId,
            request.tenantSettings,
            request.userId,
            request.userName,
            request.userEmail
        );

        const stats = await service.getDashboardStats();

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب إحصائيات لوحة التحكم',
            },
            { status: 500 }
        );
    }
}, ['analytics:read']);
