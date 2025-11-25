import { getTenantPrisma } from '@/lib/prisma';
import { TaxCalculator } from '@/domain/rules/TaxCalculator';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class InvoiceService {
    constructor(tenantId, tenantSettings, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.taxCalculator = new TaxCalculator(tenantSettings);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Create invoice
    async createInvoice(data, request = null) {
        // Calculate taxes and final value
        const calculations = this.taxCalculator.calculateInvoiceTotal({
            salesValue: data.salesValue,
            hasDiscount: data.hasDiscount,
            discountAmount: data.discounts || 0,
        });

        // Generate invoice number if not provided
        const invoiceNumber = data.invoiceNumber || await this.generateInvoiceNumber();

        // Create invoice
        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNumber,
                date: new Date(data.date),
                customerId: data.customerId,
                description: data.description,
                salesPerson: data.salesPerson,
                type: data.type,
                salesValue: calculations.salesValue,
                profitTax: calculations.profitTax,
                vat: calculations.vat,
                hasDiscount: data.hasDiscount || false,
                discounts: calculations.discountAmount,
                finalValue: calculations.finalValue,
                balance: calculations.finalValue,
                status: 'pending',
                notes: data.notes || null,
                couponId: data.couponId || null,
            },
            include: {
                customer: true,
                coupon: true,
            },
        });

        // Update customer totals
        await this.prisma.customer.update({
            where: { id: data.customerId },
            data: {
                totalInvoices: { increment: 1 },
                totalValue: { increment: calculations.finalValue },
            },
        });

        // Log audit
        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'Invoice',
            entityId: invoice.id,
            after: invoice,
            request,
        });

        return invoice;
    }

    // Update invoice
    async updateInvoice(id, data, request = null) {
        // Get existing invoice
        const existing = await this.prisma.invoice.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Invoice not found');
        }

        // Recalculate if sales value changed
        let calculations = null;
        if (data.salesValue !== undefined) {
            calculations = this.taxCalculator.calculateInvoiceTotal({
                salesValue: data.salesValue,
                hasDiscount: data.hasDiscount ?? existing.hasDiscount,
                discountAmount: data.discounts ?? existing.discounts,
            });
        }

        // Update invoice
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: {
                ...(data.date && { date: new Date(data.date) }),
                ...(data.description && { description: data.description }),
                ...(data.salesPerson && { salesPerson: data.salesPerson }),
                ...(data.type && { type: data.type }),
                ...(calculations && {
                    salesValue: calculations.salesValue,
                    profitTax: calculations.profitTax,
                    vat: calculations.vat,
                    finalValue: calculations.finalValue,
                    balance: calculations.finalValue - existing.collected,
                }),
                ...(data.hasDiscount !== undefined && { hasDiscount: data.hasDiscount }),
                ...(data.discounts !== undefined && { discounts: data.discounts }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: {
                customer: true,
                coupon: true,
            },
        });

        // Log audit
        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Invoice',
            entityId: id,
            before: existing,
            after: updated,
            request,
        });

        return updated;
    }

    // Record payment
    async recordPayment(id, amount, collectionDate, request = null) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const newCollected = invoice.collected + amount;
        const newBalance = invoice.finalValue - newCollected;
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        const updated = await this.prisma.invoice.update({
            where: { id },
            data: {
                collected: newCollected,
                balance: newBalance,
                status: newStatus,
                collectionDate: new Date(collectionDate),
            },
            include: {
                customer: true,
            },
        });

        // Log audit
        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Invoice',
            entityId: id,
            before: invoice,
            after: updated,
            metadata: { paymentAmount: amount },
            request,
        });

        return updated;
    }

    // Approve invoice
    async approveInvoice(id, request = null) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const updated = await this.prisma.invoice.update({
            where: { id },
            data: {
                approvedBy: this.userId,
                approvedAt: new Date(),
            },
            include: {
                customer: true,
            },
        });

        // Log audit
        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.APPROVE,
            entity: 'Invoice',
            entityId: id,
            before: invoice,
            after: updated,
            request,
        });

        return updated;
    }

    // Delete invoice
    async deleteInvoice(id, request = null) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { customer: true },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Update customer totals
        await this.prisma.customer.update({
            where: { id: invoice.customerId },
            data: {
                totalInvoices: { decrement: 1 },
                totalValue: { decrement: invoice.finalValue },
            },
        });

        // Delete invoice
        await this.prisma.invoice.delete({
            where: { id },
        });

        // Log audit
        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.DELETE,
            entity: 'Invoice',
            entityId: id,
            before: invoice,
            request,
        });

        return { success: true };
    }

    // Get invoices with filters
    async getInvoices(filters = {}) {
        const where = {};

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        if (filters.customerId) {
            where.customerId = filters.customerId;
        }

        if (filters.startDate && filters.endDate) {
            where.date = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        if (filters.search) {
            where.OR = [
                { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await this.prisma.invoice.findMany({
            where,
            include: {
                customer: true,
                coupon: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    // Get invoice statistics
    async getStatistics() {
        const [total, pending, paid, overdue] = await Promise.all([
            this.prisma.invoice.aggregate({
                _sum: { finalValue: true },
                _count: true,
            }),
            this.prisma.invoice.aggregate({
                where: { status: 'pending' },
                _sum: { balance: true },
                _count: true,
            }),
            this.prisma.invoice.aggregate({
                where: { status: 'paid' },
                _sum: { collected: true },
                _count: true,
            }),
            this.prisma.invoice.count({
                where: {
                    status: 'pending',
                    date: {
                        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                    },
                },
            }),
        ]);

        return {
            totalSales: total._sum.finalValue || 0,
            totalInvoices: total._count,
            pendingAmount: pending._sum.balance || 0,
            pendingCount: pending._count,
            collectedAmount: paid._sum.collected || 0,
            paidCount: paid._count,
            overdueCount: overdue,
        };
    }

    // Generate invoice number
    async generateInvoiceNumber() {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: this.tenantId },
            include: { settings: true },
        });

        const prefix = tenant.settings?.invoicePrefix || 'INV';
        const start = tenant.settings?.invoiceNumberStart || 1000;

        const lastInvoice = await this.prisma.invoice.findFirst({
            where: { tenantId: this.tenantId },
            orderBy: { createdAt: 'desc' },
        });

        let nextNumber = start;
        if (lastInvoice) {
            const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(prefix + '-', ''));
            nextNumber = lastNumber + 1;
        }

        return `${prefix}-${nextNumber}`;
    }
}
