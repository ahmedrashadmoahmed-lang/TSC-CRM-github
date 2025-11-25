import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { AccountingService } from '@/services/AccountingService';

// GET /api/accounting/reports/trial-balance
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        const service = new AccountingService(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail
        );

        const trialBalance = await service.getTrialBalance(
            date ? new Date(date) : new Date()
        );

        return NextResponse.json({
            success: true,
            data: trialBalance,
        });
    } catch (error) {
        console.error('Error fetching trial balance:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب ميزان المراجعة',
            },
            { status: 500 }
        );
    }
}, ['accounting:read']);
