// Multi-Dimensional Deal Scoring Engine
// AI-powered comprehensive deal evaluation

export class MultiDimensionalDealScoringEngine {
    /**
     * Calculate comprehensive deal score
     */
    static calculateDealScore(opportunity, customer, interactions = []) {
        const scores = {
            value: this.calculateValueScore(opportunity),
            risk: this.calculateRiskScore(opportunity, customer),
            duration: this.calculateDurationScore(opportunity),
            probability: this.calculateProbabilityScore(opportunity, interactions)
        };

        // Weighted total (0-100)
        const totalScore = Math.round(
            (scores.value * 0.30) +
            ((100 - scores.risk) * 0.25) +
            ((100 - scores.duration) * 0.20) +
            (scores.probability * 0.25)
        );

        return {
            totalScore,
            grade: this.getGrade(totalScore),
            breakdown: scores,
            expectedValue: this.calculateExpectedValue(opportunity, totalScore),
            priority: this.calculatePriority(totalScore, opportunity.value),
            recommendations: this.generateRecommendations(scores, opportunity)
        };
    }

    /**
     * Value Score (0-100)
     */
    static calculateValueScore(opportunity) {
        const value = opportunity.value || 0;
        if (value >= 100000) return 100;
        if (value >= 50000) return 80;
        if (value >= 25000) return 60;
        if (value >= 10000) return 40;
        return 20;
    }

    /**
     * Risk Score (0-100, higher = more risk)
     */
    static calculateRiskScore(opportunity, customer) {
        let risk = 0;

        // Stage risk
        const stageRisk = {
            'lead': 80,
            'qualified': 60,
            'proposal': 40,
            'negotiation': 30,
            'won': 0,
            'lost': 100
        };
        risk += (stageRisk[opportunity.stage] || 50) * 0.4;

        // Customer risk
        if (customer) {
            if (!customer.email) risk += 10;
            if (!customer.phone) risk += 10;
            if (customer.type === 'new') risk += 20;
        }

        // Time risk
        const days = Math.ceil((new Date() - new Date(opportunity.createdAt)) / (1000 * 60 * 60 * 24));
        if (days > 90) risk += 20;
        else if (days > 60) risk += 10;

        return Math.min(100, Math.round(risk));
    }

    /**
     * Duration Score (0-100, higher = longer)
     */
    static calculateDurationScore(opportunity) {
        const days = Math.ceil((new Date() - new Date(opportunity.createdAt)) / (1000 * 60 * 60 * 24));

        if (days <= 14) return 20;
        if (days <= 30) return 40;
        if (days <= 60) return 60;
        if (days <= 90) return 80;
        return 100;
    }

    /**
     * Probability Score (0-100)
     */
    static calculateProbabilityScore(opportunity, interactions) {
        let probability = opportunity.probability || 0;

        // Boost based on interactions
        if (interactions.length >= 10) probability += 10;
        else if (interactions.length >= 5) probability += 5;

        // Boost based on stage
        const stageBoost = {
            'lead': 0,
            'qualified': 10,
            'proposal': 20,
            'negotiation': 30
        };
        probability += stageBoost[opportunity.stage] || 0;

        return Math.min(100, probability);
    }

    /**
     * Calculate expected value
     */
    static calculateExpectedValue(opportunity, totalScore) {
        return Math.round(opportunity.value * (totalScore / 100));
    }

    /**
     * Calculate priority
     */
    static calculatePriority(totalScore, value) {
        if (totalScore >= 80 && value >= 50000) return { level: 'critical', label: 'حرج', color: '#ef4444' };
        if (totalScore >= 70 && value >= 25000) return { level: 'high', label: 'عالي', color: '#f59e0b' };
        if (totalScore >= 50) return { level: 'medium', label: 'متوسط', color: '#3b82f6' };
        return { level: 'low', label: 'منخفض', color: '#6b7280' };
    }

    /**
     * Get grade
     */
    static getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    /**
     * Generate recommendations
     */
    static generateRecommendations(scores, opportunity) {
        const recs = [];

        if (scores.risk > 70) {
            recs.push({
                priority: 'high',
                icon: '🚨',
                title: 'خطر عالي',
                description: 'الصفقة معرضة لخطر الفشل. تدخل فوري مطلوب.',
                action: 'mitigate_risk'
            });
        }

        if (scores.duration > 70) {
            recs.push({
                priority: 'medium',
                icon: '⏰',
                title: 'صفقة طويلة',
                description: 'الصفقة تستغرق وقتاً طويلاً. حاول تسريعها.',
                action: 'accelerate'
            });
        }

        if (scores.probability < 50) {
            recs.push({
                priority: 'medium',
                icon: '📈',
                title: 'زيادة الاحتمالية',
                description: 'احتمالية النجاح منخفضة. ركز على زيادتها.',
                action: 'increase_probability'
            });
        }

        return recs;
    }

    /**
     * Batch scoring
     */
    static batchScore(opportunities, customersMap = {}, interactionsMap = {}) {
        return opportunities.map(opp => ({
            opportunityId: opp.id,
            title: opp.title,
            value: opp.value,
            score: this.calculateDealScore(
                opp,
                customersMap[opp.customerId],
                interactionsMap[opp.id] || []
            )
        })).sort((a, b) => b.score.totalScore - a.score.totalScore);
    }
}
