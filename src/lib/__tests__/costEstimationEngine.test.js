/**
 * Unit Tests for Cost Estimation Engine
 * Testing cost prediction and estimation functionality
 */

import CostEstimationEngine from '../costEstimationEngine';

describe('CostEstimationEngine', () => {
  describe('estimateItemCost', () => {
    test('should estimate cost based on historical data', () => {
      const item = {
        productName: 'Office Chair',
        quantity: 10,
      };

      const historicalData = [
        { productName: 'Office Chair', unitPrice: 500, quantity: 5 },
        { productName: 'Office Chair', unitPrice: 550, quantity: 8 },
      ];

      const result = CostEstimationEngine.estimateItemCost(item, historicalData);

      expect(result).toHaveProperty('unitCost');
      expect(result).toHaveProperty('estimatedCost');
      expect(result).toHaveProperty('confidence');
      expect(result.unitCost).toBeGreaterThan(0);
    });

    test('should handle no historical data', () => {
      const item = {
        productName: 'New Item',
        quantity: 5,
      };

      const result = CostEstimationEngine.estimateItemCost(item, []);

      expect(result.confidence).toBeLessThan(50);
      expect(result.estimatedCost).toBeNull();
    });

    test('should consider quantity for bulk discount', () => {
      const smallQuantity = {
        productName: 'Widget',
        quantity: 5,
      };

      const largeQuantity = {
        productName: 'Widget',
        quantity: 100,
      };

      const historicalData = [{ productName: 'Widget', unitPrice: 100, quantity: 10 }];

      const smallResult = CostEstimationEngine.estimateItemCost(smallQuantity, historicalData);
      const largeResult = CostEstimationEngine.estimateItemCost(largeQuantity, historicalData);

      expect(largeResult.unitCost).toBeLessThanOrEqual(smallResult.unitCost);
    });
  });

  describe('estimateRFQCost', () => {
    test('should estimate total RFQ cost', () => {
      const items = [
        { productName: 'Chair', quantity: 10 },
        { productName: 'Desk', quantity: 5 },
      ];

      const historicalData = [
        { productName: 'Chair', unitPrice: 500, quantity: 8 },
        { productName: 'Desk', unitPrice: 1000, quantity: 3 },
      ];

      const options = { currency: 'EGP' };

      const result = CostEstimationEngine.estimateRFQCost(items, historicalData, options);

      expect(result).toHaveProperty('totalEstimate');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('currency', 'EGP');
      expect(result.items).toHaveLength(2);
      expect(result.totalEstimate).toBeGreaterThan(0);
    });

    test('should calculate average confidence', () => {
      const items = [
        { productName: 'Item1', quantity: 1 },
        { productName: 'Item2', quantity: 1 },
      ];

      const historicalData = [
        { productName: 'Item1', unitPrice: 100, quantity: 1 },
        { productName: 'Item1', unitPrice: 110, quantity: 1 },
        { productName: 'Item1', unitPrice: 105, quantity: 1 },
      ];

      const result = CostEstimationEngine.estimateRFQCost(items, historicalData);

      expect(result.confidence).toBeGreaterThan(30);
      expect(result.confidence).toBeLessThan(80);
    });
  });

  describe('compareWithBudget', () => {
    test('should detect within budget status', () => {
      const estimate = {
        totalEstimate: 8000,
        currency: 'EGP',
      };

      const result = CostEstimationEngine.compareWithBudget(estimate, 10000);

      expect(result.status).toBe('within_budget');
      expect(result.difference).toBe(-2000);
      expect(Number(result.percentDiff)).toBeCloseTo(-20, 0);
    });

    test('should detect at budget status', () => {
      const estimate = {
        totalEstimate: 9800,
        currency: 'EGP',
      };

      const result = CostEstimationEngine.compareWithBudget(estimate, 10000);
      expect(result.status).toBe('within_budget');
    });

    test('should detect over budget status', () => {
      const estimate = {
        totalEstimate: 12000,
        currency: 'EGP',
      };

      const result = CostEstimationEngine.compareWithBudget(estimate, 10000);
      expect(result.status).toMatch(/over_budget/);
      expect(result.difference).toBe(2000);
    });

    test('should detect significantly over budget', () => {
      const estimate = {
        totalEstimate: 15000,
        currency: 'EGP',
      };

      const result = CostEstimationEngine.compareWithBudget(estimate, 10000);
      expect(result.status).toBe('over_budget_high');
    });
  });

  describe('calculatePriceTrend', () => {
    test('should detect increasing price trend', () => {
      const historicalPrices = [
        { date: '2025-01-01', price: 100 },
        { date: '2025-02-01', price: 110 },
        { date: '2025-03-01', price: 120 },
      ];

      const result = CostEstimationEngine.calculatePriceTrend(historicalPrices);

      expect(result.direction).toBe('increasing');
      expect(result.rate).toBeGreaterThan(0);
    });

    test('should detect decreasing price trend', () => {
      const historicalPrices = [
        { date: '2025-01-01', price: 120 },
        { date: '2025-02-01', price: 110 },
        { date: '2025-03-01', price: 100 },
      ];

      const result = CostEstimationEngine.calculatePriceTrend(historicalPrices);

      expect(result.direction).toBe('decreasing');
      expect(result.rate).toBeGreaterThan(0);
    });

    test('should detect stable prices', () => {
      const historicalPrices = [
        { date: '2025-01-01', price: 100 },
        { date: '2025-02-01', price: 101 },
        { date: '2025-03-01', price: 100 },
      ];

      const result = CostEstimationEngine.calculatePriceTrend(historicalPrices);

      expect(result.direction).toBe('stable');
    });

    test('should handle insufficient data', () => {
      const historicalPrices = [{ date: '2025-01-01', price: 100 }];

      const result = CostEstimationEngine.calculatePriceTrend(historicalPrices);

      expect(result.message).toMatch(/Insufficient/);
    });
  });

  describe('calculateConfidence', () => {
    test('should return high confidence with many data points', () => {
      const similarItems = new Array(20).fill({ similarity: 100 });
      const stats = { stdDev: 10, average: 200 };

      const confidence = CostEstimationEngine.calculateConfidence(similarItems, stats);

      expect(confidence).toBeGreaterThan(70);
    });

    test('should return low confidence with few data points', () => {
      const similarItems = new Array(1).fill({ similarity: 50 });
      const stats = { stdDev: 50, average: 100 };

      const confidence = CostEstimationEngine.calculateConfidence(similarItems, stats);

      expect(confidence).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero quantity', () => {
      const item = { productName: 'Test', quantity: 0 };
      const history = [{ productName: 'Test', unitPrice: 100, quantity: 1 }];
      const resultWithHistory = CostEstimationEngine.estimateItemCost(item, history);

      expect(resultWithHistory.estimatedCost).toBe(0);
    });

    test('should handle empty items array', () => {
      const result = CostEstimationEngine.estimateRFQCost([], []);

      expect(result.totalEstimate).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    test('should handle zero budget', () => {
      const estimate = { totalEstimate: 1000, currency: 'EGP' };
      const result = CostEstimationEngine.compareWithBudget(estimate, 0);

      // Code treats 0 budget as "No budget specified" -> 'unknown'
      expect(result.status).toBe('unknown');
    });
  });
});
