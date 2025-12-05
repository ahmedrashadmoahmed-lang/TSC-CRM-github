// Multi-Currency API for RFQ System
// Handles currency conversion, exchange rates, and multi-currency operations

import { NextResponse } from 'next/server';
import multiCurrencyEngine from '@/lib/multiCurrencyEngine';
import { prisma } from '@/lib/prisma';

/**
 * GET: Fetch exchange rates or currency information
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'rates': {
                // Get current exchange rates
                const baseCurrency = searchParams.get('base') || 'USD';
                const rates = await multiCurrencyEngine.fetchExchangeRates(baseCurrency);

                return NextResponse.json({
                    success: true,
                    data: {
                        rates,
                        baseCurrency,
                        timestamp: new Date()
                    }
                });
            }

            case 'currencies': {
                // Get list of supported currencies
                const currencies = multiCurrencyEngine.getSupportedCurrencies();

                return NextResponse.json({
                    success: true,
                    data: currencies
                });
            }

            case 'info': {
                // Get info for a specific currency
                const code = searchParams.get('code');
                if (!code) {
                    return NextResponse.json({
                        success: false,
                        error: 'Currency code required'
                    }, { status: 400 });
                }

                const info = multiCurrencyEngine.getCurrencyInfo(code);
                if (!info) {
                    return NextResponse.json({
                        success: false,
                        error: 'Currency not found'
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: { code, ...info }
                });
            }

            case 'rate': {
                // Get exchange rate between two currencies
                const from = searchParams.get('from');
                const to = searchParams.get('to');

                if (!from || !to) {
                    return NextResponse.json({
                        success: false,
                        error: 'Both from and to currencies required'
                    }, { status: 400 });
                }

                const rateInfo = await multiCurrencyEngine.getExchangeRate(from, to);

                return NextResponse.json({
                    success: true,
                    data: rateInfo
                });
            }

            default: {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: rates, currencies, info, or rate'
                }, { status: 400 });
            }
        }

    } catch (error) {
        console.error('Error in currency GET:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * POST: Perform currency operations (convert, compare, etc.)
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'convert': {
                // Convert single amount
                const { amount, fromCurrency, toCurrency } = body;

                if (!amount || !fromCurrency || !toCurrency) {
                    return NextResponse.json({
                        success: false,
                        error: 'Amount, fromCurrency, and toCurrency required'
                    }, { status: 400 });
                }

                const result = await multiCurrencyEngine.convert(
                    parseFloat(amount),
                    fromCurrency,
                    toCurrency
                );

                return NextResponse.json({
                    success: true,
                    data: result
                });
            }

            case 'convert-batch': {
                // Convert multiple amounts
                const { conversions } = body;

                if (!conversions || !Array.isArray(conversions)) {
                    return NextResponse.json({
                        success: false,
                        error: 'Conversions array required'
                    }, { status: 400 });
                }

                const results = await multiCurrencyEngine.convertBatch(conversions);

                return NextResponse.json({
                    success: true,
                    data: results
                });
            }

            case 'convert-rfq': {
                // Convert entire RFQ to target currency
                const { rfqId, targetCurrency, tenantId } = body;

                if (!rfqId || !targetCurrency || !tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId, targetCurrency, and tenantId required'
                    }, { status: 400 });
                }

                // Fetch RFQ with all relations
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId },
                    include: {
                        items: true,
                        quotes: {
                            include: {
                                items: true,
                                supplier: true
                            }
                        }
                    }
                });

                if (!rfq) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found'
                    }, { status: 404 });
                }

                if (rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Unauthorized'
                    }, { status: 403 });
                }

                const convertedRFQ = await multiCurrencyEngine.convertRFQ(rfq, targetCurrency);

                return NextResponse.json({
                    success: true,
                    data: convertedRFQ
                });
            }

            case 'compare-prices': {
                // Compare prices in different currencies
                const { prices } = body;

                if (!prices || !Array.isArray(prices)) {
                    return NextResponse.json({
                        success: false,
                        error: 'Prices array required'
                    }, { status: 400 });
                }

                const comparison = await multiCurrencyEngine.comparePrices(prices);

                return NextResponse.json({
                    success: true,
                    data: comparison
                });
            }

            case 'calculate-total': {
                // Calculate total from mixed currency items
                const { items, targetCurrency } = body;

                if (!items || !Array.isArray(items) || !targetCurrency) {
                    return NextResponse.json({
                        success: false,
                        error: 'Items array and targetCurrency required'
                    }, { status: 400 });
                }

                const total = await multiCurrencyEngine.calculateTotalInCurrency(items, targetCurrency);

                return NextResponse.json({
                    success: true,
                    data: total
                });
            }

            case 'format': {
                // Format currency value
                const { amount, currencyCode, options } = body;

                if (amount === undefined || !currencyCode) {
                    return NextResponse.json({
                        success: false,
                        error: 'Amount and currencyCode required'
                    }, { status: 400 });
                }

                const formatted = multiCurrencyEngine.format(
                    parseFloat(amount),
                    currencyCode,
                    options || {}
                );

                return NextResponse.json({
                    success: true,
                    data: { formatted }
                });
            }

            case 'trend': {
                // Get currency trend analysis
                const { currency, historicalRates } = body;

                if (!currency) {
                    return NextResponse.json({
                        success: false,
                        error: 'Currency required'
                    }, { status: 400 });
                }

                const trend = await multiCurrencyEngine.getCurrencyTrend(
                    currency,
                    historicalRates || []
                );

                return NextResponse.json({
                    success: true,
                    data: trend
                });
            }

            default: {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: convert, convert-batch, convert-rfq, compare-prices, calculate-total, format, or trend'
                }, { status: 400 });
            }
        }

    } catch (error) {
        console.error('Error in currency POST:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

