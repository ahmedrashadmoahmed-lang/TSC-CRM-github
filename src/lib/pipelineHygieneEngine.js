// Pipeline Hygiene Rules Engine
// Automatically identifies and manages stale opportunities

export const HYGIENE_RULES = {
    STALE_AFTER_DAYS: 30,      // Mark as stale after 30 days of inactivity
    ARCHIVE_AFTER_DAYS: 60,    // Auto-archive after 60 days
    DELETE_AFTER_DAYS: 180,    // Suggest deletion after 180 days
    INACTIVITY_THRESHOLD: 0    // No interactions
};

export class PipelineHygieneEngine {
    /**
     * Analyze opportunities for hygiene issues
     */
    static analyzeOpportunities(opportunities) {
        const now = new Date();
        const results = {
            healthy: [],
            stale: [],
            needsArchive: [],
            needsAttention: []
        };

        opportunities.forEach(opp => {
            const daysSinceActivity = this.getDaysSinceLastActivity(opp, now);
            const healthStatus = this.calculateHealthStatus(opp, daysSinceActivity);

            const analysis = {
                ...opp,
                daysSinceActivity,
                healthStatus,
                recommendation: this.getRecommendation(healthStatus, daysSinceActivity)
            };

            // Categorize
            if (healthStatus === 'healthy') {
                results.healthy.push(analysis);
            } else if (healthStatus === 'stale') {
                results.stale.push(analysis);
            } else if (healthStatus === 'archive') {
                results.needsArchive.push(analysis);
            } else {
                results.needsAttention.push(analysis);
            }
        });

        return results;
    }

    /**
     * Calculate days since last activity
     */
    static getDaysSinceLastActivity(opportunity, now = new Date()) {
        const lastActivity = opportunity.lastActivityDate
            ? new Date(opportunity.lastActivityDate)
            : new Date(opportunity.createdAt);

        const diffTime = Math.abs(now - lastActivity);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Calculate health status
     */
    static calculateHealthStatus(opportunity, daysSinceActivity) {
        // Already archived
        if (opportunity.isArchived) {
            return 'archived';
        }

        // Already closed (won/lost)
        if (opportunity.stage === 'won' || opportunity.stage === 'lost') {
            return 'closed';
        }

        // Needs archiving
        if (daysSinceActivity >= HYGIENE_RULES.ARCHIVE_AFTER_DAYS) {
            return 'archive';
        }

        // Stale
        if (daysSinceActivity >= HYGIENE_RULES.STALE_AFTER_DAYS) {
            return 'stale';
        }

        // Healthy
        return 'healthy';
    }

    /**
     * Get recommendation for opportunity
     */
    static getRecommendation(healthStatus, daysSinceActivity) {
        switch (healthStatus) {
            case 'archive':
                return {
                    action: 'archive',
                    priority: 'high',
                    message: `لا نشاط منذ ${daysSinceActivity} يوم. يُنصح بالأرشفة.`,
                    icon: '📦'
                };

            case 'stale':
                return {
                    action: 'follow_up',
                    priority: 'medium',
                    message: `لا نشاط منذ ${daysSinceActivity} يوم. تحتاج متابعة.`,
                    icon: '⏰'
                };

            case 'healthy':
                return {
                    action: 'continue',
                    priority: 'low',
                    message: 'الصفقة نشطة ومتابعة جيدة.',
                    icon: '✅'
                };

            default:
                return {
                    action: 'review',
                    priority: 'low',
                    message: 'راجع حالة الصفقة.',
                    icon: '👀'
                };
        }
    }

    /**
     * Auto-archive stale opportunities
     */
    static async autoArchive(opportunities, reason = 'Auto-archived due to inactivity') {
        const toArchive = opportunities.filter(opp => {
            const days = this.getDaysSinceLastActivity(opp);
            return days >= HYGIENE_RULES.ARCHIVE_AFTER_DAYS && !opp.isArchived;
        });

        return {
            count: toArchive.length,
            opportunities: toArchive.map(opp => ({
                id: opp.id,
                title: opp.title,
                daysSinceActivity: this.getDaysSinceLastActivity(opp),
                reason
            }))
        };
    }

    /**
     * Calculate pipeline hygiene score
     */
    static calculateHygieneScore(analysis) {
        const total = analysis.healthy.length +
            analysis.stale.length +
            analysis.needsArchive.length +
            analysis.needsAttention.length;

        if (total === 0) return 100;

        const healthyPercent = (analysis.healthy.length / total) * 100;
        const stalePercent = (analysis.stale.length / total) * 100;
        const archivePercent = (analysis.needsArchive.length / total) * 100;

        // Score calculation
        // Healthy: 100 points
        // Stale: 50 points
        // Archive: 0 points
        const score = (
            (healthyPercent * 1.0) +
            (stalePercent * 0.5) +
            (archivePercent * 0.0)
        );

        return Math.round(score);
    }

    /**
     * Generate hygiene report
     */
    static generateReport(analysis) {
        const score = this.calculateHygieneScore(analysis);
        const total = analysis.healthy.length +
            analysis.stale.length +
            analysis.needsArchive.length;

        return {
            score,
            grade: this.getGrade(score),
            summary: {
                total,
                healthy: analysis.healthy.length,
                stale: analysis.stale.length,
                needsArchive: analysis.needsArchive.length,
                healthyPercent: total > 0 ? Math.round((analysis.healthy.length / total) * 100) : 0,
                stalePercent: total > 0 ? Math.round((analysis.stale.length / total) * 100) : 0,
                archivePercent: total > 0 ? Math.round((analysis.needsArchive.length / total) * 100) : 0
            },
            recommendations: this.generateHygieneRecommendations(analysis, score)
        };
    }

    /**
     * Get grade based on score
     */
    static getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Generate hygiene recommendations
     */
    static generateHygieneRecommendations(analysis, score) {
        const recommendations = [];

        if (analysis.needsArchive.length > 0) {
            recommendations.push({
                priority: 'high',
                icon: '📦',
                title: 'أرشفة الصفقات القديمة',
                description: `${analysis.needsArchive.length} صفقة تحتاج للأرشفة. قم بمراجعتها وأرشفتها.`,
                action: 'archive_deals'
            });
        }

        if (analysis.stale.length > 5) {
            recommendations.push({
                priority: 'medium',
                icon: '⏰',
                title: 'متابعة الصفقات الراكدة',
                description: `${analysis.stale.length} صفقة راكدة. تحتاج متابعة فورية.`,
                action: 'follow_up'
            });
        }

        if (score < 70) {
            recommendations.push({
                priority: 'high',
                icon: '🧹',
                title: 'تنظيف شامل للبايب لاين',
                description: `درجة النظافة ${score}/100. يحتاج البايب لاين لتنظيف شامل.`,
                action: 'deep_clean'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'low',
                icon: '✅',
                title: 'البايب لاين نظيف',
                description: 'استمر في المتابعة الجيدة للصفقات.',
                action: 'continue'
            });
        }

        return recommendations;
    }
}
