/**
 * Input Validation Schemas using Zod
 * Validates and sanitizes all user inputs
 */

import { z } from 'zod';

// ============================================
// RFQ Schemas
// ============================================

export const rfqItemSchema = z.object({
    productName: z.string().min(1, 'Product name is required').max(200),
    description: z.string().max(2000).optional(),
    quantity: z.number().int().positive('Quantity must be positive'),
    unit: z.string().max(50).default('pcs'),
    specifications: z.string().max(5000).optional(),
    technicalSpecs: z.string().max(5000).optional(),
});

export const rfqSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(2000).optional(),
    budget: z.number().positive().optional(),
    currency: z.enum(['EGP', 'USD', 'EUR']).default('EGP'),
    deadline: z.string().datetime().optional(),
    items: z.array(rfqItemSchema).min(1, 'At least one item is required'),
    priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const rfqUpdateSchema = rfqSchema.partial();

export const rfqApprovalSchema = z.object({
    approved: z.boolean(),
    comment: z.string().max(1000).optional(),
});

// ============================================
// Invoice Schemas
// ============================================

export const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Description is required').max(500),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    taxRate: z.number().min(0).max(100).default(0),
});

export const invoiceSchema = z.object({
    invoiceNumber: z.string().regex(/^INV-\d{4}-\d+$/, 'Invalid invoice number format'),
    customerId: z.string().cuid('Invalid customer ID'),
    issueDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    notes: z.string().max(2000).optional(),
    currency: z.enum(['EGP', 'USD', 'EUR']).default('EGP'),
});

export const invoiceUpdateSchema = invoiceSchema.partial().omit({ invoiceNumber: true });

// ============================================
// Purchase Order Schemas
// ============================================

export const poItemSchema = z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
});

export const purchaseOrderSchema = z.object({
    orderNumber: z.string().regex(/^PO-\d{4}-\d+$/, 'Invalid PO number format'),
    supplierId: z.string().cuid('Invalid supplier ID'),
    items: z.array(poItemSchema).min(1),
    deliveryDate: z.string().datetime(),
    paymentTerms: z.string().max(200),
    notes: z.string().max(2000).optional(),
    currency: z.enum(['EGP', 'USD', 'EUR']).default('EGP'),
});

export const poUpdateSchema = purchaseOrderSchema.partial().omit({ orderNumber: true });

// ============================================
// User Schemas
// ============================================

export const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']),
    tenantId: z.string().cuid().optional(),
});

export const userUpdateSchema = userSchema.partial().omit({ password: true });

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// ============================================
// Customer/Supplier Schemas
// ============================================

export const customerSchema = z.object({
    name: z.string().min(2).max(200),
    email: z.string().email().optional(),
    phone: z.string().max(50).optional(),
    address: z.string().max(500).optional(),
    type: z.enum(['INDIVIDUAL', 'CORPORATE']).default('INDIVIDUAL'),
    taxNumber: z.string().max(50).optional(),
});

export const supplierSchema = z.object({
    name: z.string().min(2).max(200),
    email: z.string().email(),
    phone: z.string().max(50),
    address: z.string().max(500).optional(),
    verified: z.boolean().default(false),
    rating: z.number().min(0).max(5).optional(),
    categories: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
});

// ============================================
// Product Schemas
// ============================================

export const productSchema = z.object({
    name: z.string().min(1).max(200),
    sku: z.string().max(100).optional(),
    description: z.string().max(2000).optional(),
    category: z.string().max(100).optional(),
    price: z.number().positive().optional(),
    cost: z.number().positive().optional(),
    quantity: z.number().int().min(0).default(0),
    unit: z.string().max(50).default('pcs'),
    reorderLevel: z.number().int().min(0).optional(),
});

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate input data against a schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {{success: boolean, data?: any, errors?: Array}}
 */
export function validateInput(schema, data) {
    try {
        const validated = schema.parse(data);
        return {
            success: true,
            data: validated,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                    code: e.code,
                })),
            };
        }
        return {
            success: false,
            errors: [{ message: 'Validation failed' }],
        };
    }
}

/**
 * Validate input data and return validated data or throw error
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {any} Validated data
 * @throws {Error} If validation fails
 */
export function validateOrThrow(schema, data) {
    const result = validateInput(schema, data);
    if (!result.success) {
        const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
    }
    return result.data;
}

/**
 * Sanitize string input (remove dangerous characters)
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') return input;

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove script tags content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Sanitize object recursively
 * @param {any} obj - Object to sanitize
 * @returns {any} Sanitized object
 */
export function sanitizeObject(obj) {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }

    return obj;
}
