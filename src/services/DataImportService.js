/**
 * Data Import Service
 * Import historical data from Excel/CSV files
 */

import XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { z } from 'zod';

class DataImportService {
    /**
     * Import data from Excel file
     */
    async importFromExcel(filePath, tenantId, dataType) {
        try {
            // Read Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            logger.info('Excel file read', {
                rows: data.length,
                type: dataType,
                sheet: sheetName,
            });

            // Import based on type
            let result;
            switch (dataType) {
                case 'customers':
                    result = await this.importCustomers(data, tenantId);
                    break;
                case 'products':
                    result = await this.importProducts(data, tenantId);
                    break;
                case 'invoices':
                    result = await this.importInvoices(data, tenantId);
                    break;
                case 'suppliers':
                    result = await this.importSuppliers(data, tenantId);
                    break;
                default:
                    throw new Error(`Unknown data type: ${dataType}`);
            }

            logger.info('Import completed', {
                type: dataType,
                imported: result.imported,
                errors: result.errors,
            });

            return result;
        } catch (error) {
            logger.error('Import failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Import customers
     */
    async importCustomers(data, tenantId) {
        const imported = [];
        const errors = [];

        const customerSchema = z.object({
            name: z.string().min(1),
            email: z.string().email().optional().nullable(),
            phone: z.string().optional().nullable(),
            address: z.string().optional().nullable(),
            taxNumber: z.string().optional().nullable(),
        });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Map Arabic/English column names
                const customerData = {
                    name: row.name || row['اسم العميل'] || row['الاسم'],
                    email: row.email || row['البريد الإلكتروني'] || row['الايميل'],
                    phone: row.phone || row['الهاتف'] || row['رقم الهاتف'],
                    address: row.address || row['العنوان'],
                    taxNumber: row.taxNumber || row['الرقم الضريبي'] || row['رقم ضريبي'],
                };

                // Validate
                const validated = customerSchema.parse(customerData);

                // Create customer
                const customer = await prisma.customer.create({
                    data: {
                        ...validated,
                        status: 'active',
                        tenantId,
                    },
                });

                imported.push(customer);
            } catch (error) {
                errors.push({
                    row: i + 2, // Excel row number (1-indexed + header)
                    data: row,
                    error: error.message,
                });
            }
        }

        return {
            success: true,
            imported: imported.length,
            errors: errors.length,
            details: { imported, errors },
        };
    }

    /**
     * Import products
     */
    async importProducts(data, tenantId) {
        const imported = [];
        const errors = [];

        const productSchema = z.object({
            name: z.string().min(1),
            sku: z.string().min(1),
            description: z.string().optional().nullable(),
            category: z.string().optional().nullable(),
            price: z.number().positive(),
            cost: z.number().positive(),
            quantity: z.number().int().min(0).default(0),
            unit: z.string().default('unit'),
            reorderPoint: z.number().int().min(0).default(10),
        });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const productData = {
                    name: row.name || row['اسم المنتج'] || row['الاسم'],
                    sku: row.sku || row['الكود'] || row['كود المنتج'],
                    description: row.description || row['الوصف'],
                    category: row.category || row['الفئة'] || row['التصنيف'],
                    price: parseFloat(row.price || row['السعر'] || row['سعر البيع']),
                    cost: parseFloat(row.cost || row['التكلفة'] || row['سعر الشراء']),
                    quantity: parseInt(row.quantity || row['الكمية'] || row['المخزون']) || 0,
                    unit: row.unit || row['الوحدة'] || 'unit',
                    reorderPoint: parseInt(row.reorderPoint || row['حد إعادة الطلب']) || 10,
                };

                const validated = productSchema.parse(productData);

                const product = await prisma.product.create({
                    data: {
                        ...validated,
                        status: 'active',
                        tenantId,
                    },
                });

                imported.push(product);
            } catch (error) {
                errors.push({
                    row: i + 2,
                    data: row,
                    error: error.message,
                });
            }
        }

        return {
            success: true,
            imported: imported.length,
            errors: errors.length,
            details: { imported, errors },
        };
    }

    /**
     * Import suppliers
     */
    async importSuppliers(data, tenantId) {
        const imported = [];
        const errors = [];

        const supplierSchema = z.object({
            name: z.string().min(1),
            email: z.string().email().optional().nullable(),
            phone: z.string().optional().nullable(),
            address: z.string().optional().nullable(),
            taxNumber: z.string().optional().nullable(),
            rating: z.number().min(0).max(5).optional().nullable(),
            onTimeDelivery: z.number().min(0).max(100).optional().nullable(),
        });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const supplierData = {
                    name: row.name || row['اسم المورد'] || row['الاسم'],
                    email: row.email || row['البريد الإلكتروني'],
                    phone: row.phone || row['الهاتف'],
                    address: row.address || row['العنوان'],
                    taxNumber: row.taxNumber || row['الرقم الضريبي'],
                    rating: row.rating ? parseFloat(row.rating) : null,
                    onTimeDelivery: row.onTimeDelivery ? parseFloat(row.onTimeDelivery) : null,
                };

                const validated = supplierSchema.parse(supplierData);

                const supplier = await prisma.supplier.create({
                    data: {
                        ...validated,
                        status: 'active',
                        tenantId,
                    },
                });

                imported.push(supplier);
            } catch (error) {
                errors.push({
                    row: i + 2,
                    data: row,
                    error: error.message,
                });
            }
        }

        return {
            success: true,
            imported: imported.length,
            errors: errors.length,
            details: { imported, errors },
        };
    }

    /**
     * Import invoices (simplified - requires existing customers)
     */
    async importInvoices(data, tenantId) {
        const imported = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Find customer by name or create new one
                const customerName = row.customerName || row['اسم العميل'];
                let customer = await prisma.customer.findFirst({
                    where: {
                        name: customerName,
                        tenantId,
                    },
                });

                if (!customer) {
                    // Create customer if not exists
                    customer = await prisma.customer.create({
                        data: {
                            name: customerName,
                            email: row.customerEmail || row['بريد العميل'],
                            phone: row.customerPhone || row['هاتف العميل'],
                            status: 'active',
                            tenantId,
                        },
                    });
                }

                // Create invoice
                const invoice = await prisma.invoice.create({
                    data: {
                        invoiceNumber: row.invoiceNumber || row['رقم الفاتورة'] || `INV-${Date.now()}-${i}`,
                        customerId: customer.id,
                        issueDate: new Date(row.issueDate || row['التاريخ'] || row['تاريخ الإصدار']),
                        dueDate: new Date(row.dueDate || row['تاريخ الاستحقاق'] || Date.now() + 30 * 24 * 60 * 60 * 1000),
                        subtotal: parseFloat(row.subtotal || row['المجموع الفرعي'] || 0),
                        tax: parseFloat(row.tax || row['الضريبة'] || 0),
                        discount: parseFloat(row.discount || row['الخصم'] || 0),
                        total: parseFloat(row.total || row['الإجمالي'] || 0),
                        paidAmount: parseFloat(row.paidAmount || row['المدفوع'] || 0),
                        status: row.status || row['الحالة'] || 'draft',
                        notes: row.notes || row['ملاحظات'],
                        tenantId,
                    },
                });

                imported.push(invoice);
            } catch (error) {
                errors.push({
                    row: i + 2,
                    data: row,
                    error: error.message,
                });
            }
        }

        return {
            success: true,
            imported: imported.length,
            errors: errors.length,
            details: { imported, errors },
        };
    }

    /**
     * Generate import template
     */
    generateTemplate(dataType) {
        const templates = {
            customers: [
                {
                    'اسم العميل': 'محمد أحمد',
                    'البريد الإلكتروني': 'mohamed@example.com',
                    'الهاتف': '01012345678',
                    'العنوان': 'القاهرة، مصر',
                    'الرقم الضريبي': '123456789',
                },
            ],
            products: [
                {
                    'اسم المنتج': 'منتج تجريبي',
                    'الكود': 'PROD-001',
                    'الوصف': 'وصف المنتج',
                    'الفئة': 'إلكترونيات',
                    'السعر': 100,
                    'التكلفة': 50,
                    'الكمية': 10,
                    'الوحدة': 'قطعة',
                    'حد إعادة الطلب': 5,
                },
            ],
            suppliers: [
                {
                    'اسم المورد': 'شركة ABC',
                    'البريد الإلكتروني': 'supplier@example.com',
                    'الهاتف': '01012345678',
                    'العنوان': 'القاهرة، مصر',
                    'الرقم الضريبي': '123456789',
                },
            ],
            invoices: [
                {
                    'رقم الفاتورة': 'INV-001',
                    'اسم العميل': 'محمد أحمد',
                    'التاريخ': '2024-01-01',
                    'تاريخ الاستحقاق': '2024-01-31',
                    'المجموع الفرعي': 100,
                    'الضريبة': 14,
                    'الخصم': 0,
                    'الإجمالي': 114,
                    'المدفوع': 0,
                    'الحالة': 'draft',
                },
            ],
        };

        const template = templates[dataType];
        if (!template) {
            throw new Error(`Unknown data type: ${dataType}`);
        }

        // Create workbook
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, dataType);

        // Generate buffer
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    /**
     * Validate import file
     */
    async validateImportFile(filePath, dataType) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                return {
                    valid: false,
                    error: 'File is empty',
                };
            }

            // Check required columns based on type
            const requiredColumns = {
                customers: ['name', 'اسم العميل'],
                products: ['name', 'sku', 'اسم المنتج', 'الكود'],
                suppliers: ['name', 'اسم المورد'],
                invoices: ['invoiceNumber', 'customerName', 'رقم الفاتورة', 'اسم العميل'],
            };

            const required = requiredColumns[dataType];
            const firstRow = data[0];
            const hasRequiredColumn = required.some(col => col in firstRow);

            if (!hasRequiredColumn) {
                return {
                    valid: false,
                    error: `Missing required columns. Expected one of: ${required.join(', ')}`,
                };
            }

            return {
                valid: true,
                rowCount: data.length,
                columns: Object.keys(firstRow),
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message,
            };
        }
    }
}

export default new DataImportService();
