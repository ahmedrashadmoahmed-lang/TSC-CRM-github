// Cost Estimation AI Engine
// Predict costs for RFQ items using historical data and ML techniques

export const CostEstimationEngine = {
  /**
   * Estimate cost for entire RFQ
   */
  estimateRFQCost(rfqItems, historicalData = [], options = {}) {
    if (!rfqItems || rfqItems.length === 0) {
      return {
        totalEstimate: 0,
        confidence: 0,
        items: [],
        message: 'No items to estimate',
      };
    }

    // Estimate each item
    const estimatedItems = rfqItems.map((item) =>
      this.estimateItemCost(item, historicalData, options)
    );

    // Calculate totals
    const totalEstimate = estimatedItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

    const minTotal = estimatedItems.reduce((sum, item) => sum + (item.range?.low || 0), 0);

    const maxTotal = estimatedItems.reduce((sum, item) => sum + (item.range?.high || 0), 0);

    // Average confidence
    const avgConfidence =
      estimatedItems.reduce((sum, item) => sum + item.confidence, 0) / estimatedItems.length;

    return {
      totalEstimate: Math.round(totalEstimate),
      totalRange: {
        low: Math.round(minTotal),
        high: Math.round(maxTotal),
      },
      confidence: Math.round(avgConfidence),
      items: estimatedItems,
      currency: options.currency || 'EGP',
      estimatedAt: new Date(),
    };
  },

  /**
   * Estimate cost for single item
   */
  estimateItemCost(item, historicalData = [], options = {}) {
    // Find similar historical items
    const similarItems = this.findSimilarItems(item, historicalData);

    if (similarItems.length === 0) {
      return {
        item,
        estimatedCost: null,
        confidence: 0,
        range: { low: 0, high: 0, average: 0 },
        trend: 'unknown',
        message: 'No historical data for similar items',
        basedOn: 0,
      };
    }

    // Extract prices
    const prices = similarItems.map((s) => s.price || s.unitPrice || 0);
    const quantities = similarItems.map((s) => s.quantity || 1);

    // Calculate statistics
    const stats = this.calculatePriceStatistics(prices);
    const trend = this.calculatePriceTrend(similarItems);

    // Apply quantity adjustment
    const quantityFactor = this.getQuantityDiscountFactor(item.quantity, quantities);

    // Base estimate using median (more robust than average)
    // Use nullish coalescing to allow quantity 0
    let estimatedCost = stats.median * (item.quantity ?? 1) * quantityFactor;

    // Apply trend adjustment
    if (trend.direction === 'increasing') {
      estimatedCost *= 1 + trend.rate;
    } else if (trend.direction === 'decreasing') {
      estimatedCost *= 1 - trend.rate;
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(similarItems, stats);

    // Adjust range based on confidence
    const rangeMultiplier = confidence < 50 ? 0.3 : confidence < 75 ? 0.2 : 0.15;
    const range = {
      low: Math.round(estimatedCost * (1 - rangeMultiplier)),
      high: Math.round(estimatedCost * (1 + rangeMultiplier)),
      average: Math.round(estimatedCost),
    };

    return {
      item,
      estimatedCost: Math.round(estimatedCost),
      unitCost: Math.round(estimatedCost / (item.quantity ?? 1)),
      confidence: Math.round(confidence),
      range,
      trend,
      basedOn: similarItems.length,
      recommendations: this.getItemRecommendations(item, stats, trend),
    };
  },

  /**
   * Find similar items in historical data
   */
  findSimilarItems(item, historicalData) {
    const itemName = item.productName?.toLowerCase() || '';
    const itemDesc = item.description?.toLowerCase() || '';
    const keywords = this.extractKeywords(itemName + ' ' + itemDesc);

    return historicalData
      .filter((h) => {
        const histName = h.productName?.toLowerCase() || '';
        const histDesc = h.description?.toLowerCase() || '';

        // Exact name match
        if (histName === itemName) return true;

        // Keyword matching
        const matchedKeywords = keywords.filter(
          (keyword) => histName.includes(keyword) || histDesc.includes(keyword)
        );

        // Need at least 50% keyword match
        return matchedKeywords.length >= keywords.length * 0.5;
      })
      .map((h) => ({
        ...h,
        similarity: this.calculateSimilarity(item, h),
      }))
      .sort((a, b) => b.similarity - a.similarity);
  },

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'from', 'to'];

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Top 5 keywords
  },

  /**
   * Calculate similarity between items
   */
  calculateSimilarity(item1, item2) {
    let similarity = 0;

    // Name similarity (40%)
    const name1 = item1.productName?.toLowerCase() || '';
    const name2 = item2.productName?.toLowerCase() || '';
    if (name1 === name2) {
      similarity += 40;
    } else if (name1.includes(name2) || name2.includes(name1)) {
      similarity += 25;
    } else {
      const keywords1 = this.extractKeywords(name1);
      const keywords2 = this.extractKeywords(name2);
      const commonKeywords = keywords1.filter((k) => keywords2.includes(k)).length;
      similarity += (commonKeywords / Math.max(keywords1.length, 1)) * 20;
    }

    // Unit similarity (20%)
    if (item1.unit === item2.unit) {
      similarity += 20;
    }

    // Quantity similarity (20%)
    if (item1.quantity && item2.quantity) {
      const qtyRatio =
        Math.min(item1.quantity, item2.quantity) / Math.max(item1.quantity, item2.quantity);
      similarity += qtyRatio * 20;
    }

    // Category/specifications similarity (20%)
    const specs1 = JSON.stringify(item1.specifications || {}).toLowerCase();
    const specs2 = JSON.stringify(item2.specifications || {}).toLowerCase();
    if (specs1 === specs2) {
      similarity += 20;
    } else if (specs1 && specs2) {
      const commonWords = this.extractKeywords(specs1).filter((k) => specs2.includes(k)).length;
      similarity += commonWords * 4;
    }

    return similarity;
  },

  /**
   * Calculate price statistics
   */
  calculatePriceStatistics(prices) {
    const sorted = [...prices].sort((a, b) => a - b);
    const sum = prices.reduce((a, b) => a + b, 0);

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: sum / prices.length,
      median: this.calculateMedian(sorted),
      stdDev: this.calculateStdDev(prices, sum / prices.length),
    };
  },

  /**
   * Calculate median
   */
  calculateMedian(sortedArray) {
    const mid = Math.floor(sortedArray.length / 2);
    return sortedArray.length % 2 === 0
      ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
      : sortedArray[mid];
  },

  /**
   * Calculate standard deviation
   */
  calculateStdDev(values, mean) {
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  },

  /**
   * Calculate price trend
   */
  calculatePriceTrend(items) {
    if (items.length < 3) {
      return { direction: 'stable', rate: 0, message: 'Insufficient data' };
    }

    // Sort by date
    const sorted = items.filter((i) => i.date).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sorted.length < 3) {
      return { direction: 'stable', rate: 0, message: 'Insufficient dated data' };
    }

    // Simple linear regression
    const n = sorted.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    sorted.forEach((item, index) => {
      sumX += index;
      sumY += item.price || 0;
      sumXY += index * (item.price || 0);
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgPrice = sumY / n;

    // Calculate trend rate as percentage
    const rate = Math.abs(slope / avgPrice);

    let direction = 'stable';
    if (slope > avgPrice * 0.05) direction = 'increasing';
    else if (slope < -avgPrice * 0.05) direction = 'decreasing';

    return {
      direction,
      rate: Math.min(rate, 0.2), // Cap at 20%
      message: this.getTrendMessage(direction, rate),
    };
  },

  /**
   * Get trend message
   */
  getTrendMessage(direction, rate) {
    if (direction === 'increasing') {
      return `Prices increasing by ~${(rate * 100).toFixed(0)}%`;
    } else if (direction === 'decreasing') {
      return `Prices decreasing by ~${(rate * 100).toFixed(0)}%`;
    }
    return 'Prices relatively stable';
  },

  /**
   * Get quantity discount factor
   */
  getQuantityDiscountFactor(quantity, historicalQuantities) {
    if (!quantity || historicalQuantities.length === 0) {
      return 1;
    }

    const avgQuantity =
      historicalQuantities.reduce((a, b) => a + b, 0) / historicalQuantities.length;

    // Larger quantities typically get discounts
    if (quantity > avgQuantity * 2) {
      return 0.9; // 10% discount for large orders
    } else if (quantity > avgQuantity * 1.5) {
      return 0.95; // 5% discount
    } else if (quantity < avgQuantity * 0.5) {
      return 1.1; // 10% premium for small orders
    }

    return 1; // No adjustment
  },

  /**
   * Calculate confidence level
   */
  calculateConfidence(similarItems, stats) {
    let confidence = 0;

    // Number of data points (40%)
    const dataPoints = similarItems.length;
    if (dataPoints >= 20) confidence += 40;
    else if (dataPoints >= 10) confidence += 35;
    else if (dataPoints >= 5) confidence += 25;
    else if (dataPoints >= 3) confidence += 15;
    else confidence += 5;

    // Price consistency (30%)
    const cv = stats.stdDev / stats.average; // Coefficient of variation
    if (cv < 0.1)
      confidence += 30; // Very consistent
    else if (cv < 0.2)
      confidence += 25; // Consistent
    else if (cv < 0.3)
      confidence += 15; // Moderately consistent
    else confidence += 5; // Inconsistent

    // Similarity score (30%)
    const avgSimilarity =
      similarItems.reduce((sum, item) => sum + (item.similarity || 0), 0) / similarItems.length;
    confidence += (avgSimilarity / 100) * 30;

    return Math.min(confidence, 100);
  },

  /**
   * Get item recommendations
   */
  getItemRecommendations(item, stats, trend) {
    const recommendations = [];

    // Price volatility warning
    const cv = stats.stdDev / stats.average;
    if (cv > 0.3) {
      recommendations.push({
        type: 'warning',
        text: 'High price volatility - consider negotiating',
      });
    }

    // Trend warning
    if (trend.direction === 'increasing') {
      recommendations.push({
        type: 'info',
        text: `Prices trending up - act quickly`,
      });
    } else if (trend.direction === 'decreasing') {
      recommendations.push({
        type: 'success',
        text: 'Prices trending down - good time to buy',
      });
    }

    // Quantity recommendation
    if (item.quantity && item.quantity > 100) {
      recommendations.push({
        type: 'info',
        text: 'Large order - request volume discount',
      });
    }

    return recommendations;
  },

  /**
   * Compare estimate with budget
   */
  compareWithBudget(estimate, budget) {
    if (!budget) {
      return {
        status: 'unknown',
        message: 'No budget specified',
        difference: 0,
      };
    }

    const difference = estimate.totalEstimate - budget;
    const percentDiff = (difference / budget) * 100;

    let status = 'within_budget';
    let message = 'Estimate within budget';

    if (difference > 0) {
      if (percentDiff > 20) {
        status = 'over_budget_high';
        message = `Estimate exceeds budget by ${percentDiff.toFixed(0)}%`;
      } else if (percentDiff > 10) {
        status = 'over_budget_medium';
        message = `Estimate slightly over budget (${percentDiff.toFixed(0)}%)`;
      } else {
        status = 'over_budget_low';
        message = `Estimate marginally over budget (${percentDiff.toFixed(0)}%)`;
      }
    } else if (difference < 0) {
      message = `Estimate under budget by ${Math.abs(percentDiff).toFixed(0)}%`;
    }

    return {
      status,
      message,
      difference: Math.round(difference),
      percentDiff: percentDiff.toFixed(1),
    };
  },
};

export default CostEstimationEngine;
