import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { ReportService } from '@/services/ReportService';

// GET /api/reports/financial
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'تاريخ البداية والنهاية مطلوبان',
                },
                { status: 400 }
            );
        }

        const report = await ReportService.generateFinancialReport(
            request.tenantId,
            startDate,
            endDate
        );

        return NextResponse.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error('Error generating financial report:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء إنشاء التقرير',
            },
            { status: 500 }
        );
    }
}, ['report:read', 'accounting:read']);
