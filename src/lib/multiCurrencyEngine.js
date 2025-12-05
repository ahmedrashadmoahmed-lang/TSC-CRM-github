// Multi-Currency Support Engine
// Handles currency conversion, exchange rates, and multi-currency calculations

class MultiCurrencyEngine {
    constructor() {
        // Supported currencies with symbols
        this.supportedCurrencies = {
            EGP: { name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
            USD: { name: 'US Dollar', symbol: '$', decimals: 2 },
            EUR: { name: 'Euro', symbol: '€', decimals: 2 },
            GBP: { name: 'British Pound', symbol: '£', decimals: 2 },
            SAR: { name: 'Saudi Riyal', symbol: 'SR', decimals: 2 },
            AED: { name: 'UAE Dirham', symbol: 'AED', decimals: 2 },
            KWD: { name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3 },
            QAR: { name: 'Qatari Riyal', symbol: 'QR', decimals: 2 },
            BHD: { name: 'Bahraini Dinar', symbol: 'BD', decimals: 3 },
            OMR: { name: 'Omani Rial', symbol: 'OMR', decimals: 3 },
            CNY: { name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
            JPY: { name: 'Japanese Yen', symbol: '¥', decimals: 0 },
            INR: { name: 'Indian Rupee', symbol: '₹', decimals: 2 }
        };

        // Base currency for conversions (typically USD)
        this.baseCurrency = 'USD';

        // Cache for exchange rates
        this.exchangeRatesCache = {
            rates: {},
            lastUpdated: null,
            ttl: 3600000 // 1 hour in milliseconds
        };
    }

    /**
     * Get list of supported currencies
     */
    getSupportedCurrencies() {
        return Object.entries(this.supportedCurrencies).map(([code, info]) => ({
            code,
            ...info
        }));
    }

    /**
     * Fetch latest exchange rates from API
     * In production, integrate with a real API like exchangerate-api.com or openexchangerates.org
     */
    async fetchExchangeRates(baseCurrency = this.baseCurrency) {
        try {
            // Check cache first
            if (this.isCacheValid()) {
                return this.exchangeRatesCache.rates;
            }

            // In production, replace with actual API call
            // Example: const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);

            // Mock exchange rates for development (relative to USD)
            const mockRates = {
                EGP: 30.90,
                USD: 1.00,
                EUR: 0.92,
                GBP: 0.79,
                SAR: 3.75,
                AED: 3.67,
                KWD: 0.31,
                QAR: 3.64,
                BHD: 0.38,
                OMR: 0.38,
                CNY: 7.24,
                JPY: 149.50,
                INR: 83.12
            };

            // Update cache
            this.exchangeRatesCache.rates = mockRates;
            this.exchangeRatesCache.lastUpdated = new Date();

            return mockRates;

        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            // Return cached rates if available, otherwise throw error
            if (this.exchangeRatesCache.rates && Object.keys(this.exchangeRatesCache.rates).length > 0) {
                return this.exchangeRatesCache.rates;
            }
            throw new Error('Failed to fetch exchange rates');
        }
    }

    /**
     * Check if cached exchange rates are still valid
     */
    isCacheValid() {
        if (!this.exchangeRatesCache.lastUpdated) {
            return false;
        }

        const now = new Date();
        const timeDiff = now - this.exchangeRatesCache.lastUpdated;
        return timeDiff < this.exchangeRatesCache.ttl;
    }

    /**
     * Convert amount from one currency to another
     */
    async convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return {
                originalAmount: amount,
                originalCurrency: fromCurrency,
                convertedAmount: amount,
                convertedCurrency: toCurrency,
                exchangeRate: 1,
                timestamp: new Date()
            };
        }

        const rates = await this.fetchExchangeRates();

        if (!rates[fromCurrency] || !rates[toCurrency]) {
            throw new Error(`Currency not supported: ${fromCurrency} or ${toCurrency}`);
        }

        // Convert to base currency (USD) first, then to target currency
        const amountInBase = amount / rates[fromCurrency];
        const convertedAmount = amountInBase * rates[toCurrency];
        const exchangeRate = rates[toCurrency] / rates[fromCurrency];

        return {
            originalAmount: amount,
            originalCurrency: fromCurrency,
            convertedAmount: this.roundToDecimals(convertedAmount, this.supportedCurrencies[toCurrency].decimals),
            convertedCurrency: toCurrency,
            exchangeRate: this.roundToDecimals(exchangeRate, 6),
            timestamp: new Date()
        };
    }

    /**
     * Convert multiple amounts (batch conversion)
     */
    async convertBatch(conversions) {
        const rates = await this.fetchExchangeRates();

        return conversions.map(({ amount, fromCurrency, toCurrency }) => {
            if (fromCurrency === toCurrency) {
                return {
                    originalAmount: amount,
                    originalCurrency: fromCurrency,
                    convertedAmount: amount,
                    convertedCurrency: toCurrency,
                    exchangeRate: 1
                };
            }

            const amountInBase = amount / rates[fromCurrency];
            const convertedAmount = amountInBase * rates[toCurrency];
            const exchangeRate = rates[toCurrency] / rates[fromCurrency];

            return {
                originalAmount: amount,
                originalCurrency: fromCurrency,
                convertedAmount: this.roundToDecimals(convertedAmount, this.supportedCurrencies[toCurrency].decimals),
                convertedCurrency: toCurrency,
                exchangeRate: this.roundToDecimals(exchangeRate, 6)
            };
        });
    }

    /**
     * Format currency value with proper symbol and decimals
     */
    format(amount, currencyCode, options = {}) {
        const currency = this.supportedCurrencies[currencyCode];

        if (!currency) {
            return `${amount} ${currencyCode}`;
        }

        const {
            showSymbol = true,
            showCode = false,
            decimals = currency.decimals
        } = options;

        const formattedAmount = this.roundToDecimals(amount, decimals).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        let result = '';
        if (showSymbol) {
            result = `${currency.symbol} ${formattedAmount}`;
        } else {
            result = formattedAmount;
        }

        if (showCode) {
            result += ` ${currencyCode}`;
        }

        return result;
    }

    /**
     * Round to specific number of decimals
     */
    roundToDecimals(value, decimals) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    }

    /**
     * Calculate total in target currency from mixed currency items
     */
    async calculateTotalInCurrency(items, targetCurrency) {
        const rates = await this.fetchExchangeRates();

        let totalInBase = 0;

        for (const item of items) {
            const { amount, currency } = item;
            const amountInBase = amount / rates[currency];
            totalInBase += amountInBase;
        }

        const totalInTarget = totalInBase * rates[targetCurrency];

        return {
            total: this.roundToDecimals(totalInTarget, this.supportedCurrencies[targetCurrency].decimals),
            currency: targetCurrency,
            breakdown: items.map(item => ({
                ...item,
                convertedAmount: this.roundToDecimals(
                    (item.amount / rates[item.currency]) * rates[targetCurrency],
                    this.supportedCurrencies[targetCurrency].decimals
                )
            }))
        };
    }

    /**
     * Convert RFQ to target currency
     */
    async convertRFQ(rfq, targetCurrency) {
        const rates = await this.fetchExchangeRates();

        // Convert budget
        const convertedBudget = rfq.budget
            ? await this.convert(rfq.budget, rfq.currency || 'EGP', targetCurrency)
            : null;

        // Convert estimated cost
        const convertedEstimatedCost = rfq.estimatedCost
            ? await this.convert(rfq.estimatedCost, rfq.currency || 'EGP', targetCurrency)
            : null;

        // Convert items
        const convertedItems = await Promise.all(
            (rfq.items || []).map(async (item) => {
                const itemCurrency = item.currency || rfq.currency || 'EGP';
                const convertedEstimatedPrice = item.estimatedPrice
                    ? await this.convert(item.estimatedPrice, itemCurrency, targetCurrency)
                    : null;

                return {
                    ...item,
                    originalCurrency: itemCurrency,
                    originalEstimatedPrice: item.estimatedPrice,
                    estimatedPrice: convertedEstimatedPrice?.convertedAmount,
                    currency: targetCurrency
                };
            })
        );

        // Convert quotes
        const convertedQuotes = await Promise.all(
            (rfq.quotes || []).map(async (quote) => {
                const quoteCurrency = quote.currency || rfq.currency || 'EGP';
                const convertedTotal = await this.convert(quote.totalPrice, quoteCurrency, targetCurrency);

                const convertedItems = await Promise.all(
                    (quote.items || []).map(async (item) => {
                        const converted = await this.convert(item.unitPrice, quoteCurrency, targetCurrency);
                        return {
                            ...item,
                            originalCurrency: quoteCurrency,
                            originalUnitPrice: item.unitPrice,
                            unitPrice: converted.convertedAmount,
                            total: this.roundToDecimals(
                                converted.convertedAmount * item.quantity,
                                this.supportedCurrencies[targetCurrency].decimals
                            ),
                            currency: targetCurrency
                        };
                    })
                );

                return {
                    ...quote,
                    originalCurrency: quoteCurrency,
                    originalTotalPrice: quote.totalPrice,
                    totalPrice: convertedTotal.convertedAmount,
                    currency: targetCurrency,
                    items: convertedItems,
                    exchangeRate: convertedTotal.exchangeRate
                };
            })
        );

        return {
            ...rfq,
            originalCurrency: rfq.currency || 'EGP',
            currency: targetCurrency,
            originalBudget: rfq.budget,
            budget: convertedBudget?.convertedAmount,
            originalEstimatedCost: rfq.estimatedCost,
            estimatedCost: convertedEstimatedCost?.convertedAmount,
            items: convertedItems,
            quotes: convertedQuotes,
            conversionTimestamp: new Date(),
            exchangeRates: rates
        };
    }

    /**
     * Get exchange rate between two currencies
     */
    async getExchangeRate(fromCurrency, toCurrency) {
        const rates = await this.fetchExchangeRates();

        if (!rates[fromCurrency] || !rates[toCurrency]) {
            throw new Error(`Currency not supported: ${fromCurrency} or ${toCurrency}`);
        }

        const rate = rates[toCurrency] / rates[fromCurrency];

        return {
            from: fromCurrency,
            to: toCurrency,
            rate: this.roundToDecimals(rate, 6),
            timestamp: new Date(),
            inverse: this.roundToDecimals(1 / rate, 6)
        };
    }

    /**
     * Compare prices in different currencies
     */
    async comparePrices(prices) {
        // Convert all prices to base currency for comparison
        const conversions = await this.convertBatch(
            prices.map(price => ({
                amount: price.amount,
                fromCurrency: price.currency,
                toCurrency: this.baseCurrency
            }))
        );

        const compared = prices.map((price, index) => ({
            ...price,
            amountInBase: conversions[index].convertedAmount,
            baseCurrency: this.baseCurrency
        })).sort((a, b) => a.amountInBase - b.amountInBase);

        return {
            prices: compared,
            lowest: compared[0],
            highest: compared[compared.length - 1],
            baseCurrency: this.baseCurrency
        };
    }

    /**
     * Calculate currency exchange rate trend
     */
    async getCurrencyTrend(currency, historicalRates = []) {
        if (historicalRates.length < 2) {
            return {
                trend: 'stable',
                change: 0,
                changePercent: 0
            };
        }

        const currentRate = historicalRates[historicalRates.length - 1].rate;
        const previousRate = historicalRates[0].rate;
        const change = currentRate - previousRate;
        const changePercent = (change / previousRate) * 100;

        let trend = 'stable';
        if (Math.abs(changePercent) > 1) {
            trend = changePercent > 0 ? 'strengthening' : 'weakening';
        }

        return {
            currency,
            trend,
            change: this.roundToDecimals(change, 6),
            changePercent: this.roundToDecimals(changePercent, 2),
            currentRate,
            previousRate,
            period: {
                from: historicalRates[0].date,
                to: historicalRates[historicalRates.length - 1].date
            }
        };
    }

    /**
     * Validate currency code
     */
    isValidCurrency(currencyCode) {
        return currencyCode in this.supportedCurrencies;
    }

    /**
     * Get currency info
     */
    getCurrencyInfo(currencyCode) {
        return this.supportedCurrencies[currencyCode] || null;
    }
}

// Export singleton instance
const multiCurrencyEngine = new MultiCurrencyEngine();
export default multiCurrencyEngine;
