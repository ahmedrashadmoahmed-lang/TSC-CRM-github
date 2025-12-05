// WhatsApp Service for RFQ System
// Handles WhatsApp notifications via Twilio WhatsApp API or similar provider

class WhatsAppService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
        this.initialized = false;
        this.client = null;
    }

    /**
     * Initialize WhatsApp service
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            if (this.accountSid && this.authToken) {
                // In production, use Twilio client
                // const twilio = require('twilio');
                // this.client = twilio(this.accountSid, this.authToken);
                console.log('WhatsApp service initialized successfully');
            } else {
                console.warn('WhatsApp service: Twilio credentials not configured, running in mock mode');
            }

            this.initialized = true;

        } catch (error) {
            console.error('Failed to initialize WhatsApp service:', error);
            this.initialized = true;
        }
    }

    /**
     * Send WhatsApp message
     */
    async sendMessage({ to, body, mediaUrl = null }) {
        await this.initialize();

        try {
            // Format phone number for WhatsApp
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

            // If no client configured, log message instead
            if (!this.client || !this.accountSid) {
                console.log('[MOCK WHATSAPP]');
                console.log('To:', formattedTo);
                console.log('Body:', body);
                if (mediaUrl) console.log('Media:', mediaUrl);
                return { success: true, messageId: 'mock-wa-' + Date.now(), mock: true };
            }

            const messageOptions = {
                from: this.whatsappNumber,
                to: formattedTo,
                body
            };

            if (mediaUrl) {
                messageOptions.mediaUrl = [mediaUrl];
            }

            // In production, uncomment this:
            // const message = await this.client.messages.create(messageOptions);

            // Mock response for development
            const message = {
                sid: 'WA' + Date.now(),
                status: 'sent'
            };

            return {
                success: true,
                messageId: message.sid,
                status: message.status
            };

        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }

    /**
     * Send RFQ invitation via WhatsApp
     */
    async sendRFQInvitation(rfq, supplier, invitationUrl) {
        const body = `
🔔 *New RFQ Invitation*

Dear ${supplier.name},

You have been invited to submit a quotation:

📋 *RFQ:* ${rfq.rfqNumber}
📝 *Title:* ${rfq.title}
📦 *Items:* ${rfq.items?.length || 0}
📅 *Deadline:* ${new Date(rfq.deadline).toLocaleDateString()}
⚡ *Priority:* ${rfq.priority}

🔗 View details and submit quote:
${invitationUrl}

Please submit your quotation before the deadline.

_This is an automated message from ERP System._
        `.trim();

        return await this.sendMessage({
            to: supplier.phone || supplier.whatsapp,
            body
        });
    }

    /**
     * Send deadline reminder via WhatsApp
     */
    async sendDeadlineReminder(rfq, supplier, daysLeft) {
        const urgency = daysLeft <= 1 ? '🚨' : '⏰';

        const body = `
${urgency} *RFQ Deadline Reminder*

Dear ${supplier.name},

Reminder: RFQ ${rfq.rfqNumber} deadline is approaching!

⏱️ *Time Remaining:* ${daysLeft} day(s)
📋 *RFQ:* ${rfq.title}
📅 *Deadline:* ${new Date(rfq.deadline).toLocaleString()}

Please submit your quotation before the deadline to be considered.

🔗 Submit now: ${process.env.NEXTAUTH_URL}/rfq/${rfq.id}

_This is an automated reminder from ERP System._
        `.trim();

        return await this.sendMessage({
            to: supplier.phone || supplier.whatsapp,
            body
        });
    }

    /**
     * Send quote received confirmation via WhatsApp
     */
    async sendQuoteReceivedConfirmation(quote, rfq, supplier) {
        const body = `
✅ *Quote Received Successfully*

Dear ${supplier.name},

Your quotation has been received and is under review.

📋 *RFQ:* ${rfq.rfqNumber}
📝 *Quote Ref:* ${quote.quoteReference || 'N/A'}
💰 *Amount:* ${quote.totalPrice} ${quote.currency || rfq.currency || 'EGP'}
🚚 *Delivery:* ${quote.deliveryTime || 'N/A'}
📅 *Submitted:* ${new Date(quote.submittedAt).toLocaleString()}

We will review your quotation and notify you of our decision.

Thank you for your submission! 🙏

_This is an automated confirmation from ERP System._
        `.trim();

        return await this.sendMessage({
            to: supplier.phone || supplier.whatsapp,
            body
        });
    }

    /**
     * Send quote selection notification via WhatsApp
     */
    async sendQuoteSelectionNotification(quote, rfq, supplier, isSelected) {
        const body = isSelected
            ? `
🎉 *Congratulations!*

Dear ${supplier.name},

Great news! Your quote for RFQ ${rfq.rfqNumber} has been *SELECTED*! 🎊

📋 *RFQ:* ${rfq.title}
💰 *Your Quote:* ${quote.totalPrice} ${quote.currency || rfq.currency || 'EGP'}

Our procurement team will contact you shortly to proceed with the next steps.

Thank you for your competitive quotation! 🤝

_This is an automated notification from ERP System._
            `.trim()
            : `
📋 *Quote Status Update*

Dear ${supplier.name},

Thank you for submitting your quotation for RFQ ${rfq.rfqNumber} - ${rfq.title}.

After careful consideration, we have decided to proceed with a different supplier for this request.

We appreciate your time and effort, and we look forward to working with you on future opportunities. 🙏

_This is an automated notification from ERP System._
            `.trim();

        return await this.sendMessage({
            to: supplier.phone || supplier.whatsapp,
            body
        });
    }

    /**
     * Send RFQ status update via WhatsApp
     */
    async sendRFQStatusUpdate(rfq, phone, statusMessage) {
        const body = `
📋 *RFQ Status Update*

*RFQ ${rfq.rfqNumber}* - ${rfq.title}

${statusMessage}

*Current Status:* ${rfq.stage} (${rfq.status})

_This is an automated notification from ERP System._
        `.trim();

        return await this.sendMessage({
            to: phone,
            body
        });
    }

    /**
     * Send approval request via WhatsApp
     */
    async sendApprovalRequest(rfq, approver, approvalUrl) {
        const body = `
📋 *Approval Request*

Dear ${approver.name},

A new RFQ requires your approval:

📋 *RFQ:* ${rfq.rfqNumber}
📝 *Title:* ${rfq.title}
💰 *Budget:* ${rfq.budget} ${rfq.currency || 'EGP'}
⚡ *Priority:* ${rfq.priority}

🔗 Review and approve:
${approvalUrl}

Please review at your earliest convenience.

_This is an automated request from ERP System._
        `.trim();

        return await this.sendMessage({
            to: approver.phone || approver.whatsapp,
            body
        });
    }

    /**
     * Send PO created notification via WhatsApp
     */
    async sendPOCreatedNotification(po, supplier) {
        const body = `
📦 *Purchase Order Created*

Dear ${supplier.name},

A Purchase Order has been created for you:

📋 *PO Number:* ${po.poNumber}
💰 *Amount:* ${po.totalAmount} ${po.currency || 'EGP'}
📅 *Delivery Date:* ${new Date(po.deliveryDate).toLocaleDateString()}

Please confirm receipt and proceed with the order.

We will contact you with further details.

_This is an automated notification from ERP System._
        `.trim();

        return await this.sendMessage({
            to: supplier.phone || supplier.whatsapp,
            body
        });
    }

    /**
     * Send custom message via WhatsApp
     */
    async sendCustomMessage(phone, message, mediaUrl = null) {
        return await this.sendMessage({
            to: phone,
            body: message,
            mediaUrl
        });
    }

    /**
     * Send bulk messages via WhatsApp
     */
    async sendBulkMessages(messages) {
        const results = await Promise.allSettled(
            messages.map(msg => this.sendMessage(msg))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return {
            total: messages.length,
            successful,
            failed,
            results: results.map((r, i) => ({
                to: messages[i].to,
                status: r.status,
                result: r.status === 'fulfilled' ? r.value : r.reason?.message
            }))
        };
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phone) {
        // Basic validation for international format
        // Expected format: +[country code][number] or whatsapp:+[country code][number]
        const cleaned = phone.replace('whatsapp:', '').trim();
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(cleaned);
    }

    /**
     * Format phone number for WhatsApp
     */
    formatPhoneNumber(phone) {
        // Remove spaces, dashes, and parentheses
        let cleaned = phone.replace(/[\s\-\(\)]/g, '');

        // Add + if not present
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }

        // Add whatsapp: prefix
        if (!cleaned.startsWith('whatsapp:')) {
            cleaned = 'whatsapp:' + cleaned;
        }

        return cleaned;
    }

    /**
     * Get message delivery status
     * In production, this would query Twilio API for message status
     */
    async getMessageStatus(messageId) {
        if (!this.client || !this.accountSid) {
            return {
                messageId,
                status: 'sent',
                mock: true
            };
        }

        // In production:
        // const message = await this.client.messages(messageId).fetch();
        // return { messageId, status: message.status, ... };

        return {
            messageId,
            status: 'delivered',
            mock: false
        };
    }
}

// Export singleton instance
const whatsappService = new WhatsAppService();
export default whatsappService;
