import { getTenantPrisma } from '@/lib/prisma';

export class NotificationService {
    constructor(tenantId) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
    }

    // Create notification
    async createNotification(data) {
        return await this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type, // info, success, warning, error
                title: data.title,
                message: data.message,
                link: data.link || null,
                linkText: data.linkText || null,
            },
        });
    }

    // Create notifications for multiple users
    async createBulkNotifications(userIds, data) {
        const notifications = userIds.map(userId => ({
            tenantId: this.tenantId,
            userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link || null,
            linkText: data.linkText || null,
        }));

        return await this.prisma.notification.createMany({
            data: notifications,
        });
    }

    // Get user notifications
    async getUserNotifications(userId, options = {}) {
        const { unreadOnly = false, limit = 50 } = options;

        const where = { userId };
        if (unreadOnly) {
            where.read = false;
        }

        return await this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // Mark as read
    async markAsRead(id) {
        return await this.prisma.notification.update({
            where: { id },
            data: {
                read: true,
                readAt: new Date(),
            },
        });
    }

    // Mark all as read for user
    async markAllAsRead(userId) {
        return await this.prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
                readAt: new Date(),
            },
        });
    }

    // Delete notification
    async deleteNotification(id) {
        return await this.prisma.notification.delete({
            where: { id },
        });
    }

    // Get unread count
    async getUnreadCount(userId) {
        return await this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    // System notifications
    async notifyLowStock(productId, warehouseId, currentStock, minStock) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id: warehouseId },
        });

        // Get all users with warehouse role
        const users = await this.prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: { in: ['admin', 'warehouse'] },
                        },
                    },
                },
            },
        });

        await this.createBulkNotifications(
            users.map(u => u.id),
            {
                type: 'warning',
                title: 'تنبيه مخزون منخفض',
                message: `المنتج "${product.name}" في مخزن "${warehouse.name}" وصل إلى ${currentStock} (الحد الأدنى: ${minStock})`,
                link: `/inventory?product=${productId}`,
                linkText: 'عرض المخزون',
            }
        );
    }

    async notifyInvoiceApproved(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { customer: true },
        });

        // Notify sales team
        const users = await this.prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: { in: ['admin', 'sales'] },
                        },
                    },
                },
            },
        });

        await this.createBulkNotifications(
            users.map(u => u.id),
            {
                type: 'success',
                title: 'تم اعتماد فاتورة',
                message: `تم اعتماد الفاتورة ${invoice.invoiceNumber} للعميل ${invoice.customer.name}`,
                link: `/invoicing?id=${invoiceId}`,
                linkText: 'عرض الفاتورة',
            }
        );
    }

    async notifyPOApprovalNeeded(poId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: poId },
            include: { supplier: true },
        });

        // Notify managers
        const users = await this.prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: { in: ['admin', 'manager'] },
                        },
                    },
                },
            },
        });

        await this.createBulkNotifications(
            users.map(u => u.id),
            {
                type: 'info',
                title: 'أمر شراء يحتاج اعتماد',
                message: `أمر الشراء ${po.poNumber} من المورد ${po.supplier.name} بقيمة ${po.amount} يحتاج اعتماد`,
                link: `/po?id=${poId}`,
                linkText: 'مراجعة الأمر',
            }
        );
    }
}
