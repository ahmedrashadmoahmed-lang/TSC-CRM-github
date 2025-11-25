import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { getTenantPrisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { z } from 'zod';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

const productSchema = z.object({
    name: z.string().min(1, 'اسم المنتج مطلوب'),
    sku: z.string().min(1, 'رمز المنتج مطلوب'),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().positive('السعر يجب أن يكون موجب'),
    cost: z.number().nonnegative('التكلفة يجب أن تكون موجبة أو صفر').optional(),
    unit: z.string().default('قطعة'),
    minStock: z.number().int().nonnegative('الحد الأدنى يجب أن يكون موجب أو صفر').default(0),
    maxStock: z.number().int().nonnegative('الحد الأقصى يجب أن يكون موجب أو صفر').optional(),
    barcode: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
});

// GET /api/products
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const status = searchParams.get('status');

        const prisma = getTenantPrisma(request.tenantId);

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) where.category = category;
        if (status) where.status = status;

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب المنتجات',
            },
            { status: 500 }
        );
    }
}, ['product:read']);

// POST /api/products
export const POST = withAuth(async (request) => {
    try {
        const body = await request.json();

        // Validate
        const { success, errors } = validate(productSchema, body);
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

        // Check if SKU already exists
        const existing = await prisma.product.findFirst({
            where: { sku: body.sku },
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'رمز المنتج موجود بالفعل',
                },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: body,
        });

        // Audit log
        await logAudit(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail,
            AUDIT_ACTIONS.CREATE,
            'Product',
            product.id,
            null,
            product,
            request
        );

        return NextResponse.json({
            success: true,
            data: product,
            message: 'تم إنشاء المنتج بنجاح',
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء إنشاء المنتج',
            },
            { status: 500 }
        );
    }
}, ['product:create']);
