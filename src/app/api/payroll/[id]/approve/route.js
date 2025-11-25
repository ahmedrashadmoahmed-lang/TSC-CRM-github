import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { PayrollService } from '@/services/PayrollService';

// POST /api/payroll/[id]/approve
export async function POST(request, { params }) {
    return withAuth(async (req) => {
        try {
            const { id } = params;

            const service = new PayrollService(
                req.tenantId,
                req.userId,
                req.userName,
                req.userEmail
            );

            const payroll = await service.approvePayroll(id, req);

            return NextResponse.json({
                success: true,
                data: payroll,
                message: 'تم اعتماد الراتب بنجاح',
            });
        } catch (error) {
            console.error('Error approving payroll:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.message || 'حدث خطأ أثناء اعتماد الراتب',
                },
                { status: 500 }
            );
        }
    }, ['payroll:approve'])(request);
}
