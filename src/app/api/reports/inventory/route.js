import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { ReportService } from '@/services/ReportService';

// GET /api/reports/inventory
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const lowStock = searchParams.get('lowStock') === 'true';

        const filters = {};
        if (category) filters.category = category;
        if (lowStock) filters.lowStock = true;

        const report = await ReportService.generateInventoryReport(
            request.tenantId,
            filters
        );

        return NextResponse.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error('Error generating inventory report:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء إنشاء التقرير',
            },
            { status: 500 }
        );
    }
}, ['report:read']);
