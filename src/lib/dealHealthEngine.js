// Deal Health Check Engine
// Calculates health score for opportunities based on multiple factors

export class DealHealthEngine {
    /**
     * Calculate comprehensive health score for a deal
     */
    static calculateHealthScore(opportunity, interactions = []) {
        const scores = {
            activity: this.calculateActivityScore(opportunity),
            engagement: this.calculateEngagementScore(interactions),
            velocity: this.calculateVelocityScore(opportunity),
            value: this.calculateValueScore(opportunity),
            stage: this.calculateStageScore(opportunity)
        };

        // Weighted average
        const totalScore = Math.round(
            (scores.activity * 0.30) +
            (scores.engagement * 0.25) +
            (scores.velocity * 0.20) +
            (scores.value * 0.15) +
            (scores.stage * 0.10)
        );

        return {
            totalScore,
            breakdown: scores,
            status: this.getHealthStatus(totalScore),
            recommendations: this.generateRecommendations(totalScore, scores, opportunity)
        };
    }

    /**
     * Activity Score (0-100)
     * Based on recency of last activity
     */
    static calculateActivityScore(opportunity) {
        const lastActivity = opportunity.lastActivityDate
            ? new Date(opportunity.lastActivityDate)
            : new Date(opportunity.createdAt);

        const daysSinceActivity = Math.floor(
            (new Date() - lastActivity) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity <= 3) return 100;
        if (daysSinceActivity <= 7) return 80;
        if (daysSinceActivity <= 14) return 60;
        if (daysSinceActivity <= 30) return 40;
        if (daysSinceActivity <= 60) return 20;
        return 0;
    }

    /**
     * Engagement Score (0-100)
     * Based on number and quality of interactions
     */
    static calculateEngagementScore(interactions) {
        if (!interactions || interactions.length === 0) return 0;

        const last30Days = interactions.filter(i => {
            const date = new Date(i.createdAt);
            const daysAgo = (new Date() - date) / (1000 * 60 * 60 * 24);
            return daysAgo <= 30;
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
     * Velocity Score (0-100)
     * Based on deal progression speed
     */
    static calculateVelocityScore(opportunity) {
        const createdDate = new Date(opportunity.createdAt);
        const daysInPipeline = Math.floor(
            (new Date() - createdDate) / (1000 * 60 * 60 * 24)
        );

        // Expected days per stage
        const expectedDays = {
            'lead': 7,
            'qualified': 14,
            'proposal': 21,
            'negotiation': 30,
            'won': 0,
            'lost': 0
        };

        const expected = expectedDays[opportunity.stage] || 30;

        if (daysInPipeline <= expected * 0.5) return 100; // Moving fast
        if (daysInPipeline <= expected) return 80;        // On track
        if (daysInPipeline <= expected * 1.5) return 60;  // Slightly slow
        if (daysInPipeline <= expected * 2) return 40;    // Slow
        return 20; // Very slow
    }

    /**
     * Value Score (0-100)
     * Based on deal value and probability
     */
    static calculateValueScore(opportunity) {
        const value = opportunity.value || 0;
        const probability = opportunity.probability || 0;

        const expectedValue = value * (probability / 100);

        if (expectedValue >= 100000) return 100;
        if (expectedValue >= 50000) return 80;
        if (expectedValue >= 25000) return 60;
        if (expectedValue >= 10000) return 40;
        if (expectedValue >= 5000) return 20;
        return 10;
    }

    /**
     * Stage Score (0-100)
     * Based on current stage
     */
    static calculateStageScore(opportunity) {
        const stageScores = {
            'lead': 20,
            'qualified': 40,
            'proposal': 60,
            'negotiation': 80,
            'won': 100,
            'lost': 0
        };

        return stageScores[opportunity.stage] || 50;
    }

    /**
     * Get health status
     */
    static getHealthStatus(score) {
        if (score >= 80) return { level: 'healthy', color: 'green', icon: '🟢', label: 'صحي' };
        if (score >= 60) return { level: 'good', color: 'blue', icon: '🔵', label: 'جيد' };
        if (score >= 40) return { level: 'warning', color: 'yellow', icon: '🟡', label: 'يحتاج انتباه' };
        if (score >= 20) return { level: 'critical', color: 'orange', icon: '🟠', label: 'حرج' };
        return { level: 'dying', color: 'red', icon: '🔴', label: 'يحتضر' };
    }

    /**
     * Generate recommendations
     */
    static generateRecommendations(totalScore, scores, opportunity) {
        const recommendations = [];

        // Activity recommendations
        if (scores.activity < 40) {
            recommendations.push({
                priority: 'high',
                icon: '📞',
                title: 'اتصل بالعميل فوراً',
                description: 'لا يوجد نشاط حديث. تواصل مع العميل اليوم.',
                action: 'call_customer'
            });
        }

        // Engagement recommendations
        if (scores.engagement < 40) {
            recommendations.push({
                priority: 'high',
                icon: '💬',
                title: 'زيادة التفاعل',
                description: 'التفاعل منخفض. أرسل عرض أو حدد موعد اجتماع.',
                action: 'increase_engagement'
            });
        }

        // Velocity recommendations
        if (scores.velocity < 40) {
            recommendations.push({
                priority: 'medium',
                icon: '⚡',
                title: 'تسريع الصفقة',
                description: 'الصفقة بطيئة. راجع العوائق وحاول تسريع العملية.',
                action: 'accelerate_deal'
            });
        }

        // Value recommendations
        if (scores.value < 40 && opportunity.probability < 50) {
            recommendations.push({
                priority: 'medium',
                icon: '📈',
                title: 'زيادة احتمالية النجاح',
                description: 'القيمة المتوقعة منخفضة. ركز على زيادة احتمالية الفوز.',
                action: 'increase_probability'
            });
        }

        // Overall health
        if (totalScore < 40) {
            recommendations.push({
                priority: 'high',
                icon: '🚨',
                title: 'صفقة في خطر',
                description: 'الصفقة في حالة حرجة. تدخل فوري مطلوب أو فكر في الأرشفة.',
                action: 'urgent_intervention'
            });
        }

        return recommendations;
    }

    /**
     * Batch calculate health for multiple deals
     */
    static batchCalculateHealth(opportunities, interactionsMap = {}) {
        return opportunities.map(opp => ({
            opportunityId: opp.id,
            title: opp.title,
            health: this.calculateHealthScore(opp, interactionsMap[opp.id] || [])
        })).sort((a, b) => a.health.totalScore - b.health.totalScore); // Worst first
    }
}
