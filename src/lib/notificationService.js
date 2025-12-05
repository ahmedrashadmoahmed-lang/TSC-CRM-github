// Notification Service for Custom Alerts
import { prisma } from '@/lib/prisma';

class NotificationService {
    constructor() {
        this.channels = {
            inApp: this.sendInAppNotification.bind(this),
            email: this.sendEmailNotification.bind(this),
            slack: this.sendSlackNotification.bind(this),
            sms: this.sendSMSNotification.bind(this)
        };
    }

    /**
     * Evaluate alert conditions and trigger notifications
     */
    async evaluateAlerts() {
        try {
            // Get all active alerts
            const alerts = await prisma.customAlert.findMany({
                where: { isActive: true }
            });

            for (const alert of alerts) {
                const shouldTrigger = await this.checkCondition(alert);

                if (shouldTrigger) {
                    await this.triggerAlert(alert);
                }
            }
        } catch (error) {
            console.error('Error evaluating alerts:', error);
        }
    }

    /**
     * Check if alert condition is met
     */
    async checkCondition(alert) {
        const { metric, operator, threshold } = alert;

        try {
            const currentValue = await this.getMetricValue(metric);

            switch (operator) {
                case 'greater_than':
                    return currentValue > threshold;
                case 'less_than':
                    return currentValue < threshold;
                case 'equals':
                    return currentValue === threshold;
                case 'not_equals':
                    return currentValue !== threshold;
                default:
                    return false;
            }
        } catch (error) {
            console.error(`Error checking condition for alert ${alert.id}:`, error);
            return false;
        }
    }

    /**
     * Get current value for a metric
     */
    async getMetricValue(metric) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        switch (metric) {
            case 'revenue':
                const revenue = await prisma.invoice.aggregate({
                    where: {
                        status: 'paid',
                        issueDate: { gte: startOfMonth }
                    },
                    _sum: { total: true }
                });
                return revenue._sum.total || 0;

            case 'new_leads':
                const leads = await prisma.opportunity.count({
                    where: {
                        stage: 'lead',
                        createdAt: { gte: startOfMonth }
                    }
                });
                return leads;

            case 'conversion_rate':
                const totalOpps = await prisma.opportunity.count({
                    where: { createdAt: { gte: startOfMonth } }
                });
                const wonOpps = await prisma.opportunity.count({
                    where: {
                        stage: 'won',
                        createdAt: { gte: startOfMonth }
                    }
                });
                return totalOpps > 0 ? (wonOpps / totalOpps) * 100 : 0;

            case 'overdue_invoices':
                const overdue = await prisma.invoice.count({
                    where: {
                        status: { not: 'paid' },
                        dueDate: { lt: now }
                    }
                });
                return overdue;

            case 'low_stock':
                const lowStock = await prisma.product.count({
                    where: {
                        quantity: { lte: prisma.product.fields.reorderPoint }
                    }
                });
                return lowStock;

            default:
                return 0;
        }
    }

    /**
     * Trigger alert and send notifications
     */
    async triggerAlert(alert) {
        try {
            const currentValue = await this.getMetricValue(alert.metric);

            // Create notification payload
            const notification = {
                id: `alert-${alert.id}-${Date.now()}`,
                alertId: alert.id,
                title: alert.name,
                message: `${this.getMetricLabel(alert.metric)}: ${currentValue} ${this.getMetricUnit(alert.metric)}`,
                type: this.getAlertType(alert.priority),
                priority: alert.priority,
                timestamp: new Date().toISOString(),
                details: {
                    'القيمة الحالية': `${currentValue} ${this.getMetricUnit(alert.metric)}`,
                    'الحد المحدد': `${alert.threshold} ${this.getMetricUnit(alert.metric)}`,
                    'الشرط': this.getOperatorLabel(alert.operator)
                },
                actions: [
                    { label: 'عرض التفاصيل', action: 'view_details' },
                    { label: 'إيقاف التنبيه', action: 'disable_alert' }
                ]
            };

            // Send to selected channels
            const channels = alert.channels || ['inApp'];
            for (const channel of channels) {
                if (this.channels[channel]) {
                    await this.channels[channel](notification, alert);
                }
            }

            // Log alert trigger
            await this.logAlertHistory(alert.id, notification);

        } catch (error) {
            console.error(`Error triggering alert ${alert.id}:`, error);
        }
    }

    /**
     * Send in-app notification
     */
    async sendInAppNotification(notification, alert) {
        // Store in database for in-app display
        await prisma.notification.create({
            data: {
                userId: alert.userId,
                tenantId: alert.tenantId,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                read: false
            }
        });
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(notification, alert) {
        // TODO: Implement email sending
        // This would integrate with services like SendGrid, AWS SES, etc.
        console.log('Email notification:', notification);
    }

    /**
     * Send Slack notification
     */
    async sendSlackNotification(notification, alert) {
        if (!process.env.SLACK_WEBHOOK_URL) {
            console.warn('Slack webhook URL not configured');
            return;
        }

        try {
            const slackMessage = {
                text: `🔔 ${notification.title}`,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: notification.title
                        }
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: notification.message
                        }
                    },
                    {
                        type: 'section',
                        fields: Object.entries(notification.details).map(([key, value]) => ({
                            type: 'mrkdwn',
                            text: `*${key}:*\n${value}`
                        }))
                    }
                ]
            };

            await fetch(process.env.SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slackMessage)
            });
        } catch (error) {
            console.error('Error sending Slack notification:', error);
        }
    }

    /**
     * Send SMS notification
     */
    async sendSMSNotification(notification, alert) {
        // TODO: Implement SMS sending
        // This would integrate with services like Twilio, AWS SNS, etc.
        console.log('SMS notification:', notification);
    }

    /**
     * Log alert history
     */
    async logAlertHistory(alertId, notification) {
        // TODO: Create AlertHistory table and log
        console.log(`Alert ${alertId} triggered:`, notification);
    }

    // Helper methods
    getMetricLabel(metric) {
        const labels = {
            revenue: 'الإيرادات',
            new_leads: 'العملاء الجدد',
            conversion_rate: 'معدل التحويل',
            overdue_invoices: 'الفواتير المتأخرة',
            low_stock: 'المنتجات منخفضة المخزون'
        };
        return labels[metric] || metric;
    }

    getMetricUnit(metric) {
        const units = {
            revenue: 'ج.م',
            new_leads: 'عميل',
            conversion_rate: '%',
            overdue_invoices: 'فاتورة',
            low_stock: 'منتج'
        };
        return units[metric] || '';
    }

    getOperatorLabel(operator) {
        const labels = {
            greater_than: 'أكبر من',
            less_than: 'أقل من',
            equals: 'يساوي',
            not_equals: 'لا يساوي'
        };
        return labels[operator] || operator;
    }

    getAlertType(priority) {
        const types = {
            urgent: 'error',
            high: 'warning',
            medium: 'info',
            low: 'success'
        };
        return types[priority] || 'info';
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export for cron job or scheduled tasks
export async function evaluateAllAlerts() {
    await notificationService.evaluateAlerts();
}

