// Email Service using Nodemailer (Server-side only)
// This file should only be imported in API routes or server components

// Only import nodemailer on server
let nodemailer = null;
if (typeof window === 'undefined') {
  nodemailer = require('nodemailer');
}

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (typeof window !== 'undefined') {
    throw new Error('Email service can only be used on server-side');
  }

  if (!transporter && nodemailer) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Send email
 */
export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  if (typeof window !== 'undefined') {
    throw new Error('Email service can only be used on server-side');
  }

  try {
    const transport = getTransporter();

    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(invoice, customerEmail) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>فاتورة جديدة</h1>
          <p>رقم الفاتورة: ${invoice.number}</p>
        </div>
        <div class="content">
          <p>عزيزي العميل،</p>
          <p>نرسل إليك فاتورة جديدة من نظام محاسبي برو.</p>
          
          <div class="invoice-details">
            <h3>تفاصيل الفاتورة:</h3>
            <p><strong>رقم الفاتورة:</strong> ${invoice.number}</p>
            <p><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
            <p><strong>المبلغ الإجمالي:</strong> ${invoice.total} ج.م</p>
            <p><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>
          </div>

          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}" class="button">
              عرض الفاتورة
            </a>
          </center>

          <p>شكراً لتعاملكم معنا!</p>
        </div>
        <div class="footer">
          <p>نظام محاسبي برو</p>
          <p>هذا البريد تم إرساله تلقائياً، الرجاء عدم الرد عليه.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `فاتورة رقم ${invoice.number}`,
    html,
  });
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminder(invoice, customerEmail) {
  const daysOverdue = Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .alert { background: #fef2f2; border-right: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ تذكير بالدفع</h1>
        </div>
        <div class="content">
          <p>عزيزي العميل،</p>
          
          <div class="alert">
            <p><strong>تنبيه:</strong> الفاتورة رقم ${invoice.number} متأخرة ${daysOverdue} يوم</p>
          </div>

          <p><strong>المبلغ المستحق:</strong> ${invoice.total} ج.م</p>
          <p><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>

          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/pay" class="button">
              الدفع الآن
            </a>
          </center>

          <p>نرجو منكم سرعة السداد لتجنب أي رسوم إضافية.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `⚠️ تذكير: فاتورة رقم ${invoice.number} متأخرة`,
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(user) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>مرحباً بك في نظام محاسبي برو! 🎉</h1>
        </div>
        <div class="content">
          <p>عزيزي ${user.name}،</p>
          <p>نرحب بك في نظام محاسبي برو - النظام المحاسبي المتكامل.</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
              ابدأ الآن
            </a>
          </center>

          <p>إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'مرحباً بك في نظام محاسبي برو',
    html,
  });
}
