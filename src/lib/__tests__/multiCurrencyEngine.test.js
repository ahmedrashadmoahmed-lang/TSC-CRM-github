/**
 * Unit Tests for Multi-Currency Engine
 * Testing currency conversion and exchange rate functionality
 */

import multiCurrencyEngine from '../multiCurrencyEngine';

describe('MultiCurrencyEngine', () => {
    describe('getSupportedCurrencies', () => {
        test('should return list of supported currencies', () => {
            const currencies = multiCurrencyEngine.getSupportedCurrencies();

            expect(Array.isArray(currencies)).toBe(true);
            expect(currencies.length).toBeGreaterThan(0);
            expect(currencies[0]).toHaveProperty('code');
            expect(currencies[0]).toHaveProperty('name');
            expect(currencies[0]).toHaveProperty('symbol');
        });

        test('should include common currencies', () => {
            const currencies = multiCurrencyEngine.getSupportedCurrencies();
            const codes = currencies.map(c => c.code);

            expect(codes).toContain('USD');
            expect(codes).toContain('EUR');
            expect(codes).toContain('EGP');
            expect(codes).toContain('GBP');
        });
    });

    describe('convert', () => {
        test('should convert between same currency without change', async () => {
            const result = await multiCurrencyEngine.convert(100, 'USD', 'USD');

            expect(result.convertedAmount).toBe(100);
            expect(result.exchangeRate).toBe(1);
        });

        test('should convert between different currencies', async () => {
            const result = await multiCurrencyEngine.convert(100, 'EGP', 'USD');

            expect(result).toHaveProperty('originalAmount');
            expect(result).toHaveProperty('convertedAmount');
            expect(result).toHaveProperty('exchangeRate');
            expect(result).toHaveProperty('originalCurrency', 'EGP');
            expect(result).toHaveProperty('convertedCurrency', 'USD');
            expect(result.convertedAmount).toBeGreaterThan(0);
        });

        test('should throw error for unsupported currency', async () => {
            await expect(
                multiCurrencyEngine.convert(100, 'INVALID', 'USD')
            ).rejects.toThrow();
        });

        test('should include timestamp in conversion result', async () => {
            const result = await multiCurrencyEngine.convert(100, 'USD', 'EUR');

            expect(result).toHaveProperty('timestamp');
            expect(result.timestamp).toBeInstanceOf(Date);
        });
    });

    describe('format', () => {
        test('should format currency with symbol', () => {
            const formatted = multiCurrencyEngine.format(1234.56, 'USD');

            expect(formatted).toContain('$');
            expect(formatted).toContain('1,234');
        });

        test('should format with correct decimals', () => {
            const formatted = multiCurrencyEngine.format(1234.5678, 'USD');

            expect(formatted).toMatch(/\.56|\.57/); // Allow for rounding
        });

        test('should handle zero decimals for JPY', () => {
            const formatted = multiCurrencyEngine.format(1234.56, 'JPY');

            expect(formatted).not.toContain('.');
        });

        test('should allow hiding symbol', () => {
            const formatted = multiCurrencyEngine.format(1234, 'USD', { showSymbol: false });

            expect(formatted).not.toContain('$');
        });

        test('should show currency code when requested', () => {
            const formatted = multiCurrencyEngine.format(1234, 'USD', { showCode: true });

            expect(formatted).toContain('USD');
        });
    });

    describe('getExchangeRate', () => {
        test('should return exchange rate between currencies', async () => {
            const rate = await multiCurrencyEngine.getExchangeRate('USD', 'EUR');

            expect(rate).toHaveProperty('from', 'USD');
            expect(rate).toHaveProperty('to', 'EUR');
            expect(rate).toHaveProperty('rate');
            expect(rate).toHaveProperty('inverse');
            expect(rate.rate).toBeGreaterThan(0);
        });

        test('should have inverse rate as 1/rate', async () => {
            const rate = await multiCurrencyEngine.getExchangeRate('USD', 'EUR');

            const expectedInverse = 1 / rate.rate;
            expect(Math.abs(rate.inverse - expectedInverse)).toBeLessThan(0.000001);
        });
    });

    describe('isValidCurrency', () => {
        test('should return true for valid currencies', () => {
            expect(multiCurrencyEngine.isValidCurrency('USD')).toBe(true);
            expect(multiCurrencyEngine.isValidCurrency('EUR')).toBe(true);
            expect(multiCurrencyEngine.isValidCurrency('EGP')).toBe(true);
        });

        test('should return false for invalid currencies', () => {
            expect(multiCurrencyEngine.isValidCurrency('INVALID')).toBe(false);
            expect(multiCurrencyEngine.isValidCurrency('')).toBe(false);
            expect(multiCurrencyEngine.isValidCurrency(null)).toBe(false);
        });
    });

    describe('getCurrencyInfo', () => {
        test('should return currency information', () => {
            const info = multiCurrencyEngine.getCurrencyInfo('USD');

            expect(info).toHaveProperty('name');
            expect(info).toHaveProperty('symbol');
            expect(info).toHaveProperty('decimals');
        });

        test('should return null for invalid currency', () => {
            const info = multiCurrencyEngine.getCurrencyInfo('INVALID');

            expect(info).toBeNull();
        });
    });

    describe('roundToDecimals', () => {
        test('should round to specified decimals', () => {
            const rounded = multiCurrencyEngine.roundToDecimals(1.2345, 2);

            expect(rounded).toBe(1.23);
        });

        test('should handle zero decimals', () => {
            const rounded = multiCurrencyEngine.roundToDecimals(1.567, 0);

            expect(rounded).toBe(2);
        });

        test('should handle negative numbers', () => {
            const rounded = multiCurrencyEngine.roundToDecimals(-1.567, 1);

            expect(rounded).toBe(-1.6);
        });
    });

    describe('convertBatch', () => {
        test('should convert multiple amounts', async () => {
            const conversions = [
                { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
                { amount: 200, fromCurrency: 'EGP', toCurrency: 'USD' },
            ];

            const results = await multiCurrencyEngine.convertBatch(conversions);

            expect(results).toHaveLength(2);
            expect(results[0]).toHaveProperty('convertedAmount');
            expect(results[1]).toHaveProperty('convertedAmount');
        });

        test('should handle same currency in batch', async () => {
            const conversions = [
                { amount: 100, fromCurrency: 'USD', toCurrency: 'USD' },
            ];

            const results = await multiCurrencyEngine.convertBatch(conversions);

            expect(results[0].convertedAmount).toBe(100);
            expect(results[0].exchangeRate).toBe(1);
        });
    });
});
