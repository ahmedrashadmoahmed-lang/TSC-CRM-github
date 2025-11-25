// Supplier Scoring Algorithm
export class SupplierScoring {
    constructor() {
        this.weights = {
            onTimeDelivery: 0.35,
            qualityScore: 0.30,
            priceCompetitiveness: 0.20,
            responseTime: 0.10,
            reliability: 0.05,
        };
    }

    // Calculate overall supplier score
    calculateScore(supplier, purchaseOrders) {
        const metrics = this.calculateMetrics(supplier, purchaseOrders);

        const score =
            metrics.onTimeDelivery * this.weights.onTimeDelivery +
            metrics.qualityScore * this.weights.qualityScore +
            metrics.priceCompetitiveness * this.weights.priceCompetitiveness +
            metrics.responseTime * this.weights.responseTime +
            metrics.reliability * this.weights.reliability;

        return {
            overallScore: Number((score * 100).toFixed(2)),
            metrics,
            rating: this.getRating(score * 100),
        };
    }

    // Calculate individual metrics
    calculateMetrics(supplier, purchaseOrders) {
        if (!purchaseOrders || purchaseOrders.length === 0) {
            return {
                onTimeDelivery: 0,
                qualityScore: 0,
                priceCompetitiveness: 0,
                responseTime: 0,
                reliability: 0,
            };
        }

        // On-time delivery rate
        const completedOrders = purchaseOrders.filter(po => po.status === 'completed');
        const onTimeOrders = completedOrders.filter(po => {
            // Assume on-time if delivered within expected date
            return true; // Simplified - would check actual delivery date
        });
        const onTimeDelivery = completedOrders.length > 0
            ? onTimeOrders.length / completedOrders.length
            : 0;

        // Quality score (simplified - would be based on returns/complaints)
        const qualityScore = 0.85; // Placeholder

        // Price competitiveness (simplified - would compare with market)
        const priceCompetitiveness = 0.75; // Placeholder

        // Response time (simplified - would track actual response times)
        const responseTime = 0.80; // Placeholder

        // Reliability (based on order fulfillment rate)
        const totalOrders = purchaseOrders.length;
        const fulfilledOrders = purchaseOrders.filter(
            po => po.status === 'completed' || po.status === 'delivered'
        ).length;
        const reliability = totalOrders > 0 ? fulfilledOrders / totalOrders : 0;

        return {
            onTimeDelivery: Number(onTimeDelivery.toFixed(2)),
            qualityScore: Number(qualityScore.toFixed(2)),
            priceCompetitiveness: Number(priceCompetitiveness.toFixed(2)),
            responseTime: Number(responseTime.toFixed(2)),
            reliability: Number(reliability.toFixed(2)),
        };
    }

    // Get rating based on score
    getRating(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Poor';
    }

    // Get supplier recommendations
    getRecommendations(score, metrics) {
        const recommendations = [];

        if (metrics.onTimeDelivery < 0.8) {
            recommendations.push({
                area: 'On-Time Delivery',
                priority: 'High',
                suggestion: 'Discuss delivery schedules and set clear expectations',
            });
        }

        if (metrics.qualityScore < 0.8) {
            recommendations.push({
                area: 'Quality',
                priority: 'High',
                suggestion: 'Review quality standards and implement quality checks',
            });
        }

        if (metrics.priceCompetitiveness < 0.7) {
            recommendations.push({
                area: 'Pricing',
                priority: 'Medium',
                suggestion: 'Negotiate better pricing or explore alternative suppliers',
            });
        }

        if (metrics.responseTime < 0.7) {
            recommendations.push({
                area: 'Communication',
                priority: 'Medium',
                suggestion: 'Establish better communication channels',
            });
        }

        return recommendations;
    }
}
