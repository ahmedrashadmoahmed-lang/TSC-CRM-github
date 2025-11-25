import { NextResponse } from 'next/server';
import { withAuth, adminOnly } from '@/middleware/auth';
import DataImportService from '@/services/DataImportService';

/**
 * Generate import template
 * GET /api/import/template?type=customers
 */
export const GET = withAuth(adminOnly, async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const dataType = searchParams.get('type');

        if (!dataType) {
            return NextResponse.json(
                { error: 'Data type is required' },
                { status: 400 }
            );
        }

        const template = DataImportService.generateTemplate(dataType);

        return new NextResponse(template, {
            headers: {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${dataType}_template.xlsx"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to generate template' },
            { status: 500 }
        );
    }
});
