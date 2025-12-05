// Quote Comparison Engine
// Compare and evaluate supplier quotes

export const QuoteComparisonEngine = {
    // Scoring weights (total = 100%)
    weights: {
        price: 40,        // 40% weight
        delivery: 30,     // 30% weight
        quality: 20,      // 20% weight (supplier rating)
        terms: 10         // 10% weight (payment terms)
    },

    /**
     * Compare multiple quotes and calculate scores
     */
    compareQuotes(quotes, rfq) {
        if (!quotes || quotes.length === 0) return [];

        // Get max values for normalization
        const maxPrice = Math.max(...quotes.map(q => q.totalPrice));
        const maxDelivery = Math.max(...quotes.map(q => q.deliveryTime));

        // Calculate scores for each quote
        const scoredQuotes = quotes.map(quote => {
            const scores = this.calculateScores(quote, maxPrice, maxDelivery, rfq);
            const totalScore = this.calculateTotalScore(scores);

            return {
                ...quote,
                scores,
                totalScore,
                rank: 0 // Will be set after sorting
            };
        });

        // Sort by total score (highest first) and assign ranks
        scoredQuotes.sort((a, b) => b.totalScore - a.totalScore);
        scoredQuotes.forEach((quote, index) => {
            quote.rank = index + 1;
        });

        return scoredQuotes;
    },

    /**
     * Calculate individual scores
     */
    calculateScores(quote, maxPrice, maxDelivery, rfq) {
        // Price score (lower is better, inverted)
        const priceScore = maxPrice > 0
            ? ((maxPrice - quote.totalPrice) / maxPrice) * 100
            : 0;

        // Delivery score (faster is better, inverted)
        const deliveryScore = maxDelivery > 0
            ? ((maxDelivery - quote.deliveryTime) / maxDelivery) * 100
            : 0;

        // Quality score (supplier rating 0-5 converted to 0-100)
        const qualityScore = (quote.supplier?.rating || 3) * 20;

        // Payment terms score
        const termsScore = this.evaluatePaymentTerms(quote.paymentTerms);

        return {
            price: Math.max(0, Math.min(100, priceScore)),
            delivery: Math.max(0, Math.min(100, deliveryScore)),
            quality: Math.max(0, Math.min(100, qualityScore)),
            terms: termsScore
        };
    },

    /**
     * Calculate weighted total score
     */
    calculateTotalScore(scores) {
        return (
            (scores.price * this.weights.price / 100) +
            (scores.delivery * this.weights.delivery / 100) +
            (scores.quality * this.weights.quality / 100) +
            (scores.terms * this.weights.terms / 100)
        );
    },

    /**
     * Evaluate payment terms
     */
    evaluatePaymentTerms(terms) {
        if (!terms) return 50;

        const lowerTerms = terms.toLowerCase();

        // Best terms
        if (lowerTerms.includes('net 60') || lowerTerms.includes('60 days')) return 100;
        if (lowerTerms.includes('net 45') || lowerTerms.includes('45 days')) return 90;
        if (lowerTerms.includes('net 30') || lowerTerms.includes('30 days')) return 80;

        // Standard terms
        if (lowerTerms.includes('net 15') || lowerTerms.includes('15 days')) return 60;
        if (lowerTerms.includes('net 7') || lowerTerms.includes('7 days')) return 40;

        // Immediate payment
        if (lowerTerms.includes('cod') || lowerTerms.includes('cash')) return 20;
        if (lowerTerms.includes('advance') || lowerTerms.includes('upfront')) return 10;

        return 50; // Default
    },

    /**
     * Get comparison summary
     */
    getComparisonSummary(quotes) {
        if (!quotes || quotes.length === 0) {
            return {
                totalQuotes: 0,
                lowestPrice: 0,
                highestPrice: 0,
                avgPrice: 0,
                fastestDelivery: 0,
                avgDelivery: 0,
                bestScore: 0,
                winner: null
            };
        }

        const prices = quotes.map(q => q.totalPrice);
        const deliveries = quotes.map(q => q.deliveryTime);
        const winner = quotes.find(q => q.rank === 1);

        return {
            totalQuotes: quotes.length,
            lowestPrice: Math.min(...prices),
            highestPrice: Math.max(...prices),
            avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
            fastestDelivery: Math.min(...deliveries),
            avgDelivery: deliveries.reduce((a, b) => a + b, 0) / deliveries.length,
            bestScore: winner?.totalScore || 0,
            winner
        };
    },

    /**
     * Get price difference from lowest
     */
    getPriceDifference(quote, lowestPrice) {
        const diff = quote.totalPrice - lowestPrice;
        const percentage = lowestPrice > 0 ? (diff / lowestPrice) * 100 : 0;
        return {
            amount: diff,
            percentage: Math.round(percentage * 10) / 10
        };
    },

    /**
     * Get recommendation
     */
    getRecommendation(quote, summary) {
        const recommendations = [];

        // Price recommendation
        if (quote.totalPrice === summary.lowestPrice) {
            recommendations.push({
                type: 'success',
                message: 'Lowest price offer'
            });
        } else if (quote.totalPrice > summary.avgPrice * 1.2) {
            recommendations.push({
                type: 'warning',
                message: '20% above average price'
            });
        }

        // Delivery recommendation
        if (quote.deliveryTime === summary.fastestDelivery) {
            recommendations.push({
                type: 'success',
                message: 'Fastest delivery'
            });
        } else if (quote.deliveryTime > summary.avgDelivery * 1.5) {
            recommendations.push({
                type: 'warning',
                message: 'Slower than average delivery'
            });
        }

        // Quality recommendation
        if (quote.scores?.quality >= 80) {
            recommendations.push({
                type: 'success',
                message: 'High quality supplier'
            });
        } else if (quote.scores?.quality < 50) {
            recommendations.push({
                type: 'warning',
                message: 'Lower rated supplier'
            });
        }

        // Overall recommendation
        if (quote.rank === 1) {
            recommendations.push({
                type: 'success',
                message: '⭐ Best overall value'
            });
        }

        return recommendations;
    },

    /**
     * Export comparison to CSV
     */
    exportToCSV(quotes) {
        const headers = [
            'Rank',
            'Supplier',
            'Total Price',
            'Delivery Time',
            'Payment Terms',
            'Price Score',
            'Delivery Score',
            'Quality Score',
            'Terms Score',
            'Total Score'
        ];

        const rows = quotes.map(q => [
            q.rank,
            q.supplier?.name || 'Unknown',
            q.totalPrice,
            `${q.deliveryTime} days`,
            q.paymentTerms || 'N/A',
            q.scores.price.toFixed(1),
            q.scores.delivery.toFixed(1),
            q.scores.quality.toFixed(1),
            q.scores.terms.toFixed(1),
            q.totalScore.toFixed(1)
        ]);

        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    },

    /**
     * Filter quotes by criteria
     */
    filterQuotes(quotes, criteria) {
        let filtered = [...quotes];

        if (criteria.maxPrice) {
            filtered = filtered.filter(q => q.totalPrice <= criteria.maxPrice);
        }

        if (criteria.maxDelivery) {
            filtered = filtered.filter(q => q.deliveryTime <= criteria.maxDelivery);
        }

        if (criteria.minQuality) {
            filtered = filtered.filter(q =>
                (q.supplier?.rating || 0) >= criteria.minQuality
            );
        }

        return filtered;
    }
};

export default QuoteComparisonEngine;
