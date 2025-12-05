import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Email service configuration
// Note: Requires email service setup (SendGrid, AWS SES, etc.)
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || 'noreply@erp.com',
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY || '',
};

// POST send report via email
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reportId, recipients, subject, message, attachmentUrl } = body;

        // Validate inputs
        if (!recipients || !subject) {
            return NextResponse.json(
                { error: 'Recipients and subject are required' },
                { status: 400 }
            );
        }

        // Check if email service is configured
        if (!EMAIL_CONFIG.apiKey) {
            return NextResponse.json({
                success: false,
                error: 'Email service not configured',
                message: 'ÙŠØ±Ø¬Ù‰ ØªÙƒÙˆÙŠÙ† Ø®Ø¯Ù…Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙÙŠ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…'
            }, { status: 503 });
        }

        // Prepare email data
        const emailData = {
            to: Array.isArray(recipients) ? recipients : [recipients],
            from: EMAIL_CONFIG.from,
            subject: subject,
            html: generateEmailHTML(message, attachmentUrl),
            attachments: attachmentUrl ? [{
                filename: `report_${Date.now()}.pdf`,
                path: attachmentUrl
            }] : []
        };

        // Send email based on service
        let result;
        switch (EMAIL_CONFIG.service) {
            case 'sendgrid':
                result = await sendViaSendGrid(emailData);
                break;
            case 'ses':
                result = await sendViaSES(emailData);
                break;
            default:
                // Mock send for development
                result = await mockSendEmail(emailData);
        }

        // Log email send
        console.log('Email sent:', {
            to: emailData.to,
            subject: emailData.subject,
            timestamp: new Date(),
            user: session.user.email
        });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø¨Ù†Ø¬Ø§Ø­',
            data: result
        });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}

// Helper: Generate email HTML
function generateEmailHTML(message, attachmentUrl) {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>âš¡ Supply Chain ERP</h1>
          <p>ØªÙ‚Ø±ÙŠØ± ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù…</p>
        </div>
        <div class="content">
          <p>${message || 'Ù…Ø±ÙÙ‚ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø·Ù„ÙˆØ¨'}</p>
          ${attachmentUrl ? `
            <a href="${attachmentUrl}" class="button">ðŸ“¥ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø±ÙŠØ±</a>
          ` : ''}
        </div>
        <div class="footer">
          <p>Ù‡Ø°Ø§ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ØªÙ„Ù‚Ø§Ø¦ÙŠØŒ ÙŠØ±Ø¬Ù‰ Ø¹Ø¯Ù… Ø§Ù„Ø±Ø¯ Ø¹Ù„ÙŠÙ‡</p>
          <p>Â© 2025 Supply Chain ERP. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper: Send via SendGrid
async function sendViaSendGrid(emailData) {
    // TODO: Implement SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(EMAIL_CONFIG.apiKey);
    // return await sgMail.send(emailData);

    return { messageId: 'mock-sendgrid-id', status: 'sent' };
}

// Helper: Send via AWS SES
async function sendViaSES(emailData) {
    // TODO: Implement AWS SES integration
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: 'us-east-1' });
    // return await ses.sendEmail(...).promise();

    return { messageId: 'mock-ses-id', status: 'sent' };
}

// Helper: Mock send for development
async function mockSendEmail(emailData) {
    console.log('ðŸ“§ Mock Email Send:', {
        to: emailData.to,
        subject: emailData.subject,
        hasAttachment: emailData.attachments.length > 0
    });

    return {
        messageId: `mock-${Date.now()}`,
        status: 'sent',
        timestamp: new Date()
    };
}
