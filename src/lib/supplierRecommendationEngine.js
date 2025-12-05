// AI Supplier Recommendation Engine
// Intelligent supplier selection based on historical data and performance

export const SupplierRecommendationEngine = {
    /**
     * Recommend best suppliers for an RFQ
     */
    recommendSuppliers(rfq, allSuppliers, historicalData = []) {
        if (!allSuppliers || allSuppliers.length === 0) {
            return [];
        }

        // Score each supplier
        const scoredSuppliers = allSuppliers.map(supplier => {
            const score = this.calculateSupplierScore(supplier, rfq, historicalData);
            const prediction = this.predictQuote(supplier, rfq, historicalData);
            const reasons = this.getRecommendationReasons(supplier, rfq, historicalData);

            return {
                supplier,
                score,
                prediction,
                reasons,
                confidence: this.calculateConfidence(supplier, historicalData)
            };
        });

        // Sort by score (highest first)
        return scoredSuppliers.sort((a, b) => b.score - a.score);
    },

    /**
     * Calculate overall supplier score
     */
    calculateSupplierScore(supplier, rfq, historicalData) {
        const pastPerformance = this.getPastPerformanceScore(supplier, historicalData);
        const categoryMatch = this.getCategoryMatchScore(supplier, rfq);
        const priceCompetitiveness = this.getPriceCompetitivenessScore(supplier, historicalData);
        const reliability = this.getReliabilityScore(supplier);
        const responseRate = this.getResponseRateScore(supplier, historicalData);

        // Weighted scoring
        return (
            pastPerformance * 0.25 +      // 25% - Past performance
            categoryMatch * 0.20 +         // 20% - Category expertise
            priceCompetitiveness * 0.25 +  // 25% - Competitive pricing
            reliability * 0.20 +            // 20% - Reliability
            responseRate * 0.10             // 10% - Response rate
        );
    },

    /**
     * Get past performance score
     */
    getPastPerformanceScore(supplier, historicalData) {
        const supplierQuotes = historicalData.filter(
            h => h.supplierId === supplier.id
        );

        if (supplierQuotes.length === 0) {
            return 50; // Neutral score for new suppliers
        }

        // Factors: selection rate, delivery performance, quality issues
        const selectedCount = supplierQuotes.filter(q => q.isSelected).length;
        const selectionRate = (selectedCount / supplierQuotes.length) * 100;

        // On-time delivery rate (if available)
        const deliveredOnTime = supplierQuotes.filter(
            q => q.deliveredOnTime !== false
        ).length;
        const onTimeRate = (deliveredOnTime / supplierQuotes.length) * 100;

        // Average rating from past orders
        const avgRating = supplier.rating || 3;
        const ratingScore = (avgRating / 5) * 100;

        return (selectionRate * 0.4 + onTimeRate * 0.3 + ratingScore * 0.3);
    },

    /**
     * Get category match score
     */
    getCategoryMatchScore(supplier, rfq) {
        // Check if supplier specializes in RFQ category
        const supplierCategories = supplier.categories || [];
        const rfqCategory = rfq.template || 'general';

        if (supplierCategories.includes(rfqCategory)) {
            return 100; // Perfect match
        }

        // Check for related categories
        const relatedCategories = this.getRelatedCategories(rfqCategory);
        const hasRelated = supplierCategories.some(cat =>
            relatedCategories.includes(cat)
        );

        if (hasRelated) {
            return 70; // Related match
        }

        // General supplier
        return 40;
    },

    /**
     * Get price competitiveness score
     */
    getPriceCompetitivenessScore(supplier, historicalData) {
        const supplierQuotes = historicalData.filter(
            h => h.supplierId === supplier.id && h.totalPrice
        );

        if (supplierQuotes.length === 0) {
            return 50; // Neutral
        }

        // Compare supplier's average prices with market average
        const supplierAvg = supplierQuotes.reduce((sum, q) => sum + q.totalPrice, 0) / supplierQuotes.length;
        const marketAvg = historicalData.reduce((sum, q) => sum + (q.totalPrice || 0), 0) / historicalData.length;

        if (marketAvg === 0) return 50;

        // Lower prices = higher score
        const priceRatio = supplierAvg / marketAvg;

        if (priceRatio <= 0.85) return 100; // 15% below market
        if (priceRatio <= 0.95) return 85;  // 5% below market
        if (priceRatio <= 1.05) return 70;  // Around market price
        if (priceRatio <= 1.15) return 50;  // 15% above market
        return 30; // Expensive
    },

    /**
     * Get reliability score
     */
    getReliabilityScore(supplier) {
        let score = 50; // Base score

        // Business registration and verification
        if (supplier.verified) score += 20;

        // Years in business (if available)
        const yearsInBusiness = supplier.yearsInBusiness || 0;
        if (yearsInBusiness >= 10) score += 15;
        else if (yearsInBusiness >= 5) score += 10;
        else if (yearsInBusiness >= 2) score += 5;

        // Certifications
        if (supplier.certifications && supplier.certifications.length > 0) {
            score += Math.min(supplier.certifications.length * 5, 15);
        }

        return Math.min(score, 100);
    },

    /**
     * Get response rate score
     */
    getResponseRateScore(supplier, historicalData) {
        const rfqsInvited = historicalData.filter(
            h => h.supplierId === supplier.id
        );

        if (rfqsInvited.length === 0) {
            return 50; // Neutral
        }

        const responded = rfqsInvited.filter(h => h.responded).length;
        const responseRate = (responded / rfqsInvited.length) * 100;

        // Check average response time (if available)
        const responseTimes = rfqsInvited
            .filter(h => h.responseTime)
            .map(h => h.responseTime);

        let timeScore = 50;
        if (responseTimes.length > 0) {
            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            // Faster response = higher score
            if (avgResponseTime <= 1) timeScore = 100;      // Same day
            else if (avgResponseTime <= 3) timeScore = 80;  // 1-3 days
            else if (avgResponseTime <= 7) timeScore = 60;  // 3-7 days
            else timeScore = 40;
        }

        return (responseRate * 0.7 + timeScore * 0.3);
    },

    /**
     * Predict quote price and delivery
     */
    predictQuote(supplier, rfq, historicalData) {
        const supplierHistory = historicalData.filter(
            h => h.supplierId === supplier.id
        );

        if (supplierHistory.length === 0) {
            return {
                estimatedPrice: null,
                estimatedDelivery: null,
                confidence: 0,
                message: 'No historical data available'
            };
        }

        // Find similar RFQs (same category or similar budget)
        const similarRFQs = this.findSimilarRFQs(rfq, supplierHistory);

        if (similarRFQs.length === 0) {
            return {
                estimatedPrice: null,
                estimatedDelivery: null,
                confidence: 20,
                message: 'Limited historical data for similar requests'
            };
        }

        // Calculate average price
        const prices = similarRFQs.map(r => r.totalPrice);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Calculate average delivery time
        const deliveries = similarRFQs.map(r => r.deliveryTime || 30);
        const avgDelivery = Math.round(deliveries.reduce((a, b) => a + b, 0) / deliveries.length);

        // Calculate confidence based on data points
        const confidence = Math.min((similarRFQs.length / 10) * 100, 100);

        return {
            estimatedPrice: Math.round(avgPrice),
            priceRange: {
                min: Math.round(minPrice),
                max: Math.round(maxPrice),
                avg: Math.round(avgPrice)
            },
            estimatedDelivery: avgDelivery,
            confidence: Math.round(confidence),
            basedOn: `${similarRFQs.length} similar quote${similarRFQs.length > 1 ? 's' : ''}`
        };
    },

    /**
     * Find similar RFQs
     */
    findSimilarRFQs(rfq, historicalData) {
        return historicalData.filter(h => {
            // Same template/category
            const sameCategory = h.template === rfq.template;

            // Similar budget (within 30%)
            const similarBudget = !rfq.budget || !h.budget ||
                Math.abs(h.budget - rfq.budget) / rfq.budget <= 0.3;

            return sameCategory || similarBudget;
        });
    },

    /**
     * Get recommendation reasons
     */
    getRecommendationReasons(supplier, rfq, historicalData) {
        const reasons = [];

        // Past performance
        const pastOrders = historicalData.filter(h => h.supplierId === supplier.id);
        if (pastOrders.length > 0) {
            const selectedCount = pastOrders.filter(q => q.isSelected).length;
            const selectionRate = (selectedCount / pastOrders.length) * 100;

            if (selectionRate >= 50) {
                reasons.push({
                    type: 'success',
                    text: `Previously selected in ${selectionRate.toFixed(0)}% of RFQs`
                });
            }
        }

        // Category expertise
        if (supplier.categories?.includes(rfq.template)) {
            reasons.push({
                type: 'success',
                text: `Specializes in ${rfq.template}`
            });
        }

        // Competitive pricing
        if (pastOrders.length >= 3) {
            const avgPrice = pastOrders.reduce((sum, q) => sum + (q.totalPrice || 0), 0) / pastOrders.length;
            const marketAvg = historicalData.reduce((sum, q) => sum + (q.totalPrice || 0), 0) / historicalData.length;

            if (avgPrice < marketAvg * 0.9) {
                reasons.push({
                    type: 'success',
                    text: 'Consistently offers competitive prices'
                });
            }
        }

        // High rating
        if (supplier.rating >= 4.5) {
            reasons.push({
                type: 'success',
                text: `Excellent rating: ${supplier.rating}/5 ⭐`
            });
        }

        // Fast response
        const avgResponseTime = pastOrders
            .filter(h => h.responseTime)
            .reduce((sum, h) => sum + h.responseTime, 0) / pastOrders.length;

        if (avgResponseTime <= 2) {
            reasons.push({
                type: 'info',
                text: 'Quick to respond (avg. 1-2 days)'
            });
        }

        // Verified supplier
        if (supplier.verified) {
            reasons.push({
                type: 'info',
                text: 'Verified supplier'
            });
        }

        // Warning for new suppliers
        if (pastOrders.length === 0) {
            reasons.push({
                type: 'warning',
                text: 'No previous orders - new supplier'
            });
        }

        return reasons;
    },

    /**
     * Calculate confidence level
     */
    calculateConfidence(supplier, historicalData) {
        const dataPoints = historicalData.filter(
            h => h.supplierId === supplier.id
        ).length;

        if (dataPoints === 0) return 30;
        if (dataPoints <= 2) return 50;
        if (dataPoints <= 5) return 70;
        if (dataPoints <= 10) return 85;
        return 95;
    },

    /**
     * Get related categories
     */
    getRelatedCategories(category) {
        const categoryMap = {
            'equipment': ['it_hardware', 'construction'],
            'it_hardware': ['equipment', 'software'],
            'software': ['it_hardware', 'services'],
            'supplies': ['raw_materials'],
            'raw_materials': ['supplies'],
            'services': ['software', 'construction'],
            'construction': ['equipment', 'services']
        };

        return categoryMap[category] || [];
    },

    /**
     * Filter suppliers by criteria
     */
    filterSuppliers(suppliers, criteria = {}) {
        let filtered = [...suppliers];

        if (criteria.minRating) {
            filtered = filtered.filter(s => (s.supplier.rating || 0) >= criteria.minRating);
        }

        if (criteria.minScore) {
            filtered = filtered.filter(s => s.score >= criteria.minScore);
        }

        if (criteria.verifiedOnly) {
            filtered = filtered.filter(s => s.supplier.verified);
        }

        if (criteria.category) {
            filtered = filtered.filter(s =>
                s.supplier.categories?.includes(criteria.category)
            );
        }

        return filtered;
    },

    /**
     * Get top N suppliers
     */
    getTopSuppliers(recommendedSuppliers, count = 5) {
        return recommendedSuppliers.slice(0, count);
    }
};

export default SupplierRecommendationEngine;
