import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { InventoryService } from '@/services/InventoryService';
import { validate } from '@/lib/validation';
import { z } from 'zod';

const transferSchema = z.object({
    productId: z.string().min(1, 'معرف المنتج مطلوب'),
    fromWarehouseId: z.string().min(1, 'المخزن المصدر مطلوب'),
    toWarehouseId: z.string().min(1, 'المخزن الوجهة مطلوب'),
    quantity: z.number().positive('الكمية يجب أن تكون موجبة'),
    notes: z.string().optional(),
});

// POST /api/inventory/transfer
export const POST = withAuth(async (request) => {
    try {
        const body = await request.json();

        // Validate
        const { success, errors } = validate(transferSchema, body);
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

        const result = await service.transferStock(body, request);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'تم نقل المخزون بنجاح',
        });
    } catch (error) {
        console.error('Error transferring stock:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'حدث خطأ أثناء نقل المخزون',
            },
            { status: 500 }
        );
    }
}, ['inventory:create']);
