import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { InventoryService } from '@/services/InventoryService';
import { validate } from '@/lib/validation';
import { z } from 'zod';

// Validation schemas
const movementSchema = z.object({
    productId: z.string().min(1, 'معرف المنتج مطلوب'),
    warehouseId: z.string().min(1, 'معرف المخزن مطلوب'),
    type: z.enum(['PURCHASE', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'], {
        errorMap: () => ({ message: 'نوع الحركة غير صحيح' }),
    }),
    quantity: z.number().positive('الكمية يجب أن تكون موجبة'),
    unitCost: z.number().nonnegative('التكلفة يجب أن تكون موجبة أو صفر').optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

const transferSchema = z.object({
    productId: z.string().min(1, 'معرف المنتج مطلوب'),
    fromWarehouseId: z.string().min(1, 'المخزن المصدر مطلوب'),
    toWarehouseId: z.string().min(1, 'المخزن الوجهة مطلوب'),
    quantity: z.number().positive('الكمية يجب أن تكون موجبة'),
    notes: z.string().optional(),
});

const adjustmentSchema = z.object({
    productId: z.string().min(1, 'معرف المنتج مطلوب'),
    warehouseId: z.string().min(1, 'معرف المخزن مطلوب'),
    quantity: z.number().int('الكمية يجب أن تكون عدد صحيح'),
    reason: z.string().min(1, 'السبب مطلوب'),
    notes: z.string().optional(),
});

// GET /api/inventory/movements
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const warehouseId = searchParams.get('warehouseId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const service = new InventoryService(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail
        );

        const filters = {};
        if (productId) filters.productId = productId;
        if (warehouseId) filters.warehouseId = warehouseId;
        if (type) filters.type = type;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);

        const movements = await service.getMovementHistory(filters);

        return NextResponse.json({
            success: true,
            data: movements,
        });
    } catch (error) {
        console.error('Error fetching inventory movements:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء جلب حركات المخزون',
            },
            { status: 500 }
        );
    }
}, ['inventory:read']);

// POST /api/inventory/movements
export const POST = withAuth(async (request) => {
    try {
        const body = await request.json();

        // Validate
        const { success, errors } = validate(movementSchema, body);
        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    errors,
                },
                { status: 400 }
            );
        }

        const service = new InventoryService(
            request.tenantId,
            request.userId,
            request.userName,
            request.userEmail
        );

        const movement = await service.recordMovement(body, request);

        return NextResponse.json({
            success: true,
            data: movement,
            message: 'تم تسجيل حركة المخزون بنجاح',
        });
    } catch (error) {
        console.error('Error creating inventory movement:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء تسجيل حركة المخزون',
            },
            { status: 500 }
        );
    }
}, ['inventory:create']);
