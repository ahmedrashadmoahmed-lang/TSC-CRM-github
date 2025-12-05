// Predictive Follow-Up Engine
// AI-powered next action recommendations

export class PredictiveFollowUpEngine {
    /**
     * Predict next best action for an opportunity
     */
    static predictNextAction(opportunity, interactions = [], customer = null) {
        const context = this.analyzeContext(opportunity, interactions, customer);
        const suggestions = this.generateSuggestions(context, opportunity);

        return {
            topSuggestion: suggestions[0],
            allSuggestions: suggestions,
            confidence: this.calculateConfidence(context),
            reasoning: this.explainReasoning(suggestions[0], context)
        };
    }

    /**
     * Analyze context
     */
    static analyzeContext(opportunity, interactions, customer) {
        const daysSinceLastContact = this.getDaysSinceLastContact(interactions);
        const interactionCount = interactions.length;
        const stage = opportunity.stage;
        const value = opportunity.value;

        return {
            daysSinceLastContact,
            interactionCount,
            stage,
            value,
            isHighValue: value >= 50000,
            isStale: daysSinceLastContact > 7,
            hasRecentActivity: daysSinceLastContact <= 3,
            customerType: customer?.type || 'unknown'
        };
    }

    /**
     * Generate suggestions
     */
    static generateSuggestions(context, opportunity) {
        const suggestions = [];

        // Rule-based AI logic
        if (context.isStale) {
            suggestions.push({
                action: 'call',
                priority: 'high',
                icon: '📞',
                title: 'اتصل بالعميل',
                description: `لا يوجد تواصل منذ ${context.daysSinceLastContact} يوم. اتصل اليوم.`,
                suggestedDate: new Date(),
                estimatedDuration: 15,
                successProbability: 0.75
            });
        }

        if (context.stage === 'qualified' && context.interactionCount >= 3) {
            suggestions.push({
                action: 'send_proposal',
                priority: 'high',
                icon: '📄',
                title: 'أرسل عرض',
                description: 'العميل مؤهل ومتفاعل. حان وقت إرسال العرض.',
                suggestedDate: new Date(),
                estimatedDuration: 60,
                successProbability: 0.80
            });
        }

        if (context.stage === 'proposal') {
            suggestions.push({
                action: 'schedule_demo',
                priority: 'medium',
                icon: '🎯',
                title: 'حدد موعد عرض توضيحي',
                description: 'عزز العرض بعرض توضيحي للمنتج.',
                suggestedDate: this.getNextBusinessDay(),
                estimatedDuration: 30,
                successProbability: 0.70
            });
        }

        if (context.stage === 'negotiation' && context.isHighValue) {
            suggestions.push({
                action: 'executive_meeting',
                priority: 'critical',
                icon: '👔',
                title: 'اجتماع تنفيذي',
                description: 'صفقة عالية القيمة. رتب اجتماع مع الإدارة.',
                suggestedDate: this.getNextBusinessDay(),
                estimatedDuration: 60,
                successProbability: 0.85
            });
        }

        if (!context.hasRecentActivity && context.interactionCount < 3) {
            suggestions.push({
                action: 'send_email',
                priority: 'medium',
                icon: '📧',
                title: 'أرسل بريد إلكتروني',
                description: 'تواصل خفيف للحفاظ على الاهتمام.',
                suggestedDate: new Date(),
                estimatedDuration: 10,
                successProbability: 0.60
            });
        }

        // Default suggestion
        if (suggestions.length === 0) {
            suggestions.push({
                action: 'follow_up',
                priority: 'low',
                icon: '✅',
                title: 'متابعة روتينية',
                description: 'تابع مع العميل للتحديث.',
                suggestedDate: this.getNextBusinessDay(),
                estimatedDuration: 15,
                successProbability: 0.50
            });
        }

        return suggestions.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Calculate confidence
     */
    static calculateConfidence(context) {
        let confidence = 50;

        if (context.interactionCount >= 5) confidence += 20;
        if (context.hasRecentActivity) confidence += 15;
        if (context.stage === 'negotiation') confidence += 15;

        return Math.min(100, confidence);
    }

    /**
     * Explain reasoning
     */
    static explainReasoning(suggestion, context) {
        return {
            factors: [
                `المرحلة الحالية: ${context.stage}`,
                `آخر تواصل: منذ ${context.daysSinceLastContact} يوم`,
                `عدد التفاعلات: ${context.interactionCount}`,
                `قيمة الصفقة: ${context.isHighValue ? 'عالية' : 'متوسطة'}`
            ],
            conclusion: suggestion.description
        };
    }

    /**
     * Get days since last contact
     */
    static getDaysSinceLastContact(interactions) {
        if (!interactions || interactions.length === 0) return 999;

        const lastInteraction = interactions.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        return Math.ceil((new Date() - new Date(lastInteraction.createdAt)) / (1000 * 60 * 60 * 24));
    }

    /**
     * Get next business day
     */
    static getNextBusinessDay() {
        const date = new Date();
        date.setDate(date.getDate() + 1);

        // Skip weekend
        while (date.getDay() === 0 || date.getDay() === 6) {
            date.setDate(date.getDate() + 1);
        }

        return date;
    }

    /**
     * Batch predictions
     */
    static batchPredict(opportunities, interactionsMap = {}, customersMap = {}) {
        return opportunities.map(opp => ({
            opportunityId: opp.id,
            title: opp.title,
            prediction: this.predictNextAction(
                opp,
                interactionsMap[opp.id] || [],
                customersMap[opp.customerId]
            )
        }));
    }
}
