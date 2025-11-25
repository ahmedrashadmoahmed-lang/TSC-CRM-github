import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { ReportService } from '@/services/ReportService';

// GET /api/reports/sales
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const customerId = searchParams.get('customerId');
        const status = searchParams.get('status');

        if (!startDate || !endDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'تاريخ البداية والنهاية مطلوبان',
                },
                { status: 400 }
            );
        }

        const filters = {};
        if (customerId) filters.customerId = customerId;
        if (status) filters.status = status;

        const report = await ReportService.generateSalesReport(
            request.tenantId,
            startDate,
            endDate,
            filters
        );

        return NextResponse.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error('Error generating sales report:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء إنشاء التقرير',
            },
            { status: 500 }
        );
    }
}, ['report:read']);
