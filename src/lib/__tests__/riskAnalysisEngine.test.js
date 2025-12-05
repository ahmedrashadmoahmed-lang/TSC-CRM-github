/**
 * Unit Tests for Risk Analysis Engine
 * Testing comprehensive risk assessment functionality
 */

import { RiskAnalysisEngine } from '../riskAnalysisEngine';

describe('RiskAnalysisEngine', () => {
    describe('analyzeSupplierRisk', () => {
        test('should return high risk for no suppliers', () => {
            const result = RiskAnalysisEngine.analyzeSupplierRisk([], []);

            expect(result.level.label).toBe('High');
            expect(result.score).toBeGreaterThan(50);
            expect(result.factors).toHaveLength(1);
            expect(result.factors[0].name).toContain('No suppliers');
        });

        test('should return low risk for multiple verified suppliers', () => {
            const suppliers = [
                { id: 1, verified: true, rating: 4.5, categories: ['equipment'] },
                { id: 2, verified: true, rating: 4.2, categories: ['it_hardware'] },
                { id: 3, verified: true, rating: 4.0, categories: ['supplies'] },
            ];
            const historicalData = [
                { supplierId: 1, responded: true },
                { supplierId: 2, responded: true },
            ];

            const result = RiskAnalysisEngine.analyzeSupplierRisk(suppliers, historicalData);

            expect(result.level.label).toBe('Low');
            expect(result.score).toBeLessThan(30);
        });

        test('should detect single supplier dependency risk', () => {
            const suppliers = [{ id: 1, verified: true, rating: 4.5 }];

            const result = RiskAnalysisEngine.analyzeSupplierRisk(suppliers, []);

            expect(result.factors.some(f => f.name.includes('Single supplier'))).toBe(true);
        });

        test('should flag unverified suppliers', () => {
            const suppliers = [
                { id: 1, verified: false, rating: 3.5 },
                { id: 2, verified: false, rating: 3.0 },
            ];

            const result = RiskAnalysisEngine.analyzeSupplierRisk(suppliers, []);

            expect(result.factors.some(f => f.name.includes('unverified'))).toBe(true);
        });

        test('should identify low-rated suppliers', () => {
            const suppliers = [
                { id: 1, verified: true, rating: 2.5 },
            ];

            const result = RiskAnalysisEngine.analyzeSupplierRisk(suppliers, []);

            expect(result.factors.some(f => f.name.includes('low rating'))).toBe(true);
        });
    });

    describe('analyzeFinancialRisk', () => {
        test('should detect major budget overrun', () => {
            const rfq = { budget: 10000 };
            const quotes = [
                { totalPrice: 15000 },
                { totalPrice: 16000 }
            ];

            const result = RiskAnalysisEngine.analyzeFinancialRisk(rfq, quotes);

            expect(result.score).toBeGreaterThan(60);
            expect(result.level.label).toMatch(/High|Critical/);
            expect(result.factors.some(f => f.name.includes('exceed budget'))).toBe(true);
        });

        test('should return low risk when within budget', () => {
            const rfq = { budget: 10000 };
            const quotes = [
                { totalPrice: 8000 },
                { totalPrice: 9000 }
            ];

            const result = RiskAnalysisEngine.analyzeFinancialRisk(rfq, quotes);

            expect(result.score).toBeLessThan(30);
        });

        test('should detect high price volatility', () => {
            const rfq = { budget: 10000 };
            const quotes = [
                { totalPrice: 5000 },
                { totalPrice: 15000 }
            ];

            const result = RiskAnalysisEngine.analyzeFinancialRisk(rfq, quotes);

            expect(result.factors.some(f => f.name.includes('volatility'))).toBe(true);
        });

        test('should handle missing quotes', () => {
            const rfq = { budget: 10000 };

            const result = RiskAnalysisEngine.analyzeFinancialRisk(rfq, []);

            expect(result.factors.some(f => f.name.includes('No quotes'))).toBe(true);
        });
    });

    describe('analyzeDeliveryRisk', () => {
        test('should flag long delivery times', () => {
            const rfq = {};
            const quotes = [
                { deliveryTime: 90 },
                { deliveryTime: 120 }
            ];

            const result = RiskAnalysisEngine.analyzeDeliveryRisk(rfq, quotes);

            expect(result.score).toBeGreaterThan(50);
            expect(result.factors.some(f => f.name.includes('delivery time'))).toBe(true);
        });

        test('should detect tight deadlines', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 3);

            const rfq = { deadline: tomorrow };
            const quotes = [];

            const result = RiskAnalysisEngine.analyzeDeliveryRisk(rfq, quotes);

            expect(result.factors.some(f => f.name.includes('deadline'))).toBe(true);
        });

        test('should handle variance in delivery commitments', () => {
            const rfq = {};
            const quotes = [
                { deliveryTime: 10 },
                { deliveryTime: 60 }
            ];

            const result = RiskAnalysisEngine.analyzeDeliveryRisk(rfq, quotes);

            expect(result.factors.some(f => f.name.includes('variance'))).toBe(true);
        });
    });

    describe('analyzeOverallRisk', () => {
        test('should calculate weighted overall risk', () => {
            const rfq = {
                budget: 10000,
                deadline: new Date('2025-12-31'),
                items: [{ description: 'Test item', specifications: 'Test specs' }]
            };
            const suppliers = [
                { id: 1, verified: true, rating: 4.5 },
                { id: 2, verified: true, rating: 4.2 }
            ];
            const quotes = [
                { totalPrice: 9000, deliveryTime: 30 }
            ];

            const result = RiskAnalysisEngine.analyzeRFQRisk(rfq, suppliers, quotes, []);

            expect(result).toHaveProperty('overallRisk');
            expect(result).toHaveProperty('risks');
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('mitigation');
            expect(result.overallRisk).toHaveProperty('score');
            expect(result.overallRisk).toHaveProperty('level');
        });

        test('should generate recommendations for high-risk areas', () => {
            const rfq = { budget: 5000 };
            const suppliers = [{ id: 1, verified: false, rating: 2.5 }];
            const quotes = [{ totalPrice: 10000, deliveryTime: 90 }];

            const result = RiskAnalysisEngine.analyzeRFQRisk(rfq, suppliers, quotes, []);

            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations[0]).toHaveProperty('category');
            expect(result.recommendations[0]).toHaveProperty('action');
        });

        test('should suggest mitigation strategies', () => {
            const rfq = { budget: 10000 };
            const suppliers = [];
            const quotes = [];

            const result = RiskAnalysisEngine.analyzeRFQRisk(rfq, suppliers, quotes, []);

            expect(result.mitigation.length).toBeGreaterThan(0);
            expect(result.mitigation[0]).toHaveProperty('risk');
            expect(result.mitigation[0]).toHaveProperty('strategies');
        });
    });

    describe('getLevel', () => {
        test('should correctly classify risk levels', () => {
            expect(RiskAnalysisEngine.getLevel(10).label).toBe('Low');
            expect(RiskAnalysisEngine.getLevel(40).label).toBe('Medium');
            expect(RiskAnalysisEngine.getLevel(60).label).toBe('High');
            expect(RiskAnalysisEngine.getLevel(80).label).toBe('Critical');
        });
    });
});
