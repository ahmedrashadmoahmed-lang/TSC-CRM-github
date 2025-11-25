import { z } from 'zod';

// Common schemas
export const emailSchema = z.string().email('البريد الإلكتروني غير صحيح');

export const phoneSchema = z.string().regex(
    /^(010|011|012|015)\d{8}$/,
    'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010, 011, 012, أو 015)'
);

export const dateSchema = z.string().or(z.date());

export const positiveNumberSchema = z.number().positive('يجب أن يكون الرقم موجباً');

export const nonNegativeNumberSchema = z.number().nonnegative('يجب أن يكون الرقم غير سالب');

// Customer validation
export const customerSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100, 'الاسم طويل جداً'),
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.optional().or(z.literal('')),
    address: z.string().max(500, 'العنوان طويل جداً').optional(),
    type: z.enum(['corporate', 'individual', 'government'], {
        errorMap: () => ({ message: 'نوع العميل غير صحيح' }),
    }),
    status: z.enum(['active', 'inactive']).optional(),
});

// Invoice validation
export const invoiceSchema = z.object({
    invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب').optional(),
    date: dateSchema,
    customerId: z.string().min(1, 'العميل مطلوب'),
    description: z.string().min(5, 'الوصف يجب أن يكون 5 أحرف على الأقل'),
    salesPerson: z.string().min(2, 'اسم مندوب المبيعات مطلوب'),
    type: z.enum(['sales', 'service'], {
        errorMap: () => ({ message: 'نوع الفاتورة غير صحيح' }),
    }),
    salesValue: positiveNumberSchema,
    hasDiscount: z.boolean().optional(),
    discounts: nonNegativeNumberSchema.optional(),
    notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
    couponId: z.string().optional(),
});

// Payment validation
export const paymentSchema = z.object({
    invoiceId: z.string().min(1, 'الفاتورة مطلوبة'),
    amount: positiveNumberSchema,
    collectionDate: dateSchema,
    notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
});

// Product validation
export const productSchema = z.object({
    name: z.string().min(2, 'اسم المنتج يجب أن يكون حرفين على الأقل'),
    sku: z.string().min(1, 'رمز المنتج مطلوب'),
    category: z.string().min(1, 'الفئة مطلوبة'),
    cost: positiveNumberSchema,
    price: positiveNumberSchema,
    minStock: nonNegativeNumberSchema,
    description: z.string().max(1000, 'الوصف طويل جداً').optional(),
    status: z.enum(['active', 'inactive']).optional(),
});

// Supplier validation
export const supplierSchema = z.object({
    name: z.string().min(2, 'اسم المورد يجب أن يكون حرفين على الأقل'),
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.optional().or(z.literal('')),
    address: z.string().max(500, 'العنوان طويل جداً').optional(),
    category: z.string().min(1, 'الفئة مطلوبة'),
    status: z.enum(['active', 'inactive']).optional(),
});

// Purchase Order validation
export const purchaseOrderSchema = z.object({
    poNumber: z.string().min(1, 'رقم أمر الشراء مطلوب').optional(),
    supplierId: z.string().min(1, 'المورد مطلوب'),
    date: dateSchema,
    deliveryDate: dateSchema.optional(),
    items: z.array(z.object({
        productId: z.string().min(1, 'المنتج مطلوب'),
        quantity: positiveNumberSchema,
        unitPrice: positiveNumberSchema,
    })).min(1, 'يجب إضافة منتج واحد على الأقل'),
    notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
});

// Inventory Movement validation
export const inventoryMovementSchema = z.object({
    productId: z.string().min(1, 'المنتج مطلوب'),
    warehouseId: z.string().min(1, 'المخزن مطلوب'),
    type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'], {
        errorMap: () => ({ message: 'نوع الحركة غير صحيح' }),
    }),
    quantity: positiveNumberSchema,
    unitCost: positiveNumberSchema.optional(),
    referenceType: z.string().optional(),
    referenceId: z.string().optional(),
    referenceNumber: z.string().optional(),
    notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
});

// Stock Transfer validation
export const stockTransferSchema = z.object({
    productId: z.string().min(1, 'المنتج مطلوب'),
    fromWarehouseId: z.string().min(1, 'المخزن المصدر مطلوب'),
    toWarehouseId: z.string().min(1, 'المخزن الوجهة مطلوب'),
    quantity: positiveNumberSchema,
    notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
}).refine(data => data.fromWarehouseId !== data.toWarehouseId, {
    message: 'لا يمكن النقل إلى نفس المخزن',
    path: ['toWarehouseId'],
});

// Employee validation
export const employeeSchema = z.object({
    name: z.string().min(2, 'اسم الموظف يجب أن يكون حرفين على الأقل'),
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.optional().or(z.literal('')),
    position: z.string().min(1, 'المسمى الوظيفي مطلوب'),
    department: z.string().min(1, 'القسم مطلوب'),
    salary: positiveNumberSchema,
    hireDate: dateSchema,
    status: z.enum(['active', 'inactive']).optional(),
});

// User validation
export const userSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: emailSchema,
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    roleIds: z.array(z.string()).min(1, 'يجب اختيار دور واحد على الأقل'),
});

// Login validation
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// Journal Entry validation
export const journalEntrySchema = z.object({
    date: dateSchema,
    description: z.string().min(5, 'الوصف يجب أن يكون 5 أحرف على الأقل'),
    sourceType: z.string().optional(),
    sourceId: z.string().optional(),
    transactions: z.array(z.object({
        accountId: z.string().min(1, 'الحساب مطلوب'),
        type: z.enum(['debit', 'credit'], {
            errorMap: () => ({ message: 'نوع المعاملة غير صحيح' }),
        }),
        amount: positiveNumberSchema,
        description: z.string().max(500, 'الوصف طويل جداً').optional(),
    })).min(2, 'يجب إضافة معاملتين على الأقل'),
}).refine(data => {
    const debits = data.transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    const credits = data.transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    return Math.abs(debits - credits) < 0.01;
}, {
    message: 'القيد غير متوازن - يجب أن تتساوى المدينة والدائنة',
    path: ['transactions'],
});

// Warehouse validation
export const warehouseSchema = z.object({
    name: z.string().min(2, 'اسم المخزن يجب أن يكون حرفين على الأقل'),
    code: z.string().min(1, 'رمز المخزن مطلوب'),
    location: z.string().max(500, 'الموقع طويل جداً').optional(),
    isActive: z.boolean().optional(),
});

// Validation helper function
export function validate(schema, data) {
    try {
        return {
            success: true,
            data: schema.parse(data),
            errors: null,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = {};
            error.errors.forEach(err => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });

            return {
                success: false,
                data: null,
                errors,
            };
        }

        return {
            success: false,
            data: null,
            errors: { _general: 'حدث خطأ في التحقق من البيانات' },
        };
    }
}

// Async validation helper
export async function validateAsync(schema, data) {
    try {
        const result = await schema.parseAsync(data);
        return {
            success: true,
            data: result,
            errors: null,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = {};
            error.errors.forEach(err => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });

            return {
                success: false,
                data: null,
                errors,
            };
        }

        return {
            success: false,
            data: null,
            errors: { _general: 'حدث خطأ في التحقق من البيانات' },
        };
    }
}
