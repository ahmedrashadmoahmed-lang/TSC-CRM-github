import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class CustomerService {
    constructor(tenantId, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Create customer
    async createCustomer(data, request = null) {
        const customer = await this.prisma.customer.create({
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                type: data.type,
                status: 'active',
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'Customer',
            entityId: customer.id,
            after: customer,
            request,
        });

        return customer;
    }

    // Update customer
    async updateCustomer(id, data, request = null) {
        const existing = await this.prisma.customer.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Customer not found');
        }

        const updated = await this.prisma.customer.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.address !== undefined && { address: data.address }),
                ...(data.type && { type: data.type }),
                ...(data.status && { status: data.status }),
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Customer',
            entityId: id,
            before: existing,
            after: updated,
            request,
        });

        return updated;
    }

    // Delete customer
    async deleteCustomer(id, request = null) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { invoices: true },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        if (customer.invoices.length > 0) {
            throw new Error('Cannot delete customer with existing invoices');
        }

        await this.prisma.customer.delete({
            where: { id },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.DELETE,
            entity: 'Customer',
            entityId: id,
            before: customer,
            request,
        });

        return { success: true };
    }

    // Get customers with filters
    async getCustomers(filters = {}) {
        const where = {};

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        if (filters.type && filters.type !== 'all') {
            where.type = filters.type;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await this.prisma.customer.findMany({
            where,
            include: {
                invoices: {
                    take: 5,
                    orderBy: { date: 'desc' },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // Get customer by ID
    async getCustomerById(id) {
        return await this.prisma.customer.findUnique({
            where: { id },
            include: {
                invoices: {
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    // Get customer statistics
    async getCustomerStats(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                invoices: true,
            },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        const totalInvoices = customer.invoices.length;
        const totalValue = customer.invoices.reduce((sum, inv) => sum + inv.finalValue, 0);
        const totalPaid = customer.invoices.reduce((sum, inv) => sum + inv.collected, 0);
        const totalPending = customer.invoices.reduce((sum, inv) => sum + inv.balance, 0);
        const paidInvoices = customer.invoices.filter(inv => inv.status === 'paid').length;
        const pendingInvoices = customer.invoices.filter(inv => inv.status === 'pending').length;

        return {
            totalInvoices,
            totalValue,
            totalPaid,
            totalPending,
            paidInvoices,
            pendingInvoices,
            paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
        };
    }

    // Get top customers
    async getTopCustomers(limit = 10) {
        return await this.prisma.customer.findMany({
            where: {
                status: 'active',
            },
            orderBy: {
                totalValue: 'desc',
            },
            take: limit,
            include: {
                invoices: {
                    take: 1,
                    orderBy: { date: 'desc' },
                },
            },
        });
    }
}
