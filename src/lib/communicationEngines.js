// Communication Engine
// Unified communication across email, SMS, WhatsApp

export class CommunicationEngine {
    /**
     * Send communication via multiple channels
     */
    static async sendMessage(config) {
        const { channel, to, subject, message, templateId, variables } = config;

        let result;

        switch (channel) {
            case 'email':
                result = await this.sendEmail({ to, subject, message, templateId, variables });
                break;
            case 'sms':
                result = await this.sendSMS({ to, message });
                break;
            case 'whatsapp':
                result = await this.sendWhatsApp({ to, message, templateId });
                break;
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }

        return {
            success: true,
            channel,
            messageId: result.id,
            sentAt: new Date(),
            to
        };
    }

    /**
     * Send Email (SendGrid integration)
     */
    static async sendEmail({ to, subject, message, templateId, variables }) {
        // Mock implementation - integrate with SendGrid
        console.log('Sending email:', { to, subject });

        return {
            id: `email_${Date.now()}`,
            status: 'sent'
        };
    }

    /**
     * Send SMS (Twilio integration)
     */
    static async sendSMS({ to, message }) {
        // Mock implementation - integrate with Twilio
        console.log('Sending SMS:', { to, message });

        return {
            id: `sms_${Date.now()}`,
            status: 'sent'
        };
    }

    /**
     * Send WhatsApp (WhatsApp Business API)
     */
    static async sendWhatsApp({ to, message, templateId }) {
        // Mock implementation - integrate with WhatsApp Business API
        console.log('Sending WhatsApp:', { to, message });

        return {
            id: `whatsapp_${Date.now()}`,
            status: 'sent'
        };
    }

    /**
     * Get communication history
     */
    static getCommunicationHistory(entityId, entityType = 'opportunity') {
        // Would fetch from database
        return [];
    }
}

// Marketing Integration Engine
export class MarketingIntegrationEngine {
    /**
     * Track lead source
     */
    static trackLeadSource(lead, source) {
        return {
            leadId: lead.id,
            source: source.name,
            campaign: source.campaign,
            medium: source.medium,
            content: source.content,
            trackedAt: new Date()
        };
    }

    /**
     * Calculate campaign ROI
     */
    static calculateCampaignROI(campaign, deals) {
        const campaignDeals = deals.filter(d => d.source === campaign.id);

        const totalRevenue = campaignDeals
            .filter(d => d.stage === 'won')
            .reduce((sum, d) => sum + d.value, 0);

        const totalCost = campaign.cost || 0;
        const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

        return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            totalLeads: campaignDeals.length,
            wonDeals: campaignDeals.filter(d => d.stage === 'won').length,
            totalRevenue,
            totalCost,
            roi,
            costPerLead: campaignDeals.length > 0 ? totalCost / campaignDeals.length : 0,
            conversionRate: campaignDeals.length > 0
                ? (campaignDeals.filter(d => d.stage === 'won').length / campaignDeals.length) * 100
                : 0
        };
    }

    /**
     * Analyze lead sources
     */
    static analyzeLeadSources(opportunities) {
        const sources = {};

        opportunities.forEach(opp => {
            const source = opp.source || 'Unknown';
            if (!sources[source]) {
                sources[source] = {
                    count: 0,
                    won: 0,
                    totalValue: 0,
                    wonValue: 0
                };
            }

            sources[source].count++;
            sources[source].totalValue += opp.value;

            if (opp.stage === 'won') {
                sources[source].won++;
                sources[source].wonValue += opp.value;
            }
        });

        return Object.entries(sources).map(([name, data]) => ({
            source: name,
            ...data,
            conversionRate: data.count > 0 ? (data.won / data.count) * 100 : 0,
            avgDealValue: data.count > 0 ? data.totalValue / data.count : 0
        })).sort((a, b) => b.wonValue - a.wonValue);
    }
}

// Post-Deal Automation Engine
export class PostDealAutomationEngine {
    /**
     * Create automation workflow
     */
    static createWorkflow(trigger, actions) {
        return {
            id: `workflow_${Date.now()}`,
            trigger: {
                event: trigger.event, // deal_won, deal_lost, stage_change
                conditions: trigger.conditions || []
            },
            actions: actions.map((action, index) => ({
                order: index + 1,
                type: action.type, // send_email, create_task, update_field
                config: action.config,
                delay: action.delay || 0 // minutes
            })),
            enabled: true,
            createdAt: new Date()
        };
    }

    /**
     * Execute workflow
     */
    static async executeWorkflow(workflow, context) {
        const results = [];

        for (const action of workflow.actions) {
            // Apply delay
            if (action.delay > 0) {
                await this.delay(action.delay * 60 * 1000);
            }

            let result;

            switch (action.type) {
                case 'send_email':
                    result = await this.sendEmail(action.config, context);
                    break;
                case 'create_task':
                    result = await this.createTask(action.config, context);
                    break;
                case 'update_field':
                    result = await this.updateField(action.config, context);
                    break;
                case 'send_notification':
                    result = await this.sendNotification(action.config, context);
                    break;
                default:
                    result = { success: false, error: 'Unknown action type' };
            }

            results.push({
                action: action.type,
                success: result.success,
                executedAt: new Date()
            });
        }

        return {
            workflowId: workflow.id,
            executedActions: results.length,
            successfulActions: results.filter(r => r.success).length,
            results
        };
    }

    static async sendEmail(config, context) {
        return { success: true };
    }

    static async createTask(config, context) {
        return { success: true };
    }

    static async updateField(config, context) {
        return { success: true };
    }

    static async sendNotification(config, context) {
        return { success: true };
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get common workflow templates
     */
    static getWorkflowTemplates() {
        return [
            {
                name: 'Deal Won - Onboarding',
                trigger: { event: 'deal_won' },
                actions: [
                    { type: 'send_email', config: { template: 'welcome' }, delay: 0 },
                    { type: 'create_task', config: { title: 'Schedule kickoff call' }, delay: 60 },
                    { type: 'send_notification', config: { message: 'New customer!' }, delay: 0 }
                ]
            },
            {
                name: 'Deal Lost - Follow-up',
                trigger: { event: 'deal_lost' },
                actions: [
                    { type: 'send_email', config: { template: 'stay_in_touch' }, delay: 1440 },
                    { type: 'create_task', config: { title: 'Check back in 3 months' }, delay: 129600 }
                ]
            }
        ];
    }
}

// Customer Feedback Engine
export class CustomerFeedbackEngine {
    /**
     * Create feedback survey
     */
    static createSurvey(config) {
        return {
            id: `survey_${Date.now()}`,
            name: config.name,
            type: config.type, // nps, csat, custom
            questions: config.questions,
            trigger: config.trigger, // deal_won, manual, scheduled
            enabled: true,
            createdAt: new Date()
        };
    }

    /**
     * Calculate NPS
     */
    static calculateNPS(responses) {
        if (responses.length === 0) return { score: 0, category: 'N/A' };

        const promoters = responses.filter(r => r.score >= 9).length;
        const detractors = responses.filter(r => r.score <= 6).length;
        const total = responses.length;

        const nps = Math.round(((promoters - detractors) / total) * 100);

        return {
            score: nps,
            category: this.getNPSCategory(nps),
            promoters,
            passives: total - promoters - detractors,
            detractors,
            totalResponses: total
        };
    }

    static getNPSCategory(score) {
        if (score >= 70) return 'Excellent';
        if (score >= 50) return 'Great';
        if (score >= 30) return 'Good';
        if (score >= 0) return 'Needs Improvement';
        return 'Critical';
    }

    /**
     * Analyze feedback sentiment
     */
    static analyzeSentiment(feedbackText) {
        // Simple keyword-based sentiment (would use AI in production)
        const positive = ['great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful'];
        const negative = ['bad', 'poor', 'terrible', 'hate', 'awful', 'worst'];

        const text = feedbackText.toLowerCase();
        let score = 0;

        positive.forEach(word => {
            if (text.includes(word)) score += 1;
        });

        negative.forEach(word => {
            if (text.includes(word)) score -= 1;
        });

        return {
            score,
            sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
            confidence: Math.min(Math.abs(score) * 20, 100)
        };
    }

    /**
     * Get feedback insights
     */
    static getFeedbackInsights(allFeedback) {
        const npsResponses = allFeedback.filter(f => f.type === 'nps');
        const nps = this.calculateNPS(npsResponses);

        const sentiments = allFeedback
            .filter(f => f.comment)
            .map(f => this.analyzeSentiment(f.comment));

        const avgSentiment = sentiments.length > 0
            ? sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
            : 0;

        return {
            nps,
            totalFeedback: allFeedback.length,
            avgSentiment,
            sentimentDistribution: {
                positive: sentiments.filter(s => s.sentiment === 'positive').length,
                neutral: sentiments.filter(s => s.sentiment === 'neutral').length,
                negative: sentiments.filter(s => s.sentiment === 'negative').length
            }
        };
    }
}
