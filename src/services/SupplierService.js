import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class SupplierService {
    constructor(tenantId, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Create supplier
    async createSupplier(data, request = null) {
        const supplier = await this.prisma.supplier.create({
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                category: data.category,
                status: 'active',
                rating: 0,
                totalOrders: 0,
                totalValue: 0,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'Supplier',
            entityId: supplier.id,
            after: supplier,
            request,
        });

        return supplier;
    }

    // Update supplier
    async updateSupplier(id, data, request = null) {
        const existing = await this.prisma.supplier.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Supplier not found');
        }

        const updated = await this.prisma.supplier.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.address !== undefined && { address: data.address }),
                ...(data.category && { category: data.category }),
                ...(data.status && { status: data.status }),
                ...(data.rating !== undefined && { rating: data.rating }),
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Supplier',
            entityId: id,
            before: existing,
            after: updated,
            request,
        });

        return updated;
    }

    // Delete supplier
    async deleteSupplier(id, request = null) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: { purchaseOrders: true },
        });

        if (!supplier) {
            throw new Error('Supplier not found');
        }

        if (supplier.purchaseOrders.length > 0) {
            throw new Error('Cannot delete supplier with existing purchase orders');
        }

        await this.prisma.supplier.delete({
            where: { id },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.DELETE,
            entity: 'Supplier',
            entityId: id,
            before: supplier,
            request,
        });

        return { success: true };
    }

    // Get suppliers with filters
    async getSuppliers(filters = {}) {
        const where = {};

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        if (filters.category && filters.category !== 'all') {
            where.category = filters.category;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.minRating) {
            where.rating = { gte: filters.minRating };
        }

        return await this.prisma.supplier.findMany({
            where,
            include: {
                purchaseOrders: {
                    take: 5,
                    orderBy: { date: 'desc' },
                },
            },
            orderBy: {
                rating: 'desc',
            },
        });
    }

    // Get supplier by ID
    async getSupplierById(id) {
        return await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                purchaseOrders: {
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    // Get supplier statistics
    async getSupplierStats(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                purchaseOrders: true,
            },
        });

        if (!supplier) {
            throw new Error('Supplier not found');
        }

        const totalOrders = supplier.purchaseOrders.length;
        const totalValue = supplier.purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
        const approvedOrders = supplier.purchaseOrders.filter(po => po.status === 'approved').length;
        const pendingOrders = supplier.purchaseOrders.filter(po => po.status === 'pending').length;
        const completedOrders = supplier.purchaseOrders.filter(po => po.status === 'received').length;

        // Calculate on-time delivery rate
        const receivedOrders = supplier.purchaseOrders.filter(po => po.status === 'received');
        const onTimeDeliveries = receivedOrders.filter(po => {
            if (!po.deliveryDate || !po.receivedDate) return false;
            return new Date(po.receivedDate) <= new Date(po.deliveryDate);
        }).length;

        const onTimeRate = receivedOrders.length > 0
            ? (onTimeDeliveries / receivedOrders.length) * 100
            : 0;

        return {
            totalOrders,
            totalValue,
            approvedOrders,
            pendingOrders,
            completedOrders,
            onTimeRate,
            rating: supplier.rating,
        };
    }

    // Get top suppliers
    async getTopSuppliers(limit = 10) {
        return await this.prisma.supplier.findMany({
            where: {
                status: 'active',
            },
            orderBy: [
                { rating: 'desc' },
                { totalValue: 'desc' },
            ],
            take: limit,
            include: {
                purchaseOrders: {
                    take: 1,
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    // Update supplier rating
    async updateRating(id, rating, request = null) {
        const existing = await this.prisma.supplier.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Supplier not found');
        }

        const updated = await this.prisma.supplier.update({
            where: { id },
            data: { rating },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Supplier',
            entityId: id,
            before: existing,
            after: updated,
            metadata: { ratingChange: rating - existing.rating },
            request,
        });

        return updated;
    }
}
