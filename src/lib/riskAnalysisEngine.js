// Risk Analysis Engine
// Comprehensive risk assessment for RFQ and supplier selection

export const RiskAnalysisEngine = {
    // Risk categories
    riskCategories: {
        SUPPLIER: 'supplier',
        FINANCIAL: 'financial',
        DELIVERY: 'delivery',
        QUALITY: 'quality',
        COMPLIANCE: 'compliance',
        MARKET: 'market'
    },

    // Risk levels
    riskLevels: {
        LOW: { value: 1, label: 'Low', color: '#10b981' },
        MEDIUM: { value: 2, label: 'Medium', color: '#f59e0b' },
        HIGH: { value: 3, label: 'High', color: '#ef4444' },
        CRITICAL: { value: 4, label: 'Critical', color: '#dc2626' }
    },

    /**
     * Analyze overall RFQ risk
     */
    analyzeRFQRisk(rfq, suppliers, quotes, historicalData = []) {
        const risks = {
            supplier: this.analyzeSupplierRisk(suppliers, historicalData),
            financial: this.analyzeFinancialRisk(rfq, quotes),
            delivery: this.analyzeDeliveryRisk(rfq, quotes),
            quality: this.analyzeQualityRisk(suppliers, quotes),
            compliance: this.analyzeComplianceRisk(rfq, suppliers),
            market: this.analyzeMarketRisk(rfq, historicalData)
        };

        const overallRisk = this.calculateOverallRisk(risks);
        const recommendations = this.generateRecommendations(risks);
        const mitigation = this.suggestMitigation(risks);

        return {
            risks,
            overallRisk,
            recommendations,
            mitigation,
            score: overallRisk.score,
            level: overallRisk.level,
            assessedAt: new Date()
        };
    },

    /**
     * Analyze supplier risk
     */
    analyzeSupplierRisk(suppliers, historicalData) {
        if (!suppliers || suppliers.length === 0) {
            return {
                level: this.riskLevels.HIGH,
                score: 75,
                factors: [
                    { name: 'No suppliers selected', severity: 'high', impact: 80 }
                ],
                message: 'No suppliers invited to RFQ'
            };
        }

        const factors = [];
        let totalScore = 0;

        // Single supplier risk
        if (suppliers.length === 1) {
            factors.push({
                name: 'Single supplier dependency',
                severity: 'high',
                impact: 70
            });
            totalScore += 70;
        } else if (suppliers.length < 3) {
            factors.push({
                name: 'Limited supplier pool',
                severity: 'medium',
                impact: 40
            });
            totalScore += 40;
        }

        // New suppliers risk
        const newSuppliers = suppliers.filter(s => {
            const history = historicalData.filter(h => h.supplierId === s.id);
            return history.length === 0;
        });

        if (newSuppliers.length > 0) {
            const newSupplierRatio = newSuppliers.length / suppliers.length;
            if (newSupplierRatio > 0.5) {
                factors.push({
                    name: 'Majority are new suppliers',
                    severity: 'medium',
                    impact: 50
                });
                totalScore += 50;
            } else if (newSupplierRatio > 0) {
                factors.push({
                    name: 'Some new suppliers',
                    severity: 'low',
                    impact: 20
                });
                totalScore += 20;
            }
        }

        // Unverified suppliers
        const unverified = suppliers.filter(s => !s.verified);
        if (unverified.length > 0) {
            const unverifiedRatio = unverified.length / suppliers.length;
            if (unverifiedRatio > 0.3) {
                factors.push({
                    name: 'High number of unverified suppliers',
                    severity: 'medium',
                    impact: 40
                });
                totalScore += 40;
            }
        }

        // Low-rated suppliers
        const lowRated = suppliers.filter(s => s.rating && s.rating < 3);
        if (lowRated.length > 0) {
            factors.push({
                name: 'Suppliers with low ratings',
                severity: 'medium',
                impact: 45
            });
            totalScore += 45;
        }

        const avgScore = factors.length > 0 ? totalScore / factors.length : 0;
        const level = this.getLevel(avgScore);

        return {
            level,
            score: Math.round(avgScore),
            factors,
            message: this.generateMessage('supplier', level)
        };
    },

    /**
     * Analyze financial risk
     */
    analyzeFinancialRisk(rfq, quotes) {
        const factors = [];
        let totalScore = 0;

        // Budget risk
        if (rfq.budget) {
            if (!quotes || quotes.length === 0) {
                factors.push({
                    name: 'No quotes to compare with budget',
                    severity: 'medium',
                    impact: 40
                });
                totalScore += 40;
            } else {
                const lowestQuote = Math.min(...quotes.map(q => q.totalPrice));
                const budgetExcess = ((lowestQuote - rfq.budget) / rfq.budget) * 100;

                if (budgetExcess > 30) {
                    factors.push({
                        name: `All quotes exceed budget by ${budgetExcess.toFixed(0)}%`,
                        severity: 'critical',
                        impact: 90
                    });
                    totalScore += 90;
                } else if (budgetExcess > 15) {
                    factors.push({
                        name: `Quotes exceed budget by ${budgetExcess.toFixed(0)}%`,
                        severity: 'high',
                        impact: 70
                    });
                    totalScore += 70;
                } else if (budgetExcess > 0) {
                    factors.push({
                        name: 'Slight budget overrun',
                        severity: 'medium',
                        impact: 40
                    });
                    totalScore += 40;
                }
            }
        }

        // Price volatility
        if (quotes && quotes.length > 1) {
            const prices = quotes.map(q => q.totalPrice);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const stdDev = Math.sqrt(
                prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
            );
            const cv = (stdDev / avgPrice) * 100;

            if (cv > 30) {
                factors.push({
                    name: 'High price volatility between quotes',
                    severity: 'high',
                    impact: 65
                });
                totalScore += 65;
            } else if (cv > 15) {
                factors.push({
                    name: 'Moderate price variance',
                    severity: 'medium',
                    impact: 35
                });
                totalScore += 35;
            }
        }

        // Payment terms risk
        if (quotes && quotes.length > 0) {
            const advancePayment = quotes.filter(q =>
                q.paymentTerms?.toLowerCase().includes('advance') ||
                q.paymentTerms?.toLowerCase().includes('upfront')
            );

            if (advancePayment.length > quotes.length * 0.5) {
                factors.push({
                    name: 'Many suppliers require advance payment',
                    severity: 'medium',
                    impact: 45
                });
                totalScore += 45;
            }
        }

        const avgScore = factors.length > 0 ? totalScore / factors.length : 0;
        const level = this.getLevel(avgScore);

        return {
            level,
            score: Math.round(avgScore),
            factors,
            message: this.generateMessage('financial', level)
        };
    },

    /**
     * Analyze delivery risk
     */
    analyzeDeliveryRisk(rfq, quotes) {
        const factors = [];
        let totalScore = 0;

        if (!quotes || quotes.length === 0) {
            factors.push({
                name: 'No delivery time information',
                severity: 'medium',
                impact: 40
            });
            totalScore += 40;
        } else {
            const deliveryTimes = quotes.map(q => q.deliveryTime || 30);
            const avgDelivery = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
            const maxDelivery = Math.max(...deliveryTimes);

            // Long delivery times
            if (avgDelivery > 60) {
                factors.push({
                    name: `Long average delivery time (${Math.round(avgDelivery)} days)`,
                    severity: 'high',
                    impact: 70
                });
                totalScore += 70;
            } else if (avgDelivery > 30) {
                factors.push({
                    name: `Moderate delivery time (${Math.round(avgDelivery)} days)`,
                    severity: 'medium',
                    impact: 40
                });
                totalScore += 40;
            }

            // Delivery time variance
            const minDelivery = Math.min(...deliveryTimes);
            const variance = ((maxDelivery - minDelivery) / avgDelivery) * 100;

            if (variance > 50) {
                factors.push({
                    name: 'High variance in delivery commitments',
                    severity: 'medium',
                    impact: 45
                });
                totalScore += 45;
            }
        }

        // Deadline pressure
        if (rfq.deadline) {
            const daysUntilDeadline = Math.ceil(
                (new Date(rfq.deadline) - new Date()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilDeadline < 7) {
                factors.push({
                    name: 'Tight deadline - high urgency',
                    severity: 'high',
                    impact: 75
                });
                totalScore += 75;
            } else if (daysUntilDeadline < 14) {
                factors.push({
                    name: 'Limited time for supplier selection',
                    severity: 'medium',
                    impact: 50
                });
                totalScore += 50;
            }
        }

        const avgScore = factors.length > 0 ? totalScore / factors.length : 0;
        const level = this.getLevel(avgScore);

        return {
            level,
            score: Math.round(avgScore),
            factors,
            message: this.generateMessage('delivery', level)
        };
    },

    /**
     * Analyze quality risk
     */
    analyzeQualityRisk(suppliers, quotes) {
        const factors = [];
        let totalScore = 0;

        if (!suppliers || suppliers.length === 0) {
            return {
                level: this.riskLevels.LOW,
                score: 0,
                factors: [],
                message: 'No suppliers to assess'
            };
        }

        // Low supplier ratings
        const ratings = suppliers
            .filter(s => s.rating)
            .map(s => s.rating);

        if (ratings.length > 0) {
            const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

            if (avgRating < 3) {
                factors.push({
                    name: 'Low average supplier rating',
                    severity: 'high',
                    impact: 75
                });
                totalScore += 75;
            } else if (avgRating < 3.5) {
                factors.push({
                    name: 'Below average supplier ratings',
                    severity: 'medium',
                    impact: 50
                });
                totalScore += 50;
            }
        }

        // Missing certifications
        const certified = suppliers.filter(s =>
            s.certifications && s.certifications.length > 0
        );

        if (certified.length === 0) {
            factors.push({
                name: 'No suppliers with certifications',
                severity: 'medium',
                impact: 45
            });
            totalScore += 45;
        }

        const avgScore = factors.length > 0 ? totalScore / factors.length : 0;
        const level = this.getLevel(avgScore);

        return {
            level,
            score: Math.round(avgScore),
            factors,
            message: this.generateMessage('quality', level)
        };
    },

    /**
     * Analyze compliance risk
     */
    analyzeComplianceRisk(rfq, suppliers) {
        const factors = [];
        let totalScore = 0;

        // Missing specifications
        if (!rfq.items || rfq.items.length === 0) {
            factors.push({
                name: 'No item specifications defined',
                severity: 'high',
                impact: 70
            });
            totalScore += 70;
        } else {
            const itemsWithoutSpecs = rfq.items.filter(
                item => !item.specifications && !item.description
            );

            if (itemsWithoutSpecs.length > 0) {
                const ratio = itemsWithoutSpecs.length / rfq.items.length;
                if (ratio > 0.5) {
                    factors.push({
                        name: 'Many items lack detailed specifications',
                        severity: 'medium',
                        impact: 55
                    });
                    totalScore += 55;
                }
            }
        }

        // Unverified suppliers
        if (suppliers && suppliers.length > 0) {
            const unverifiedCount = suppliers.filter(s => !s.verified).length;
            if (unverifiedCount > 0) {
                const ratio = unverifiedCount / suppliers.length;
                if (ratio > 0.5) {
                    factors.push({
                        name: 'Majority of suppliers unverified',
                        severity: 'high',
                        impact: 65
                    });
                    totalScore += 65;
                }
            }
        }

        const avgScore = factors.length > 0 ? totalScore / factors.length : 0;
        const level = this.getLevel(avgScore);

        return {
            level,
            score: Math.round(avgScore),
            factors,
            message: this.generateMessage('compliance', level)
        };
    },

    /**
     * Analyze market risk
     */
    analyzeMarketRisk(rfq, historicalData) {
        const factors = [];
        let totalScore = 0;

        // Price trend analysis
        if (historicalData && historicalData.length >= 3) {
            const recentPrices = historicalData
                .filter(h => h.date && h.totalPrice)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
                .map(h => h.totalPrice);

            if (recentPrices.length >= 3) {
                // Simple trend detection
                const oldAvg = recentPrices.slice(Math.floor(recentPrices.length / 2)).reduce((a, b) => a + b, 0) /
                    recentPrices.slice(Math.floor(recentPrices.length / 2)).length;
                const newAvg = recentPrices.slice(0, Math.floor(recentPrices.length / 2)).reduce((a, b) => a + b, 0) /
                    recentPrices.slice(0, Math.floor(recentPrices.length / 2)).length;

                const trendRate = ((newAvg - oldAvg) / oldAvg) * 100;

                if (trendRate > 15) {
                    factors.push({
                        name: `Prices rising rapidly (${trendRate.toFixed(0)}%)`,
                        severity: 'high',
                        impact: 70
                    });
                    totalScore += 70;
                } else if (trendRate > 5) {
                    factors.push({
                        name: `Moderate price increase trend`,
                        severity: 'medium',
                        impact: 45
                    });
                    totalScore += 45;
                }
            }
        }

        // Limited historical data
        if (!historicalData || historicalData.length < 3) {
            factors.push({
                name: 'Limited market data for analysis',
                severity: 'medium',
                impact: 40
            });
            totalScore += 40;
        }

        const avgScore = factors.length > 0 ? totalScore / factors.length : 0;
        const level = this.getLevel(avgScore);

        return {
            level,
            score: Math.round(avgScore),
            factors,
            message: this.generateMessage('market', level)
        };
    },

    /**
     * Calculate overall risk
     */
    calculateOverallRisk(risks) {
        const weights = {
            supplier: 0.25,
            financial: 0.25,
            delivery: 0.20,
            quality: 0.15,
            compliance: 0.10,
            market: 0.05
        };

        let totalScore = 0;
        Object.keys(weights).forEach(category => {
            totalScore += (risks[category].score || 0) * weights[category];
        });

        const score = Math.round(totalScore);
        const level = this.getLevel(score);

        return {
            score,
            level,
            breakdown: Object.keys(weights).map(category => ({
                category,
                score: risks[category].score || 0,
                weight: weights[category] * 100,
                contribution: (risks[category].score || 0) * weights[category]
            }))
        };
    },

    /**
     * Get risk level from score
     */
    getLevel(score) {
        if (score >= 70) return this.riskLevels.CRITICAL;
        if (score >= 50) return this.riskLevels.HIGH;
        if (score >= 30) return this.riskLevels.MEDIUM;
        return this.riskLevels.LOW;
    },

    /**
     * Generate recommendations
     */
    generateRecommendations(risks) {
        const recommendations = [];

        Object.entries(risks).forEach(([category, risk]) => {
            if (risk.score >= 50) {
                risk.factors.forEach(factor => {
                    if (factor.impact >= 50) {
                        recommendations.push({
                            category,
                            priority: factor.severity,
                            issue: factor.name,
                            action: this.getRecommendedAction(category, factor.name)
                        });
                    }
                });
            }
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    },

    /**
     * Get recommended action
     */
    getRecommendedAction(category, issue) {
        const actions = {
            'Single supplier dependency': 'Invite at least 2-3 additional suppliers',
            'Limited supplier pool': 'Expand supplier search to reduce dependency',
            'Majority are new suppliers': 'Include experienced suppliers for comparison',
            'All quotes exceed budget': 'Revise budget or negotiate with suppliers',
            'High price volatility': 'Request detailed breakdowns and negotiate',
            'Long average delivery time': 'Discuss expedited delivery options',
            'Tight deadline': 'Extend deadline or prioritize critical items',
            'Low average supplier rating': 'Focus on higher-rated suppliers',
            'No suppliers with certifications': 'Verify quality standards and compliance',
            'Missing specifications': 'Add detailed specifications to RFQ',
            'Prices rising rapidly': 'Act quickly or lock in prices',
        };

        for (const [key, action] of Object.entries(actions)) {
            if (issue.includes(key) || key.includes(issue.split(' ')[0])) {
                return action;
            }
        }

        return 'Review and address this risk factor';
    },

    /**
     * Suggest mitigation strategies
     */
    suggestMitigation(risks) {
        const strategies = [];

        // High supplier risk mitigation
        if (risks.supplier.score >= 50) {
            strategies.push({
                risk: 'Supplier Risk',
                strategies: [
                    'Diversify supplier pool',
                    'Conduct supplier audits',
                    'Establish backup suppliers',
                    'Implement supplier scorecards'
                ]
            });
        }

        // High financial risk mitigation
        if (risks.financial.score >= 50) {
            strategies.push({
                risk: 'Financial Risk',
                strategies: [
                    'Negotiate better payment terms',
                    'Request volume discounts',
                    'Consider phased procurement',
                    'Review and adjust budget'
                ]
            });
        }

        // High delivery risk mitigation
        if (risks.delivery.score >= 50) {
            strategies.push({
                risk: 'Delivery Risk',
                strategies: [
                    'Build in buffer time',
                    'Request guaranteed delivery dates',
                    'Consider partial deliveries',
                    'Establish penalty clauses'
                ]
            });
        }

        return strategies;
    },

    /**
     * Generate risk message
     */
    generateMessage(category, level) {
        const messages = {
            supplier: {
                LOW: 'Supplier pool is adequate and reliable',
                MEDIUM: 'Some supplier concerns to address',
                HIGH: 'Significant supplier-related risks identified',
                CRITICAL: 'Critical supplier issues require immediate attention'
            },
            financial: {
                LOW: 'Financial aspects are within acceptable range',
                MEDIUM: 'Some financial concerns to monitor',
                HIGH: 'Significant budget or pricing issues',
                CRITICAL: 'Critical financial risks - major budget concerns'
            },
            delivery: {
                LOW: 'Delivery timelines appear manageable',
                MEDIUM: 'Some delivery timing concerns',
                HIGH: 'Significant delivery schedule risks',
                CRITICAL: 'Critical delivery timeline issues'
            },
            quality: {
                LOW: 'Quality standards appear satisfactory',
                MEDIUM: 'Some quality concerns to verify',
                HIGH: 'Significant quality-related risks',
                CRITICAL: 'Critical quality issues identified'
            },
            compliance: {
                LOW: 'Compliance requirements appear met',
                MEDIUM: 'Some compliance gaps to address',
                HIGH: 'Significant compliance concerns',
                CRITICAL: 'Critical compliance issues'
            },
            market: {
                LOW: 'Market conditions are favorable',
                MEDIUM: 'Some market volatility detected',
                HIGH: 'Unfavorable market conditions',
                CRITICAL: 'Critical market risks'
            }
        };

        return messages[category]?.[level.label] || 'Risk assessment completed';
    }
};

export default RiskAnalysisEngine;
