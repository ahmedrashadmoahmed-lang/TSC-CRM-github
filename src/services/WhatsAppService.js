/**
 * WhatsApp Service
 * Send WhatsApp notifications using Twilio
 */

import twilio from 'twilio';
import logger from '@/lib/logger';

class WhatsAppService {
    constructor() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            this.from = process.env.TWILIO_WHATSAPP_NUMBER;
            this.enabled = true;
        } else {
            this.enabled = false;
            logger.warn('WhatsApp service not configured - missing Twilio credentials');
        }
    }

    /**
     * Send WhatsApp message
     */
    async sendMessage(to, message) {
        if (!this.enabled) {
            logger.warn('WhatsApp service disabled - skipping message');
            return { success: false, error: 'Service not configured' };
        }

        try {
            // Format phone number for WhatsApp
            const whatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const whatsappFrom = this.from.startsWith('whatsapp:') ? this.from : `whatsapp:${this.from}`;

            const result = await this.client.messages.create({
                from: whatsappFrom,
                to: whatsappNumber,
                body: message,
            });

            logger.info('WhatsApp message sent', {
                to,
                sid: result.sid,
                status: result.status,
            });

            return { success: true, sid: result.sid };
        } catch (error) {
            logger.error('Failed to send WhatsApp message', {
                to,
                error: error.message,
            });
            return { success: false, error: error.message };
        }
    }

    /**
     * Send invoice notification
     */
    async sendInvoiceNotification(customer, invoice) {
        const message = `
🧾 *فاتورة جديدة*

عزيزي ${customer.name},

تم إصدار فاتورة جديدة:
📄 رقم الفاتورة: ${invoice.invoiceNumber}
💰 المبلغ الإجمالي: ${invoice.total.toFixed(2)} جنيه
📅 تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}

يمكنك عرض الفاتورة من خلال الرابط:
${process.env.NEXTAUTH_URL}/invoices/${invoice.id}

شكراً لتعاملكم معنا 🙏
    `.trim();

        return this.sendMessage(customer.phone, message);
    }

    /**
     * Send payment reminder
     */
    async sendPaymentReminder(customer, invoice) {
        const daysOverdue = Math.floor(
            (new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
        );

        const message = `
⏰ *تذكير بالدفع*

عزيزي ${customer.name},

${daysOverdue > 0 ? `⚠️ فاتورة متأخرة ${daysOverdue} يوم` : 'نذكركم بوجود فاتورة مستحقة'}

📄 رقم الفاتورة: ${invoice.invoiceNumber}
💰 المبلغ المستحق: ${(invoice.total - invoice.paidAmount).toFixed(2)} جنيه
📅 تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}

نرجو سرعة السداد.

شكراً لتعاونكم 🙏
    `.trim();

        return this.sendMessage(customer.phone, message);
    }

    /**
     * Send payment confirmation
     */
    async sendPaymentConfirmation(customer, invoice, payment) {
        const isPaidFull = invoice.paidAmount >= invoice.total;

        const message = `
✅ *تأكيد الدفع*

عزيزي ${customer.name},

تم استلام دفعتكم بنجاح:
📄 رقم الفاتورة: ${invoice.invoiceNumber}
💰 المبلغ المدفوع: ${payment.amount.toFixed(2)} جنيه
📅 تاريخ الدفع: ${new Date(payment.date).toLocaleDateString('ar-EG')}

${isPaidFull
                ? '✅ تم سداد الفاتورة بالكامل'
                : `المبلغ المتبقي: ${(invoice.total - invoice.paidAmount).toFixed(2)} جنيه`
            }

شكراً لتعاملكم معنا 🙏
    `.trim();

        return this.sendMessage(customer.phone, message);
    }

    /**
     * Send purchase order notification to supplier
     */
    async sendPurchaseOrderNotification(supplier, purchaseOrder) {
        const message = `
📦 *طلب شراء جديد*

عزيزي ${supplier.name},

تم إصدار طلب شراء جديد:
📄 رقم الطلب: ${purchaseOrder.orderNumber}
💰 المبلغ الإجمالي: ${purchaseOrder.total.toFixed(2)} جنيه
📅 التاريخ المتوقع: ${new Date(purchaseOrder.expectedDate).toLocaleDateString('ar-EG')}

يرجى تأكيد الطلب في أقرب وقت.

شكراً لتعاونكم 🙏
    `.trim();

        return this.sendMessage(supplier.phone, message);
    }

    /**
     * Send low stock alert
     */
    async sendLowStockAlert(adminPhone, product) {
        const message = `
⚠️ *تنبيه: مخزون منخفض*

المنتج: ${product.name}
الكود: ${product.sku}
الكمية المتبقية: ${product.quantity} ${product.unit}
حد إعادة الطلب: ${product.reorderPoint}

يرجى إعادة الطلب في أقرب وقت.
    `.trim();

        return this.sendMessage(adminPhone, message);
    }

    /**
     * Send custom message
     */
    async sendCustomMessage(to, title, body) {
        const message = `
*${title}*

${body}

---
${process.env.COMPANY_NAME || 'ERP System'}
    `.trim();

        return this.sendMessage(to, message);
    }
}

const whatsAppService = new WhatsAppService();
export default whatsAppService;
