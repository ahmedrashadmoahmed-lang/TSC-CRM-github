import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { PayrollService } from '@/services/PayrollService';
import { validate } from '@/lib/validation';
import { z } from 'zod';

const payrollSchema = z.object({
    employeeId: z.string().min(1, 'معرف الموظف مطلوب'),
    month: z.number().int().min(1).max(12, 'الشهر يجب أن يكون بين 1 و 12'),
    year: z.number().int().min(2020, 'السنة يجب أن تكون 2020 أو أحدث'),
    basicSalary: z.number().positive('الراتب الأساسي يجب أن يكون موجب'),
    allowances: z.number().nonnegative('البدلات يجب أن تكون موجبة أو صفر').default(0),
    deductions: z.number().nonnegative('الخصومات يجب أن تكون موجبة أو صفر').default(0),
    overtime: z.number().nonnegative('الإضافي يجب أن يكون موجب أو صفر').default(0),
    notes: z.string().optional(),
});

// GET /api/payroll
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const status = searchParams.get('status');

        const service = new PayrollService(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail
        );

        const filters = {};
        if (employeeId) filters.employeeId = employeeId;
        if (month) filters.month = parseInt(month);
        if (year) filters.year = parseInt(year);
        if (status) filters.status = status;

        const payrollEntries = await service.getPayrollEntries(filters);

        return NextResponse.json({
            success: true,
            data: payrollEntries,
        });
    } catch (error) {
        console.error('Error fetching payroll:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب الرواتب',
            },
            { status: 500 }
        );
    }
}, ['payroll:read']);

// POST /api/payroll
export const POST = withAuth(async (request) => {
    try {
        const body = await request.json();

        // Validate
        const { success, errors } = validate(payrollSchema, body);
        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    errors,
                },
                { status: 400 }
            );
        }

        const service = new PayrollService(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail
        );

        const payroll = await service.createPayroll(body, request);

        return NextResponse.json({
            success: true,
            data: payroll,
            message: 'تم إنشاء الراتب بنجاح',
        });
    } catch (error) {
        console.error('Error creating payroll:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء إنشاء الراتب',
            },
            { status: 500 }
        );
    }
}, ['payroll:create']);
