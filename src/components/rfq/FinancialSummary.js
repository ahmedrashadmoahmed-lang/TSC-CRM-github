'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PieChart,
    AlertCircle,
    CheckCircle,
    CreditCard,
    Calendar,
    RefreshCw
} from 'lucide-react';
import styles from './FinancialSummary.module.css';
import CostEstimationEngine from '@/lib/costEstimationEngine';
import multiCurrencyEngine from '@/lib/multiCurrencyEngine';

export default function FinancialSummary({ rfq, quotes = [], displayCurrency = 'EGP' }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState(displayCurrency);

    useEffect(() => {
        calculateFinancialSummary();
    }, [rfq, quotes, selectedCurrency]);

    const calculateFinancialSummary = async () => {
        setLoading(true);

        try {
            // 1. Budget Analysis
            const budgetData = {
                allocated: rfq.budget || 0,
                estimated: rfq.estimatedCost || 0,
                actualLowest: quotes.length > 0 ? Math.min(...quotes.map(q => q.totalPrice)) : 0,
                actualAverage: quotes.length > 0
                    ? quotes.reduce((sum, q) => sum + q.totalPrice, 0) / quotes.length
                    : 0
            };

            // 2. Savings Calculation
            const savings = budgetData.allocated > 0 && budgetData.actualLowest > 0
                ? budgetData.allocated - budgetData.actualLowest
                : 0;
            const savingsPercent = budgetData.allocated > 0
                ? (savings / budgetData.allocated) * 100
                : 0;

            // 3. Cost Breakdown by Category
            const itemsByCategory = {};
            rfq.items?.forEach(item => {
                const category = item.category || 'General';
                if (!itemsByCategory[category]) {
                    itemsByCategory[category] = {
                        category,
                        items: [],
                        totalEstimate: 0
                    };
                }
                itemsByCategory[category].items.push(item);
                itemsByCategory[category].totalEstimate += item.estimatedPrice || 0;
            });

            // 4. Quote Comparison
            const quoteAnalysis = quotes.map(quote => ({
                id: quote.id,
                supplierName: quote.supplier?.name || quote.supplierName || 'Unknown',
                totalPrice: quote.totalPrice,
                deliveryTime: quote.deliveryTime || quote.deliveryDate,
                paymentTerms: quote.paymentTerms,
                isLowest: quote.totalPrice === budgetData.actualLowest,
                savingsVsBudget: budgetData.allocated - quote.totalPrice,
                percentOfBudget: budgetData.allocated > 0
                    ? (quote.totalPrice / budgetData.allocated) * 100
                    : 0
            })).sort((a, b) => a.totalPrice - b.totalPrice);

            // 5. Payment Terms Analysis
            const paymentTermsBreakdown = {};
            quotes.forEach(quote => {
                const terms = quote.paymentTerms || 'Not Specified';
                paymentTermsBreakdown[terms] = (paymentTermsBreakdown[terms] || 0) + 1;
            });

            // 6. Currency Conversion (if needed)
            let convertedBudget = budgetData;
            if (selectedCurrency !== (rfq.currency || 'EGP')) {
                const conversion = await multiCurrencyEngine.convert(
                    budgetData.allocated,
                    rfq.currency || 'EGP',
                    selectedCurrency
                );
                convertedBudget = {
                    ...budgetData,
                    allocated: conversion.convertedAmount,
                    exchangeRate: conversion.exchangeRate
                };
            }

            setSummary({
                budget: convertedBudget,
                savings: {
                    amount: savings,
                    percent: savingsPercent,
                    status: savings > 0 ? 'positive' : savings < 0 ? 'negative' : 'neutral'
                },
                categories: Object.values(itemsByCategory),
                quotes: quoteAnalysis,
                paymentTerms: paymentTermsBreakdown,
                currency: selectedCurrency,
                metrics: {
                    totalQuotes: quotes.length,
                    lowestQuote: budgetData.actualLowest,
                    averageQuote: budgetData.actualAverage,
                    priceRange: quotes.length > 0
                        ? Math.max(...quotes.map(q => q.totalPrice)) - budgetData.actualLowest
                        : 0
                }
            });

        } catch (error) {
            console.error('Error calculating financial summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <RefreshCw className={styles.spinner} size={40} />
                <p>Calculating financial summary...</p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className={styles.error}>
                <AlertCircle size={40} />
                <p>Unable to generate financial summary</p>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return multiCurrencyEngine.format(amount, selectedCurrency);
    };

    return (
        <div className={styles.financialSummary}>
            {/* Header with Currency Selector */}
            <div className={styles.header}>
                <div>
                    <h2>Financial Summary</h2>
                    <p>Comprehensive financial analysis for RFQ: {rfq.rfqNumber}</p>
                </div>
                <div className={styles.currencySelector}>
                    <label>Display Currency:</label>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                        {multiCurrencyEngine.getSupportedCurrencies().map(curr => (
                            <option key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.code}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                {/* Budget Card */}
                <div className={`${styles.kpiCard} ${styles.budgetCard}`}>
                    <div className={styles.kpiIcon}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Allocated Budget</span>
                        <span className={styles.kpiValue}>{formatCurrency(summary.budget.allocated)}</span>
                    </div>
                </div>

                {/* Lowest Quote Card */}
                <div className={`${styles.kpiCard} ${styles.quoteCard}`}>
                    <div className={styles.kpiIcon}>
                        <TrendingDown size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Lowest Quote</span>
                        <span className={styles.kpiValue}>
                            {summary.metrics.lowestQuote > 0
                                ? formatCurrency(summary.metrics.lowestQuote)
                                : 'N/A'
                            }
                        </span>
                    </div>
                </div>

                {/* Savings Card */}
                <div className={`${styles.kpiCard} ${styles[`savings${summary.savings.status.charAt(0).toUpperCase() + summary.savings.status.slice(1)}`]}`}>
                    <div className={styles.kpiIcon}>
                        {summary.savings.status === 'positive' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>
                            {summary.savings.status === 'positive' ? 'Potential Savings' : 'Over Budget'}
                        </span>
                        <span className={styles.kpiValue}>
                            {formatCurrency(Math.abs(summary.savings.amount))}
                            <span className={styles.kpiPercent}>
                                ({Math.abs(summary.savings.percent).toFixed(1)}%)
                            </span>
                        </span>
                    </div>
                </div>

                {/* Average Quote Card */}
                <div className={`${styles.kpiCard} ${styles.avgCard}`}>
                    <div className={styles.kpiIcon}>
                        <PieChart size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Average Quote</span>
                        <span className={styles.kpiValue}>
                            {summary.metrics.averageQuote > 0
                                ? formatCurrency(summary.metrics.averageQuote)
                                : 'N/A'
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Budget vs Actual Chart */}
            <div className={styles.chartSection}>
                <h3>Budget vs Actual Comparison</h3>
                <div className={styles.budgetChart}>
                    <div className={styles.budgetBar}>
                        <div className={styles.budgetBarLabel}>Budget</div>
                        <div className={styles.budgetBarTrack}>
                            <div
                                className={styles.budgetBarFill}
                                style={{ width: '100%', background: '#3b82f6' }}
                            />
                            <span className={styles.budgetBarValue}>
                                {formatCurrency(summary.budget.allocated)}
                            </span>
                        </div>
                    </div>

                    {summary.metrics.lowestQuote > 0 && (
                        <div className={styles.budgetBar}>
                            <div className={styles.budgetBarLabel}>Lowest Quote</div>
                            <div className={styles.budgetBarTrack}>
                                <div
                                    className={styles.budgetBarFill}
                                    style={{
                                        width: `${(summary.metrics.lowestQuote / summary.budget.allocated) * 100}%`,
                                        background: summary.savings.status === 'positive' ? '#10b981' : '#ef4444'
                                    }}
                                />
                                <span className={styles.budgetBarValue}>
                                    {formatCurrency(summary.metrics.lowestQuote)}
                                </span>
                            </div>
                        </div>
                    )}

                    {summary.metrics.averageQuote > 0 && (
                        <div className={styles.budgetBar}>
                            <div className={styles.budgetBarLabel}>Average Quote</div>
                            <div className={styles.budgetBarTrack}>
                                <div
                                    className={styles.budgetBarFill}
                                    style={{
                                        width: `${(summary.metrics.averageQuote / summary.budget.allocated) * 100}%`,
                                        background: '#8b5cf6'
                                    }}
                                />
                                <span className={styles.budgetBarValue}>
                                    {formatCurrency(summary.metrics.averageQuote)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quote Comparison Table */}
            {summary.quotes.length > 0 && (
                <div className={styles.tableSection}>
                    <h3>Quote Comparison</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.quoteTable}>
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Total Price</th>
                                    <th>Savings vs Budget</th>
                                    <th>% of Budget</th>
                                    <th>Payment Terms</th>
                                    <th>Delivery</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.quotes.map((quote, idx) => (
                                    <tr key={quote.id} className={quote.isLowest ? styles.lowestQuote : ''}>
                                        <td>
                                            {quote.supplierName}
                                            {quote.isLowest && (
                                                <span className={styles.lowestBadge}>
                                                    <CheckCircle size={14} /> Lowest
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.priceCell}>
                                            {formatCurrency(quote.totalPrice)}
                                        </td>
                                        <td className={quote.savingsVsBudget > 0 ? styles.positive : styles.negative}>
                                            {quote.savingsVsBudget > 0 ? '+' : ''}
                                            {formatCurrency(quote.savingsVsBudget)}
                                        </td>
                                        <td>{quote.percentOfBudget.toFixed(1)}%</td>
                                        <td>{quote.paymentTerms || 'N/A'}</td>
                                        <td>
                                            {quote.deliveryTime
                                                ? `${quote.deliveryTime} days`
                                                : 'N/A'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {summary.categories.length > 0 && (
                <div className={styles.categorySection}>
                    <h3>Cost Breakdown by Category</h3>
                    <div className={styles.categoryGrid}>
                        {summary.categories.map((cat, idx) => (
                            <div key={idx} className={styles.categoryCard}>
                                <h4>{cat.category}</h4>
                                <p className={styles.categoryTotal}>
                                    {formatCurrency(cat.totalEstimate)}
                                </p>
                                <p className={styles.categoryItems}>
                                    {cat.items.length} item{cat.items.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Terms Summary */}
            {Object.keys(summary.paymentTerms).length > 0 && (
                <div className={styles.paymentSection}>
                    <h3>
                        <CreditCard size={20} />
                        Payment Terms Distribution
                    </h3>
                    <div className={styles.paymentList}>
                        {Object.entries(summary.paymentTerms).map(([terms, count]) => (
                            <div key={terms} className={styles.paymentItem}>
                                <span className={styles.paymentTerms}>{terms}</span>
                                <span className={styles.paymentCount}>
                                    {count} supplier{count > 1 ? 's' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
