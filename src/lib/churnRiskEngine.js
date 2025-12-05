// Churn Risk Analysis Engine
// Predicts customer churn probability using AI

export class ChurnRiskEngine {
    /**
     * Calculate churn risk for a customer
     */
    static calculateChurnRisk(customer, opportunities = [], interactions = [], payments = []) {
        const factors = {
            engagement: this.calculateEngagementScore(interactions),
            payment: this.calculatePaymentScore(payments),
            activity: this.calculateActivityScore(opportunities),
            satisfaction: this.calculateSatisfactionScore(customer)
        };

        // Risk score (0-100, higher = more risk)
        const riskScore = Math.round(
            ((100 - factors.engagement) * 0.35) +
            ((100 - factors.payment) * 0.30) +
            ((100 - factors.activity) * 0.25) +
            ((100 - factors.satisfaction) * 0.10)
        );

        return {
            riskScore,
            riskLevel: this.getRiskLevel(riskScore),
            churnProbability: riskScore / 100,
            predictedChurnDate: this.predictChurnDate(riskScore),
            factors,
            recommendations: this.generateRetentionStrategies(riskScore, factors)
        };
    }

    /**
     * Engagement Score (0-100)
     */
    static calculateEngagementScore(interactions) {
        if (!interactions || interactions.length === 0) return 0;

        const last30Days = interactions.filter(i => {
            const days = (new Date() - new Date(i.createdAt)) / (1000 * 60 * 60 * 24);
            return days <= 30;
        });

        const count = last30Days.length;
        if (count >= 10) return 100;
        if (count >= 7) return 80;
        if (count >= 5) return 60;
        if (count >= 3) return 40;
        if (count >= 1) return 20;
        return 0;
    }

    /**
     * Payment Score (0-100)
     */
    static calculatePaymentScore(payments) {
        if (!payments || payments.length === 0) return 50;

        const latePayments = payments.filter(p => p.status === 'late').length;
        const totalPayments = payments.length;

        const onTimeRate = ((totalPayments - latePayments) / totalPayments) * 100;
        return Math.round(onTimeRate);
    }

    /**
     * Activity Score (0-100)
     */
    static calculateActivityScore(opportunities) {
        if (!opportunities || opportunities.length === 0) return 0;

        const activeOpps = opportunities.filter(o =>
            o.stage !== 'won' && o.stage !== 'lost' && !o.isArchived
        );

        if (activeOpps.length >= 3) return 100;
        if (activeOpps.length >= 2) return 70;
        if (activeOpps.length >= 1) return 40;
        return 0;
    }

    /**
     * Satisfaction Score (0-100)
     */
    static calculateSatisfactionScore(customer) {
        // Mock - would integrate with feedback system
        return customer.satisfactionScore || 70;
    }

    /**
     * Get risk level
     */
    static getRiskLevel(score) {
        if (score >= 80) return { level: 'critical', label: 'حرج', color: '#ef4444', icon: '🔴' };
        if (score >= 60) return { level: 'high', label: 'عالي', color: '#f97316', icon: '🟠' };
        if (score >= 40) return { level: 'medium', label: 'متوسط', color: '#f59e0b', icon: '🟡' };
        if (score >= 20) return { level: 'low', label: 'منخفض', color: '#3b82f6', icon: '🔵' };
        return { level: 'minimal', label: 'قليل جداً', color: '#10b981', icon: '🟢' };
    }

    /**
     * Predict churn date
     */
    static predictChurnDate(riskScore) {
        if (riskScore < 40) return null;

        const daysUntilChurn = Math.round(180 * (1 - (riskScore / 100)));
        const date = new Date();
        date.setDate(date.getDate() + daysUntilChurn);

        return {
            date,
            daysRemaining: daysUntilChurn,
            confidence: riskScore > 70 ? 80 : 60
        };
    }

    /**
     * Generate retention strategies
     */
    static generateRetentionStrategies(riskScore, factors) {
        const strategies = [];

        if (riskScore >= 60) {
            strategies.push({
                priority: 'critical',
                icon: '🎁',
                title: 'عرض خاص للاحتفاظ',
                description: 'قدم خصم أو عرض خاص للاحتفاظ بالعميل.',
                action: 'special_offer'
            });
        }

        if (factors.engagement < 40) {
            strategies.push({
                priority: 'high',
                icon: '📞',
                title: 'زيادة التواصل',
                description: 'التفاعل منخفض. تواصل مع العميل فوراً.',
                action: 'increase_engagement'
            });
        }

        if (factors.payment < 60) {
            strategies.push({
                priority: 'high',
                icon: '💳',
                title: 'خطة دفع مرنة',
                description: 'مشاكل في الدفع. اقترح خطة دفع مرنة.',
                action: 'payment_plan'
            });
        }

        if (factors.satisfaction < 60) {
            strategies.push({
                priority: 'medium',
                icon: '😊',
                title: 'تحسين الرضا',
                description: 'الرضا منخفض. اجمع ملاحظات وحسّن الخدمة.',
                action: 'improve_satisfaction'
            });
        }

        return strategies;
    }

    /**
     * Batch analyze churn risk
     */
    static batchAnalyze(customers, dataMap = {}) {
        return customers.map(customer => ({
            customerId: customer.id,
            name: customer.name,
            risk: this.calculateChurnRisk(
                customer,
                dataMap.opportunities?.[customer.id] || [],
                dataMap.interactions?.[customer.id] || [],
                dataMap.payments?.[customer.id] || []
            )
        })).sort((a, b) => b.risk.riskScore - a.risk.riskScore);
    }
}
