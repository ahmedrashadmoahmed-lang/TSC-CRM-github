/**
 * Email Service
 * Send emails using Nodemailer
 */

import nodemailer from 'nodemailer';
import logger from '@/lib/logger';

class EmailService {
    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
            this.enabled = true;
        } else {
            this.enabled = false;
            logger.warn('Email service not configured - missing SMTP credentials');
        }
    }

    /**
     * Send email
     */
    async sendEmail({ to, subject, html, text, attachments = [] }) {
        if (!this.enabled) {
            logger.warn('Email service disabled - skipping email');
            return { success: false, error: 'Service not configured' };
        }

        try {
            const result = await this.transporter.sendMail({
                from: `"${process.env.COMPANY_NAME || 'ERP System'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text,
                attachments,
            });

            logger.info('Email sent', {
                to,
                subject,
                messageId: result.messageId,
            });

            return { success: true, messageId: result.messageId };
        } catch (error) {
            logger.error('Failed to send email', {
                to,
                subject,
                error: error.message,
            });
            return { success: false, error: error.message };
        }
    }

    /**
     * Send invoice email
     */
    async sendInvoiceEmail(customer, invoice, pdfBuffer = null) {
        const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .invoice-details {
            background: #f7fafc;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-right: 4px solid #667eea;
          }
          .invoice-details p {
            margin: 10px 0;
            line-height: 1.6;
          }
          .invoice-details strong {
            color: #2d3748;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f7fafc;
            color: #718096;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 فاتورة جديدة</h1>
          </div>
          <div class="content">
            <p>عزيزي <strong>${customer.name}</strong>,</p>
            <p>نرسل لكم فاتورة جديدة من ${process.env.COMPANY_NAME || 'شركتنا'}:</p>
            
            <div class="invoice-details">
              <p><strong>📄 رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>📅 تاريخ الإصدار:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-EG')}</p>
              <p><strong>📅 تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>
              <p><strong>💰 المبلغ الإجمالي:</strong> ${invoice.total.toFixed(2)} جنيه</p>
              <p><strong>📊 الحالة:</strong> ${this.getStatusLabel(invoice.status)}</p>
            </div>

            ${pdfBuffer ? '<p>الفاتورة مرفقة بهذا البريد الإلكتروني كملف PDF.</p>' : ''}
            
            <p>يمكنك أيضاً عرض الفاتورة من خلال الرابط التالي:</p>
            <center>
              <a href="${process.env.NEXTAUTH_URL}/invoices/${invoice.id}" class="button">
                عرض الفاتورة
              </a>
            </center>

            <p>في حالة وجود أي استفسار، يرجى التواصل معنا.</p>
          </div>
          <div class="footer">
            <p><strong>${process.env.COMPANY_NAME || 'ERP System'}</strong></p>
            <p>شكراً لتعاملكم معنا</p>
          </div>
        </div>
      </body>
      </html>
    `;

        const attachments = [];
        if (pdfBuffer) {
            attachments.push({
                filename: `invoice-${invoice.invoiceNumber}.pdf`,
                content: pdfBuffer,
            });
        }

        return this.sendEmail({
            to: customer.email,
            subject: `فاتورة رقم ${invoice.invoiceNumber} - ${process.env.COMPANY_NAME || 'ERP System'}`,
            html,
            attachments,
        });
    }

    /**
     * Send payment reminder
     */
    async sendPaymentReminder(customer, invoice) {
        const daysOverdue = Math.floor(
            (new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
        );

        const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f56565; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #fff; }
          .alert { background: #fed7d7; padding: 15px; border-right: 4px solid #f56565; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ تذكير بالدفع</h1>
          </div>
          <div class="content">
            <p>عزيزي <strong>${customer.name}</strong>,</p>
            
            ${daysOverdue > 0 ? `
              <div class="alert">
                <strong>⚠️ تنبيه:</strong> هذه الفاتورة متأخرة ${daysOverdue} يوم
              </div>
            ` : ''}
            
            <p>نذكركم بوجود فاتورة مستحقة:</p>
            <ul>
              <li><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</li>
              <li><strong>المبلغ المستحق:</strong> ${(invoice.total - invoice.paidAmount).toFixed(2)} جنيه</li>
              <li><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</li>
            </ul>
            
            <p>نرجو سرعة السداد لتجنب أي رسوم تأخير.</p>
            <p>شكراً لتعاونكم.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: customer.email,
            subject: `تذكير: فاتورة رقم ${invoice.invoiceNumber} ${daysOverdue > 0 ? '(متأخرة)' : ''}`,
            html,
        });
    }

    /**
     * Send payment confirmation
     */
    async sendPaymentConfirmation(customer, invoice, payment) {
        const isPaidFull = invoice.paidAmount >= invoice.total;

        const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #48bb78; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #fff; }
          .success { background: #c6f6d5; padding: 15px; border-right: 4px solid #48bb78; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ تأكيد الدفع</h1>
          </div>
          <div class="content">
            <p>عزيزي <strong>${customer.name}</strong>,</p>
            
            <div class="success">
              <strong>تم استلام دفعتكم بنجاح!</strong>
            </div>
            
            <p>تفاصيل الدفع:</p>
            <ul>
              <li><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</li>
              <li><strong>المبلغ المدفوع:</strong> ${payment.amount.toFixed(2)} جنيه</li>
              <li><strong>تاريخ الدفع:</strong> ${new Date(payment.date).toLocaleDateString('ar-EG')}</li>
              <li><strong>الحالة:</strong> ${isPaidFull ? '✅ مدفوعة بالكامل' : `المتبقي: ${(invoice.total - invoice.paidAmount).toFixed(2)} جنيه`}</li>
            </ul>
            
            <p>شكراً لتعاملكم معنا.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: customer.email,
            subject: `تأكيد الدفع - فاتورة رقم ${invoice.invoiceNumber}`,
            html,
        });
    }

    /**
     * Get status label in Arabic
     */
    getStatusLabel(status) {
        const labels = {
            draft: 'مسودة',
            sent: 'مرسلة',
            paid: 'مدفوعة',
            overdue: 'متأخرة',
            cancelled: 'ملغاة',
        };
        return labels[status] || status;
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user) {
        const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>مرحباً بك!</h1>
          </div>
          <div class="content">
            <p>عزيزي <strong>${user.name}</strong>,</p>
            <p>مرحباً بك في ${process.env.COMPANY_NAME || 'نظام ERP'}!</p>
            <p>تم إنشاء حسابك بنجاح.</p>
            <p>يمكنك الآن تسجيل الدخول والبدء في استخدام النظام.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to: user.email,
            subject: `مرحباً بك في ${process.env.COMPANY_NAME || 'نظام ERP'}`,
            html,
        });
    }
}

const emailService = new EmailService();
export default emailService;
