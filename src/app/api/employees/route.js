import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { getTenantPrisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { z } from 'zod';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

const employeeSchema = z.object({
    name: z.string().min(1, 'اسم الموظف مطلوب'),
    email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
    phone: z.string().optional(),
    position: z.string().min(1, 'المسمى الوظيفي مطلوب'),
    department: z.string().optional(),
    salary: z.number().positive('الراتب يجب أن يكون موجب'),
    hireDate: z.string().or(z.date()),
    status: z.enum(['active', 'inactive', 'terminated']).default('active'),
    nationalId: z.string().optional(),
    address: z.string().optional(),
});

// GET /api/employees
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const department = searchParams.get('department');
        const status = searchParams.get('status');

        const prisma = getTenantPrisma(request.tenantId);

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { position: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (department) where.department = department;
        if (status) where.status = status;

        const employees = await prisma.employee.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: employees,
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب الموظفين',
            },
            { status: 500 }
        );
    }
}, ['employee:read']);

// POST /api/employees
export const POST = withAuth(async (request) => {
    try {
        const body = await request.json();

        // Validate
        const { success, errors } = validate(employeeSchema, body);
        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    errors,
                },
                { status: 400 }
            );
        }

        const prisma = getTenantPrisma(request.tenantId);

        // Check if email already exists
        if (body.email) {
            const existing = await prisma.employee.findFirst({
                where: { email: body.email },
            });

            if (existing) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'البريد الإلكتروني موجود بالفعل',
                    },
                    { status: 400 }
                );
            }
        }

        const employee = await prisma.employee.create({
            data: {
                ...body,
                hireDate: new Date(body.hireDate),
            },
        });

        // Audit log
        await logAudit(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail,
            AUDIT_ACTIONS.CREATE,
            'Employee',
            employee.id,
            null,
            employee,
            request
        );

        return NextResponse.json({
            success: true,
            data: employee,
            message: 'تم إضافة الموظف بنجاح',
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء إضافة الموظف',
            },
            { status: 500 }
        );
    }
}, ['employee:create']);
