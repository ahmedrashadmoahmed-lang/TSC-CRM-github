// Advanced Features Engines
// Gamification, Territory, Competitor Intelligence, Deal Rooms

// Gamification Engine
export class GamificationEngine {
    /**
     * Calculate points for an action
     */
    static calculatePoints(action, context = {}) {
        const pointsMap = {
            'deal_won': 100,
            'deal_created': 10,
            'call_made': 5,
            'email_sent': 3,
            'meeting_scheduled': 15,
            'proposal_sent': 20,
            'deal_moved_forward': 10,
            'customer_feedback': 25
        };

        let basePoints = pointsMap[action] || 0;

        // Multipliers
        if (context.dealValue >= 100000) basePoints *= 2;
        if (context.isFirstDealOfMonth) basePoints *= 1.5;
        if (context.streak >= 5) basePoints *= 1.2;

        return Math.round(basePoints);
    }

    /**
     * Check for badge achievements
     */
    static checkBadges(userStats) {
        const badges = [];

        // Deal badges
        if (userStats.totalDeals >= 100) badges.push({ id: 'centurion', name: 'Centurion', icon: '🏆' });
        if (userStats.totalDeals >= 50) badges.push({ id: 'veteran', name: 'Veteran', icon: '⭐' });
        if (userStats.winRate >= 0.8) badges.push({ id: 'closer', name: 'Master Closer', icon: '🎯' });

        // Speed badges
        if (userStats.avgCycleTime <= 14) badges.push({ id: 'speedster', name: 'Speedster', icon: '⚡' });

        // Streak badges
        if (userStats.currentStreak >= 10) badges.push({ id: 'unstoppable', name: 'Unstoppable', icon: '🔥' });
        if (userStats.currentStreak >= 5) badges.push({ id: 'on_fire', name: 'On Fire', icon: '🔥' });

        return badges;
    }

    /**
     * Generate leaderboard
     */
    static generateLeaderboard(users, period = 'month') {
        return users
            .map(user => ({
                userId: user.id,
                name: user.name,
                points: user.points || 0,
                deals: user.deals || 0,
                revenue: user.revenue || 0,
                rank: 0
            }))
            .sort((a, b) => b.points - a.points)
            .map((user, index) => ({
                ...user,
                rank: index + 1,
                badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
            }));
    }
}

// Territory Management Engine
export class TerritoryManagementEngine {
    /**
     * Assign territory to rep
     */
    static assignTerritory(rep, territory, rules = {}) {
        return {
            repId: rep.id,
            territoryId: territory.id,
            territoryName: territory.name,
            assignedAt: new Date(),
            rules: {
                maxAccounts: rules.maxAccounts || 100,
                industries: rules.industries || [],
                regions: rules.regions || []
            }
        };
    }

    /**
     * Calculate territory load
     */
    static calculateLoad(territory, opportunities) {
        const territoryOpps = opportunities.filter(o => o.territoryId === territory.id);

        return {
            territoryId: territory.id,
            totalOpportunities: territoryOpps.length,
            activeOpportunities: territoryOpps.filter(o => !o.isArchived).length,
            totalValue: territoryOpps.reduce((sum, o) => sum + o.value, 0),
            avgDealSize: territoryOpps.length > 0
                ? territoryOpps.reduce((sum, o) => sum + o.value, 0) / territoryOpps.length
                : 0,
            loadScore: this.calculateLoadScore(territoryOpps.length, territory.capacity || 100)
        };
    }

    static calculateLoadScore(current, capacity) {
        const percentage = (current / capacity) * 100;
        if (percentage >= 90) return { score: percentage, status: 'overloaded', color: '#ef4444' };
        if (percentage >= 70) return { score: percentage, status: 'high', color: '#f59e0b' };
        if (percentage >= 50) return { score: percentage, status: 'balanced', color: '#10b981' };
        return { score: percentage, status: 'underutilized', color: '#3b82f6' };
    }

    /**
     * Balance territories
     */
    static balanceTerritories(territories, opportunities) {
        const loads = territories.map(t => this.calculateLoad(t, opportunities));

        const recommendations = [];
        const overloaded = loads.filter(l => l.loadScore.status === 'overloaded');
        const underutilized = loads.filter(l => l.loadScore.status === 'underutilized');

        overloaded.forEach(over => {
            if (underutilized.length > 0) {
                recommendations.push({
                    action: 'redistribute',
                    from: over.territoryId,
                    to: underutilized[0].territoryId,
                    count: Math.ceil((over.totalOpportunities - over.loadScore.score) / 2)
                });
            }
        });

        return {
            loads,
            recommendations,
            balanced: recommendations.length === 0
        };
    }
}

// Competitor Intelligence Engine
export class CompetitorIntelligenceEngine {
    /**
     * Analyze competitor performance
     */
    static analyzeCompetitor(competitorName, lostReasons) {
        const competitorLosses = lostReasons.filter(r =>
            r.competitorName === competitorName
        );

        if (competitorLosses.length === 0) {
            return null;
        }

        const totalValue = competitorLosses.reduce((sum, r) => sum + (r.opportunity?.value || 0), 0);
        const avgPrice = competitorLosses
            .filter(r => r.competitorPrice)
            .reduce((sum, r, _, arr) => sum + r.competitorPrice / arr.length, 0);

        return {
            competitorName,
            lossCount: competitorLosses.length,
            totalValueLost: totalValue,
            avgDealValue: totalValue / competitorLosses.length,
            avgCompetitorPrice: avgPrice,
            winRate: 0, // Would calculate from total opportunities
            commonReasons: this.getCommonReasons(competitorLosses)
        };
    }

    static getCommonReasons(losses) {
        const reasons = {};
        losses.forEach(loss => {
            const reason = loss.subcategory || loss.category;
            reasons[reason] = (reasons[reason] || 0) + 1;
        });

        return Object.entries(reasons)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * Generate battle card
     */
    static generateBattleCard(competitor, analysis) {
        return {
            competitorName: competitor.name,
            strengths: competitor.strengths || [],
            weaknesses: competitor.weaknesses || [],
            pricing: {
                model: competitor.pricingModel,
                avgPrice: analysis.avgCompetitorPrice,
                comparison: 'Lower' // Would calculate
            },
            winStrategies: this.generateWinStrategies(analysis),
            talkingPoints: this.generateTalkingPoints(competitor)
        };
    }

    static generateWinStrategies(analysis) {
        const strategies = [];

        if (analysis.avgCompetitorPrice < analysis.avgDealValue) {
            strategies.push({
                strategy: 'Value Over Price',
                description: 'Emphasize ROI and long-term value'
            });
        }

        analysis.commonReasons.forEach(reason => {
            if (reason.reason.includes('price')) {
                strategies.push({
                    strategy: 'Flexible Pricing',
                    description: 'Offer payment plans or discounts'
                });
            }
        });

        return strategies;
    }

    static generateTalkingPoints(competitor) {
        return [
            'Our superior customer support',
            'Advanced features not available in competitor product',
            'Better integration capabilities',
            'Proven ROI with existing customers'
        ];
    }
}

// Deal Rooms Engine
export class DealRoomsEngine {
    /**
     * Create deal room
     */
    static createDealRoom(opportunity, config = {}) {
        return {
            id: `room_${Date.now()}`,
            opportunityId: opportunity.id,
            name: config.name || `Deal Room - ${opportunity.title}`,
            members: config.members || [],
            documents: [],
            activities: [],
            status: 'active',
            createdAt: new Date()
        };
    }

    /**
     * Add stakeholder
     */
    static addStakeholder(dealRoom, stakeholder) {
        return {
            dealRoomId: dealRoom.id,
            stakeholder: {
                id: stakeholder.id,
                name: stakeholder.name,
                role: stakeholder.role,
                email: stakeholder.email,
                influence: stakeholder.influence || 'medium', // low, medium, high
                sentiment: stakeholder.sentiment || 'neutral' // positive, neutral, negative
            },
            addedAt: new Date()
        };
    }

    /**
     * Track engagement
     */
    static trackEngagement(dealRoom, activities) {
        const engagement = {
            totalActivities: activities.length,
            documentViews: activities.filter(a => a.type === 'document_view').length,
            comments: activities.filter(a => a.type === 'comment').length,
            lastActivity: activities.length > 0
                ? activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp
                : null,
            engagementScore: this.calculateEngagementScore(activities)
        };

        return engagement;
    }

    static calculateEngagementScore(activities) {
        const weights = {
            'document_view': 1,
            'document_download': 3,
            'comment': 5,
            'meeting_attended': 10
        };

        const score = activities.reduce((sum, activity) => {
            return sum + (weights[activity.type] || 0);
        }, 0);

        return Math.min(100, score);
    }

    /**
     * Get deal room health
     */
    static getDealRoomHealth(dealRoom, engagement) {
        const daysSinceLastActivity = dealRoom.activities.length > 0
            ? Math.ceil((new Date() - new Date(engagement.lastActivity)) / (1000 * 60 * 60 * 24))
            : 999;

        let health = 'healthy';
        if (daysSinceLastActivity > 7) health = 'stale';
        if (daysSinceLastActivity > 14) health = 'inactive';
        if (engagement.engagementScore < 20) health = 'low_engagement';

        return {
            status: health,
            engagementScore: engagement.engagementScore,
            daysSinceLastActivity,
            recommendation: this.getHealthRecommendation(health)
        };
    }

    static getHealthRecommendation(health) {
        const recommendations = {
            'healthy': 'Continue current engagement strategy',
            'stale': 'Schedule a follow-up meeting',
            'inactive': 'Urgent: Re-engage stakeholders immediately',
            'low_engagement': 'Share more relevant content'
        };

        return recommendations[health] || 'Monitor closely';
    }
}
