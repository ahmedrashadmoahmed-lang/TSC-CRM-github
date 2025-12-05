// Email Service for RFQ System
// Handles automated email notifications to suppliers and stakeholders

import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@yourcompany.com';
        this.fromName = process.env.SMTP_FROM_NAME || 'ERP System';
        this.initialized = false;
    }

    /**
     * Initialize email transporter
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Configure transporter based on environment variables
            const config = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            };

            // Create transporter
            this.transporter = nodemailer.createTransport(config);

            // Verify connection
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                await this.transporter.verify();
                console.log('Email service initialized successfully');
            } else {
                console.warn('Email service: SMTP credentials not configured, running in mock mode');
            }

            this.initialized = true;

        } catch (error) {
            console.error('Failed to initialize email service:', error);
            // Continue with mock mode
            this.initialized = true;
        }
    }

    /**
     * Send email
     */
    async sendEmail({ to, subject, html, text, attachments = [] }) {
        await this.initialize();

        try {
            // If no transporter configured, log email instead of sending
            if (!this.transporter || !process.env.SMTP_USER) {
                console.log('[MOCK EMAIL]');
                console.log('To:', to);
                console.log('Subject:', subject);
                console.log('Body:', text || html);
                return { success: true, messageId: 'mock-' + Date.now(), mock: true };
            }

            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                html,
                text,
                attachments
            };

            const info = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };

        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Send RFQ invitation to supplier
     */
    async sendRFQInvitation(rfq, supplier, invitationUrl) {
        const subject = `New RFQ: ${rfq.title} - ${rfq.rfqNumber}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                    .rfq-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .label { font-weight: 600; color: #6b7280; }
                    .value { color: #1f2937; }
                    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 New Request for Quotation</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${supplier.name},</p>
                        <p>You have been invited to submit a quotation for the following request:</p>

                        <div class="rfq-details">
                            <div class="detail-row">
                                <span class="label">RFQ Number:</span>
                                <span class="value">${rfq.rfqNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Title:</span>
                                <span class="value">${rfq.title}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Description:</span>
                                <span class="value">${rfq.description || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Number of Items:</span>
                                <span class="value">${rfq.items?.length || 0}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Deadline:</span>
                                <span class="value">${new Date(rfq.deadline).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Priority:</span>
                                <span class="value" style="text-transform: capitalize;">${rfq.priority}</span>
                            </div>
                        </div>

                        <p style="text-align: center;">
                            <a href="${invitationUrl}" class="button">View RFQ & Submit Quote</a>
                        </p>

                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>Please submit your quotation before the deadline</li>
                            <li>Ensure all required information is provided</li>
                            <li>Include any relevant certifications or documentation</li>
                        </ul>

                        <p>If you have any questions, please contact us.</p>
                        <p>Best regards,<br>${this.fromName}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the ERP System.</p>
                        <p>Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
New Request for Quotation

Dear ${supplier.name},

You have been invited to submit a quotation for the following request:

RFQ Number: ${rfq.rfqNumber}
Title: ${rfq.title}
Description: ${rfq.description || 'N/A'}
Number of Items: ${rfq.items?.length || 0}
Deadline: ${new Date(rfq.deadline).toLocaleDateString()}
Priority: ${rfq.priority}

View RFQ and submit your quote: ${invitationUrl}

Important Notes:
- Please submit your quotation before the deadline
- Ensure all required information is provided
- Include any relevant certifications or documentation

If you have any questions, please contact us.

Best regards,
${this.fromName}
        `;

        return await this.sendEmail({
            to: supplier.email,
            subject,
            html,
            text
        });
    }

    /**
     * Send RFQ deadline reminder
     */
    async sendDeadlineReminder(rfq, supplier, daysLeft) {
        const subject = `Reminder: RFQ ${rfq.rfqNumber} - ${daysLeft} days remaining`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ RFQ Deadline Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${supplier.name},</p>

                        <div class="warning-box">
                            <p><strong>⚠️ This is a reminder that the deadline for RFQ ${rfq.rfqNumber} is approaching.</strong></p>
                            <p><strong>Time remaining: ${daysLeft} day(s)</strong></p>
                        </div>

                        <p><strong>RFQ Details:</strong></p>
                        <ul>
                            <li><strong>Title:</strong> ${rfq.title}</li>
                            <li><strong>RFQ Number:</strong> ${rfq.rfqNumber}</li>
                            <li><strong>Deadline:</strong> ${new Date(rfq.deadline).toLocaleString()}</li>
                        </ul>

                        <p>Please ensure you submit your quotation before the deadline. Late submissions may not be considered.</p>

                        <p style="text-align: center;">
                            <a href="${process.env.NEXTAUTH_URL}/rfq/${rfq.id}" class="button">Submit Quote Now</a>
                        </p>

                        <p>Best regards,<br>${this.fromName}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated reminder from the ERP System.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
RFQ Deadline Reminder

Dear ${supplier.name},

This is a reminder that the deadline for RFQ ${rfq.rfqNumber} is approaching.

Time remaining: ${daysLeft} day(s)

RFQ Details:
- Title: ${rfq.title}
- RFQ Number: ${rfq.rfqNumber}
- Deadline: ${new Date(rfq.deadline).toLocaleString()}

Please ensure you submit your quotation before the deadline. Late submissions may not be considered.

Submit your quote: ${process.env.NEXTAUTH_URL}/rfq/${rfq.id}

Best regards,
${this.fromName}
        `;

        return await this.sendEmail({
            to: supplier.email,
            subject,
            html,
            text
        });
    }

    /**
     * Send quote received confirmation
     */
    async sendQuoteReceivedConfirmation(quote, rfq, supplier) {
        const subject = `Quote Received - RFQ ${rfq.rfqNumber}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Quote Received Successfully</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${supplier.name},</p>

                        <div class="success-box">
                            <p><strong>✓ Your quotation has been successfully received and is under review.</strong></p>
                        </div>

                        <p><strong>Quote Details:</strong></p>
                        <ul>
                            <li><strong>RFQ Number:</strong> ${rfq.rfqNumber}</li>
                            <li><strong>Quote Reference:</strong> ${quote.quoteReference || 'N/A'}</li>
                            <li><strong>Total Amount:</strong> ${quote.totalPrice} ${quote.currency || rfq.currency || 'EGP'}</li>
                            <li><strong>Delivery Time:</strong> ${quote.deliveryTime || 'N/A'}</li>
                            <li><strong>Submitted:</strong> ${new Date(quote.submittedAt).toLocaleString()}</li>
                        </ul>

                        <p>Our team will review your quotation and contact you if we need any additional information.</p>
                        <p>You will be notified once a decision has been made.</p>

                        <p>Thank you for your submission.</p>
                        <p>Best regards,<br>${this.fromName}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated confirmation from the ERP System.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Quote Received Successfully

Dear ${supplier.name},

Your quotation has been successfully received and is under review.

Quote Details:
- RFQ Number: ${rfq.rfqNumber}
- Quote Reference: ${quote.quoteReference || 'N/A'}
- Total Amount: ${quote.totalPrice} ${quote.currency || rfq.currency || 'EGP'}
- Delivery Time: ${quote.deliveryTime || 'N/A'}
- Submitted: ${new Date(quote.submittedAt).toLocaleString()}

Our team will review your quotation and contact you if we need any additional information.
You will be notified once a decision has been made.

Thank you for your submission.

Best regards,
${this.fromName}
        `;

        return await this.sendEmail({
            to: supplier.email,
            subject,
            html,
            text
        });
    }

    /**
     * Send quote selection notification
     */
    async sendQuoteSelectionNotification(quote, rfq, supplier, isSelected) {
        const subject = isSelected
            ? `Congratulations! Your quote has been selected - RFQ ${rfq.rfqNumber}`
            : `Quote Status Update - RFQ ${rfq.rfqNumber}`;

        const html = isSelected ? `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                    .button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Congratulations!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${supplier.name},</p>

                        <div class="success-box">
                            <p><strong>✓ Your quote for RFQ ${rfq.rfqNumber} has been selected!</strong></p>
                        </div>

                        <p>We are pleased to inform you that your quotation has been selected for the following RFQ:</p>

                        <p><strong>Details:</strong></p>
                        <ul>
                            <li><strong>RFQ Title:</strong> ${rfq.title}</li>
                            <li><strong>RFQ Number:</strong> ${rfq.rfqNumber}</li>
                            <li><strong>Your Quote Amount:</strong> ${quote.totalPrice} ${quote.currency || rfq.currency || 'EGP'}</li>
                        </ul>

                        <p>Our procurement team will contact you shortly to proceed with the next steps.</p>

                        <p>Thank you for your competitive quotation.</p>
                        <p>Best regards,<br>${this.fromName}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from the ERP System.</p>
                    </div>
                </div>
            </body>
            </html>
        ` : `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Quote Status Update</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${supplier.name},</p>

                        <p>Thank you for submitting your quotation for RFQ ${rfq.rfqNumber} - ${rfq.title}.</p>

                        <p>After careful consideration, we have decided to proceed with a different supplier for this request.</p>

                        <p>We appreciate the time and effort you invested in preparing your quotation, and we look forward to the opportunity to work with you on future projects.</p>

                        <p>Best regards,<br>${this.fromName}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from the ERP System.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = isSelected
            ? `
Congratulations!

Dear ${supplier.name},

Your quote for RFQ ${rfq.rfqNumber} has been selected!

We are pleased to inform you that your quotation has been selected.

Details:
- RFQ Title: ${rfq.title}
- RFQ Number: ${rfq.rfqNumber}
- Your Quote Amount: ${quote.totalPrice} ${quote.currency || rfq.currency || 'EGP'}

Our procurement team will contact you shortly to proceed with the next steps.

Thank you for your competitive quotation.

Best regards,
${this.fromName}
            `
            : `
Quote Status Update

Dear ${supplier.name},

Thank you for submitting your quotation for RFQ ${rfq.rfqNumber} - ${rfq.title}.

After careful consideration, we have decided to proceed with a different supplier for this request.

We appreciate the time and effort you invested in preparing your quotation, and we look forward to the opportunity to work with you on future projects.

Best regards,
${this.fromName}
            `;

        return await this.sendEmail({
            to: supplier.email,
            subject,
            html,
            text
        });
    }

    /**
     * Send RFQ status update notification
     */
    async sendRFQStatusUpdate(rfq, recipients, statusMessage) {
        const subject = `RFQ Status Update - ${rfq.rfqNumber}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 RFQ Status Update</h1>
                    </div>
                    <div class="content">
                        <p><strong>RFQ ${rfq.rfqNumber}</strong> - ${rfq.title}</p>

                        <p>${statusMessage}</p>

                        <p><strong>Current Status:</strong> ${rfq.stage} (${rfq.status})</p>

                        <p>Best regards,<br>${this.fromName}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from the ERP System.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
RFQ Status Update

RFQ ${rfq.rfqNumber} - ${rfq.title}

${statusMessage}

Current Status: ${rfq.stage} (${rfq.status})

Best regards,
${this.fromName}
        `;

        return await this.sendEmail({
            to: recipients,
            subject,
            html,
            text
        });
    }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
