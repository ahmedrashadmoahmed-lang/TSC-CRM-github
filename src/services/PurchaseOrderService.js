import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class PurchaseOrderService {
    constructor(tenantId, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Create purchase order
    async createPurchaseOrder(data, request = null) {
        // Generate PO number if not provided
        const poNumber = data.poNumber || await this.generatePONumber();

        // Calculate total amount
        const amount = data.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);

        // Create PO with items
        const po = await this.prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplierId: data.supplierId,
                date: new Date(data.date),
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
                amount,
                status: 'pending',
                notes: data.notes || null,
                items: data.items, // Store as JSON
            },
            include: {
                supplier: true,
            },
        });

        // Update supplier totals
        await this.prisma.supplier.update({
            where: { id: data.supplierId },
            data: {
                totalOrders: { increment: 1 },
                totalValue: { increment: amount },
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'PurchaseOrder',
            entityId: po.id,
            after: po,
            request,
        });

        return po;
    }

    // Update purchase order
    async updatePurchaseOrder(id, data, request = null) {
        const existing = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Purchase order not found');
        }

        if (existing.status === 'received') {
            throw new Error('Cannot update received purchase order');
        }

        // Recalculate amount if items changed
        let amount = existing.amount;
        if (data.items) {
            amount = data.items.reduce((sum, item) => {
                return sum + (item.quantity * item.unitPrice);
            }, 0);
        }

        const updated = await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                ...(data.deliveryDate !== undefined && {
                    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null
                }),
                ...(data.items && { items: data.items, amount }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: {
                supplier: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'PurchaseOrder',
            entityId: id,
            before: existing,
            after: updated,
            request,
        });

        return updated;
    }

    // Approve purchase order
    async approvePurchaseOrder(id, request = null) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!po) {
            throw new Error('Purchase order not found');
        }

        if (po.status !== 'pending') {
            throw new Error('Only pending purchase orders can be approved');
        }

        const updated = await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: 'approved',
                approvedBy: this.userId,
                approvedAt: new Date(),
            },
            include: {
                supplier: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.APPROVE,
            entity: 'PurchaseOrder',
            entityId: id,
            before: po,
            after: updated,
            request,
        });

        return updated;
    }

    // Mark as received
    async markAsReceived(id, receivedDate = null, request = null) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: { supplier: true },
        });

        if (!po) {
            throw new Error('Purchase order not found');
        }

        if (po.status !== 'approved') {
            throw new Error('Only approved purchase orders can be received');
        }

        const updated = await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: 'received',
                receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
            },
            include: {
                supplier: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'PurchaseOrder',
            entityId: id,
            before: po,
            after: updated,
            metadata: { action: 'received' },
            request,
        });

        return updated;
    }

    // Cancel purchase order
    async cancelPurchaseOrder(id, reason, request = null) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!po) {
            throw new Error('Purchase order not found');
        }

        if (po.status === 'received') {
            throw new Error('Cannot cancel received purchase order');
        }

        const updated = await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: 'cancelled',
                notes: po.notes ? `${po.notes}\n\nCancelled: ${reason}` : `Cancelled: ${reason}`,
            },
            include: {
                supplier: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'PurchaseOrder',
            entityId: id,
            before: po,
            after: updated,
            metadata: { action: 'cancelled', reason },
            request,
        });

        return updated;
    }

    // Delete purchase order
    async deletePurchaseOrder(id, request = null) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: { supplier: true },
        });

        if (!po) {
            throw new Error('Purchase order not found');
        }

        if (po.status === 'received') {
            throw new Error('Cannot delete received purchase order');
        }

        // Update supplier totals
        await this.prisma.supplier.update({
            where: { id: po.supplierId },
            data: {
                totalOrders: { decrement: 1 },
                totalValue: { decrement: po.amount },
            },
        });

        await this.prisma.purchaseOrder.delete({
            where: { id },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.DELETE,
            entity: 'PurchaseOrder',
            entityId: id,
            before: po,
            request,
        });

        return { success: true };
    }

    // Get purchase orders with filters
    async getPurchaseOrders(filters = {}) {
        const where = {};

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        if (filters.supplierId) {
            where.supplierId = filters.supplierId;
        }

        if (filters.startDate && filters.endDate) {
            where.date = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        if (filters.search) {
            where.OR = [
                { poNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await this.prisma.purchaseOrder.findMany({
            where,
            include: {
                supplier: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    // Get purchase order statistics
    async getStatistics() {
        const [total, pending, approved, received] = await Promise.all([
            this.prisma.purchaseOrder.aggregate({
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.purchaseOrder.aggregate({
                where: { status: 'pending' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.purchaseOrder.aggregate({
                where: { status: 'approved' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.purchaseOrder.aggregate({
                where: { status: 'received' },
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        return {
            totalValue: total._sum.amount || 0,
            totalOrders: total._count,
            pendingValue: pending._sum.amount || 0,
            pendingCount: pending._count,
            approvedValue: approved._sum.amount || 0,
            approvedCount: approved._count,
            receivedValue: received._sum.amount || 0,
            receivedCount: received._count,
        };
    }

    // Generate PO number
    async generatePONumber() {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: this.tenantId },
            include: { settings: true },
        });

        const prefix = tenant.settings?.poPrefix || 'PO';
        const start = tenant.settings?.poNumberStart || 1000;

        const lastPO = await this.prisma.purchaseOrder.findFirst({
            where: { tenantId: this.tenantId },
            orderBy: { createdAt: 'desc' },
        });

        let nextNumber = start;
        if (lastPO) {
            const lastNumber = parseInt(lastPO.poNumber.replace(prefix + '-', ''));
            nextNumber = lastNumber + 1;
        }

        return `${prefix}-${nextNumber}`;
    }
}
