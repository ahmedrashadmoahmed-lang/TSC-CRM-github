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

// GET /api/products/[id]
export async function GET(request, { params }) {
    return withAuth(async (req) => {
        try {
            const { id } = params;
            const prisma = getTenantPrisma(req.tenantId);

            const product = await prisma.product.findUnique({
                where: { id },
            });

            if (!product) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'المنتج غير موجود',
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: product,
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.message || 'حدث خطأ أثناء جلب المنتج',
                },
                { status: 500 }
            );
        }
    }, ['product:read'])(request);
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
    return withAuth(async (req) => {
        try {
            const { id } = params;
            const body = await req.json();

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

            const prisma = getTenantPrisma(req.tenantId);

            // Get old data
            const oldProduct = await prisma.product.findUnique({
                where: { id },
            });

            if (!oldProduct) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'المنتج غير موجود',
                    },
                    { status: 404 }
                );
            }

            // Check SKU uniqueness
            if (body.sku !== oldProduct.sku) {
                const existing = await prisma.product.findFirst({
                    where: { sku: body.sku, id: { not: id } },
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
            }

            const product = await prisma.product.update({
                where: { id },
                data: body,
            });

            // Audit log
            await logAudit(
                req.tenantId,
                req.userId,
                req.userName,
                req.userEmail,
                AUDIT_ACTIONS.UPDATE,
                'Product',
                product.id,
                oldProduct,
                product,
                req
            );

            return NextResponse.json({
                success: true,
                data: product,
                message: 'تم تحديث المنتج بنجاح',
            });
        } catch (error) {
            console.error('Error updating product:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.message || 'حدث خطأ أثناء تحديث المنتج',
                },
                { status: 500 }
            );
        }
    }, ['product:update'])(request);
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
    return withAuth(async (req) => {
        try {
            const { id } = params;
            const prisma = getTenantPrisma(req.tenantId);

            const product = await prisma.product.findUnique({
                where: { id },
            });

            if (!product) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'المنتج غير موجود',
                    },
                    { status: 404 }
                );
            }

            await prisma.product.delete({
                where: { id },
            });

            // Audit log
            await logAudit(
                req.tenantId,
                req.userId,
                req.userName,
                req.userEmail,
                AUDIT_ACTIONS.DELETE,
                'Product',
                product.id,
                product,
                null,
                req
            );

            return NextResponse.json({
                success: true,
                message: 'تم حذف المنتج بنجاح',
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.message || 'حدث خطأ أثناء حذف المنتج',
                },
                { status: 500 }
            );
        }
    }, ['product:delete'])(request);
}
