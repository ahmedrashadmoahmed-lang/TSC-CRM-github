// Price Prediction Engine
// Advanced ML-based price prediction for RFQ items

export const PricePredictionEngine = {
    /**
     * Predict future prices for RFQ items
     */
    predictPrices(items, historicalData, options = {}) {
        const predictions = items.map(item =>
            this.predictItemPrice(item, historicalData, options)
        );

        return {
            predictions,
            totalPredicted: predictions.reduce((sum, p) => sum + (p.predictedPrice || 0), 0),
            confidence: this.calculateAverageConfidence(predictions),
            horizon: options.horizon || 30,
            predictedAt: new Date()
        };
    },

    /**
     * Predict price for single item
     */
    predictItemPrice(item, historicalData, options = {}) {
        const horizon = options.horizon || 30; // days into future
        const similarItems = this.findSimilarItems(item, historicalData);

        if (similarItems.length < 2) {
            return {
                item,
                predictedPrice: null,
                confidence: 0,
                trend: 'unknown',
                message: 'Insufficient historical data for prediction'
            };
        }

        // Time series analysis
        const timeSeries = this.prepareTimeSeries(similarItems);

        // Apply prediction model
        const prediction = this.applyPredictionModel(timeSeries, horizon);

        // Calculate confidence
        const confidence = this.calculatePredictionConfidence(timeSeries, prediction);

        // Detect seasonality
        const seasonality = this.detectSeasonality(timeSeries);

        // Adjust for external factors
        const adjusted = this.adjustForExternalFactors(prediction, options);

        return {
            item,
            predictedPrice: Math.round(adjusted.price),
            priceRange: {
                low: Math.round(adjusted.price * 0.9),
                high: Math.round(adjusted.price * 1.1),
                mostLikely: Math.round(adjusted.price)
            },
            confidence: Math.round(confidence),
            trend: prediction.trend,
            seasonality,
            factors: adjusted.factors,
            basedOn: similarItems.length,
            horizon,
            nextUpdate: this.getNextUpdateDate(timeSeries)
        };
    },

    /**
     * Find similar items in historical data
     */
    findSimilarItems(item, historicalData) {
        const itemName = item.productName?.toLowerCase() || '';

        return historicalData
            .filter(h => {
                const histName = h.productName?.toLowerCase() || '';
                // Exact or partial match
                return histName.includes(itemName) || itemName.includes(histName);
            })
            .filter(h => h.totalPrice && h.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * Prepare time series data
     */
    prepareTimeSeries(items) {
        return items.map(item => ({
            date: new Date(item.date),
            price: item.totalPrice || item.price,
            quantity: item.quantity || 1,
            unitPrice: (item.totalPrice || item.price) / (item.quantity || 1)
        })).sort((a, b) => a.date - b.date);
    },

    /**
     * Apply prediction model (Linear Regression + Moving Average)
     */
    applyPredictionModel(timeSeries, horizon) {
        if (timeSeries.length < 2) {
            return { price: 0, trend: 'unknown' };
        }

        // Linear regression
        const regression = this.linearRegression(timeSeries);

        // Moving average (last 5 data points)
        const movingAvg = this.movingAverage(timeSeries, 5);

        // Exponential smoothing
        const exponential = this.exponentialSmoothing(timeSeries, 0.3);

        // Weighted prediction
        const predictedPrice = (
            regression.predicted * 0.4 +
            movingAvg * 0.3 +
            exponential * 0.3
        );

        return {
            price: predictedPrice,
            trend: regression.slope > 0 ? 'increasing' : regression.slope < 0 ? 'decreasing' : 'stable',
            slope: regression.slope,
            methods: {
                linearRegression: regression.predicted,
                movingAverage: movingAvg,
                exponentialSmoothing: exponential
            }
        };
    },

    /**
     * Linear regression
     */
    linearRegression(timeSeries) {
        const n = timeSeries.length;
        const firstDate = timeSeries[0].date.getTime();

        // Convert dates to days from first date
        const data = timeSeries.map(item => ({
            x: Math.floor((item.date.getTime() - firstDate) / (1000 * 60 * 60 * 24)),
            y: item.unitPrice
        }));

        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        data.forEach(point => {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumX2 += point.x * point.x;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict for last data point
        const lastX = data[data.length - 1].x;
        const predicted = slope * lastX + intercept;

        return {
            slope,
            intercept,
            predicted: Math.max(0, predicted), // Ensure non-negative
            rSquared: this.calculateRSquared(data, slope, intercept)
        };
    },

    /**
     * Calculate R-squared
     */
    calculateRSquared(data, slope, intercept) {
        const yMean = data.reduce((sum, p) => sum + p.y, 0) / data.length;

        let ssRes = 0, ssTot = 0;
        data.forEach(point => {
            const yPred = slope * point.x + intercept;
            ssRes += Math.pow(point.y - yPred, 2);
            ssTot += Math.pow(point.y - yMean, 2);
        });

        return 1 - (ssRes / ssTot);
    },

    /**
     * Moving average
     */
    movingAverage(timeSeries, window) {
        if (timeSeries.length === 0) return 0;

        const recent = timeSeries.slice(-Math.min(window, timeSeries.length));
        const sum = recent.reduce((total, item) => total + item.unitPrice, 0);

        return sum / recent.length;
    },

    /**
     * Exponential smoothing
     */
    exponentialSmoothing(timeSeries, alpha) {
        if (timeSeries.length === 0) return 0;

        let smoothed = timeSeries[0].unitPrice;

        for (let i = 1; i < timeSeries.length; i++) {
            smoothed = alpha * timeSeries[i].unitPrice + (1 - alpha) * smoothed;
        }

        return smoothed;
    },

    /**
     * Calculate prediction confidence
     */
    calculatePredictionConfidence(timeSeries, prediction) {
        let confidence = 50; // Base confidence

        // More data points = higher confidence
        const dataPoints = timeSeries.length;
        if (dataPoints >= 20) confidence += 30;
        else if (dataPoints >= 10) confidence += 20;
        else if (dataPoints >= 5) confidence += 10;

        // Recent data = higher confidence
        const latestDate = timeSeries[timeSeries.length - 1].date;
        const daysSinceLatest = (new Date() - latestDate) / (1000 * 60 * 60 * 24);

        if (daysSinceLatest <= 7) confidence += 15;
        else if (daysSinceLatest <= 30) confidence += 10;
        else if (daysSinceLatest <= 90) confidence += 5;
        else confidence -= 10;

        // Price stability = higher confidence
        const prices = timeSeries.map(t => t.unitPrice);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const stdDev = Math.sqrt(
            prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
        );
        const cv = (stdDev / avgPrice) * 100;

        if (cv < 10) confidence += 15;
        else if (cv < 20) confidence += 10;
        else if (cv < 30) confidence += 5;
        else confidence -= 5;

        return Math.max(0, Math.min(100, confidence));
    },

    /**
     * Detect seasonality
     */
    detectSeasonality(timeSeries) {
        if (timeSeries.length < 12) {
            return {
                detected: false,
                pattern: 'insufficient_data',
                message: 'Need at least 12 data points to detect seasonality'
            };
        }

        // Group by month
        const monthlyAvg = new Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));

        timeSeries.forEach(item => {
            const month = item.date.getMonth();
            monthlyAvg[month].sum += item.unitPrice;
            monthlyAvg[month].count += 1;
        });

        const monthlyPrices = monthlyAvg.map(m =>
            m.count > 0 ? m.sum / m.count : 0
        ).filter(p => p > 0);

        if (monthlyPrices.length < 6) {
            return {
                detected: false,
                pattern: 'sparse_data',
                message: 'Not enough data points across months'
            };
        }

        // Calculate variance
        const avgPrice = monthlyPrices.reduce((a, b) => a + b, 0) / monthlyPrices.length;
        const variance = monthlyPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / monthlyPrices.length;
        const cv = Math.sqrt(variance) / avgPrice;

        if (cv > 0.15) {
            // Find peak and low months
            const maxMonth = monthlyAvg.findIndex(m =>
                m.count > 0 && m.sum / m.count === Math.max(...monthlyPrices)
            );
            const minMonth = monthlyAvg.findIndex(m =>
                m.count > 0 && m.sum / m.count === Math.min(...monthlyPrices)
            );

            return {
                detected: true,
                pattern: 'seasonal',
                peakMonth: this.getMonthName(maxMonth),
                lowMonth: this.getMonthName(minMonth),
                variance: cv,
                message: `Prices peak in ${this.getMonthName(maxMonth)}, lowest in ${this.getMonthName(minMonth)}`
            };
        }

        return {
            detected: false,
            pattern: 'stable',
            message: 'No significant seasonal pattern detected'
        };
    },

    /**
     * Get month name
     */
    getMonthName(index) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[index];
    },

    /**
     * Adjust for external factors
     */
    adjustForExternalFactors(prediction, options = {}) {
        let adjustedPrice = prediction.price;
        const factors = [];

        // Inflation adjustment
        if (options.inflationRate) {
            const adjustment = adjustedPrice * (options.inflationRate / 100);
            adjustedPrice += adjustment;
            factors.push({
                factor: 'Inflation',
                impact: `+${options.inflationRate}%`,
                adjustment
            });
        }

        // Market demand
        if (options.demandFactor) {
            const adjustment = adjustedPrice * (options.demandFactor / 100);
            adjustedPrice += adjustment;
            factors.push({
                factor: 'Market Demand',
                impact: `${options.demandFactor > 0 ? '+' : ''}${options.demandFactor}%`,
                adjustment
            });
        }

        // Volume discount
        if (options.quantity && options.quantity > 100) {
            const discountRate = Math.min((options.quantity / 1000) * 5, 15); // Max 15% discount
            const adjustment = -adjustedPrice * (discountRate / 100);
            adjustedPrice += adjustment;
            factors.push({
                factor: 'Volume Discount',
                impact: `-${discountRate.toFixed(1)}%`,
                adjustment
            });
        }

        return {
            price: adjustedPrice,
            factors
        };
    },

    /**
     * Calculate average confidence
     */
    calculateAverageConfidence(predictions) {
        if (predictions.length === 0) return 0;

        const totalConfidence = predictions.reduce((sum, p) => sum + (p.confidence || 0), 0);
        return Math.round(totalConfidence / predictions.length);
    },

    /**
     * Get next recommended update date
     */
    getNextUpdateDate(timeSeries) {
        if (timeSeries.length === 0) return null;

        const latestDate = timeSeries[timeSeries.length - 1].date;
        const nextUpdate = new Date(latestDate);
        nextUpdate.setDate(nextUpdate.getDate() + 30); // Update monthly

        return nextUpdate;
    },

    /**
     * Compare prediction with actual
     */
    comparePredictionWithActual(prediction, actualPrice) {
        if (!prediction.predictedPrice || !actualPrice) {
            return {
                accuracy: 0,
                error: 0,
                status: 'unknown'
            };
        }

        const error = Math.abs(actualPrice - prediction.predictedPrice);
        const errorPercentage = (error / actualPrice) * 100;
        const accuracy = Math.max(0, 100 - errorPercentage);

        return {
            accuracy: Math.round(accuracy),
            error: Math.round(error),
            errorPercentage: errorPercentage.toFixed(1),
            status: accuracy >= 80 ? 'excellent' : accuracy >= 60 ? 'good' : accuracy >= 40 ? 'fair' : 'poor',
            message: this.getAccuracyMessage(accuracy)
        };
    },

    /**
     * Get accuracy message
     */
    getAccuracyMessage(accuracy) {
        if (accuracy >= 90) return 'Highly accurate prediction';
        if (accuracy >= 75) return 'Good prediction accuracy';
        if (accuracy >= 60) return 'Acceptable prediction accuracy';
        if (accuracy >= 40) return 'Moderate prediction accuracy';
        return 'Low prediction accuracy - more data needed';
    }
};

export default PricePredictionEngine;
