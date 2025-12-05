// Cost Estimator Component
// Display AI-powered cost estimates for RFQ items

'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Info
} from 'lucide-react';
import styles from './CostEstimator.module.css';
import CostEstimationEngine from '@/lib/costEstimationEngine';

export default function CostEstimator({ rfqItems, historicalData = [], budget = null }) {
    const [estimation, setEstimation] = useState(null);
    const [budgetComparison, setBudgetComparison] = useState(null);

    useEffect(() => {
        if (rfqItems && rfqItems.length > 0) {
            const estimate = CostEstimationEngine.estimateRFQCost(
                rfqItems,
                historicalData,
                { currency: 'EGP' }
            );
            setEstimation(estimate);

            if (budget) {
                const comparison = CostEstimationEngine.compareWithBudget(estimate, budget);
                setBudgetComparison(comparison);
            }
        }
    }, [rfqItems, historicalData, budget]);

    if (!estimation) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Analyzing costs...</p>
            </div>
        );
    }

    const getTrendIcon = (trend) => {
        if (trend.direction === 'increasing') return <TrendingUp size={14} />;
        if (trend.direction === 'decreasing') return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    const getTrendClass = (trend) => {
        if (trend.direction === 'increasing') return styles.trendUp;
        if (trend.direction === 'decreasing') return styles.trendDown;
        return styles.trendStable;
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 75) return styles.confidenceHigh;
        if (confidence >= 50) return styles.confidenceMedium;
        return styles.confidenceLow;
    };

    const getBudgetStatusClass = (status) => {
        if (status === 'within_budget') return styles.budgetGood;
        if (status.startsWith('over_budget_low')) return styles.budgetWarning;
        return styles.budgetDanger;
    };

    return (
        <div className={styles.estimator}>
            {/* Summary Card */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                    <DollarSign size={24} />
                    <div>
                        <h3>Total Estimated Cost</h3>
                        <p>AI-powered prediction based on {estimation.items.filter(i => i.basedOn > 0).length} historical data points</p>
                    </div>
                </div>

                <div className={styles.totalAmount}>
                    <div className={styles.mainAmount}>
                        {estimation.currency} {estimation.totalEstimate.toLocaleString()}
                    </div>
                    {estimation.totalRange && (
                        <div className={styles.range}>
                            Range: {estimation.currency} {estimation.totalRange.low.toLocaleString()} -
                            {estimation.currency} {estimation.totalRange.high.toLocaleString()}
                        </div>
                    )}
                </div>

                <div className={styles.confidenceMeter}>
                    <div className={styles.confidenceLabel}>
                        <span>Confidence Level</span>
                        <span className={`${styles.confidenceValue} ${getConfidenceColor(estimation.confidence)}`}>
                            {estimation.confidence}%
                        </span>
                    </div>
                    <div className={styles.confidenceBar}>
                        <div
                            className={`${styles.confidenceFill} ${getConfidenceColor(estimation.confidence)}`}
                            style={{ width: `${estimation.confidence}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Budget Comparison */}
            {budgetComparison && (
                <div className={`${styles.budgetCard} ${getBudgetStatusClass(budgetComparison.status)}`}>
                    <div className={styles.budgetHeader}>
                        {budgetComparison.status === 'within_budget' ? (
                            <CheckCircle size={20} />
                        ) : (
                            <AlertCircle size={20} />
                        )}
                        <h4>Budget Comparison</h4>
                    </div>

                    <div className={styles.budgetDetails}>
                        <div className={styles.budgetRow}>
                            <span>Budget:</span>
                            <span className={styles.budgetAmount}>EGP {budget.toLocaleString()}</span>
                        </div>
                        <div className={styles.budgetRow}>
                            <span>Estimate:</span>
                            <span className={styles.budgetAmount}>
                                EGP {estimation.totalEstimate.toLocaleString()}
                            </span>
                        </div>
                        <div className={`${styles.budgetRow} ${styles.difference}`}>
                            <span>Difference:</span>
                            <span className={styles.budgetDifference}>
                                {budgetComparison.difference >= 0 ? '+' : ''}
                                EGP {Math.abs(budgetComparison.difference).toLocaleString()}
                                ({budgetComparison.percentDiff}%)
                            </span>
                        </div>
                    </div>

                    <div className={styles.budgetMessage}>
                        <Info size={14} />
                        <span>{budgetComparison.message}</span>
                    </div>
                </div>
            )}

            {/* Items Breakdown */}
            <div className={styles.itemsSection}>
                <h4>Items Breakdown</h4>

                <div className={styles.itemsList}>
                    {estimation.items.map((itemEst, index) => (
                        <div key={index} className={styles.itemCard}>
                            {/* Item Header */}
                            <div className={styles.itemHeader}>
                                <div className={styles.itemInfo}>
                                    <h5>{itemEst.item.productName}</h5>
                                    <p className={styles.itemDesc}>
                                        Qty: {itemEst.item.quantity} {itemEst.item.unit || 'units'}
                                    </p>
                                </div>

                                <div className={styles.itemCost}>
                                    {itemEst.estimatedCost ? (
                                        <>
                                            <div className={styles.costAmount}>
                                                EGP {itemEst.estimatedCost.toLocaleString()}
                                            </div>
                                            <div className={styles.unitCost}>
                                                @ EGP {itemEst.unitCost?.toLocaleString()}/unit
                                            </div>
                                        </>
                                    ) : (
                                        <div className={styles.noCost}>
                                            <AlertCircle size={16} />
                                            No estimate
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Item Details */}
                            {itemEst.estimatedCost && (
                                <div className={styles.itemDetails}>
                                    {/* Confidence */}
                                    <div className={styles.itemStat}>
                                        <span className={styles.statLabel}>Confidence</span>
                                        <div className={styles.miniConfidence}>
                                            <div className={styles.miniBar}>
                                                <div
                                                    className={getConfidenceColor(itemEst.confidence)}
                                                    style={{ width: `${itemEst.confidence}%` }}
                                                />
                                            </div>
                                            <span>{itemEst.confidence}%</span>
                                        </div>
                                    </div>

                                    {/* Range */}
                                    {itemEst.range && (
                                        <div className={styles.itemStat}>
                                            <span className={styles.statLabel}>Price Range</span>
                                            <span className={styles.statValue}>
                                                EGP {itemEst.range.low.toLocaleString()} -
                                                {itemEst.range.high.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Trend */}
                                    {itemEst.trend && (
                                        <div className={styles.itemStat}>
                                            <span className={styles.statLabel}>Trend</span>
                                            <span className={`${styles.trendBadge} ${getTrendClass(itemEst.trend)}`}>
                                                {getTrendIcon(itemEst.trend)}
                                                {itemEst.trend.message}
                                            </span>
                                        </div>
                                    )}

                                    {/* Data Points */}
                                    <div className={styles.itemStat}>
                                        <span className={styles.statLabel}>Based On</span>
                                        <span className={styles.statValue}>
                                            {itemEst.basedOn} historical {itemEst.basedOn === 1 ? 'quote' : 'quotes'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {itemEst.recommendations && itemEst.recommendations.length > 0 && (
                                <div className={styles.recommendations}>
                                    {itemEst.recommendations.map((rec, i) => (
                                        <div
                                            key={i}
                                            className={`${styles.recommendation} ${styles[`rec${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}`]}`}
                                        >
                                            {rec.type === 'success' && <CheckCircle size={12} />}
                                            {rec.type === 'warning' && <AlertCircle size={12} />}
                                            {rec.type === 'info' && <Info size={12} />}
                                            <span>{rec.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No Data Message */}
                            {!itemEst.estimatedCost && (
                                <div className={styles.noDataMessage}>
                                    <Info size={14} />
                                    <span>{itemEst.message}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div className={styles.disclaimer}>
                <Info size={16} />
                <p>
                    These estimates are AI-generated predictions based on historical data and market trends.
                    Actual quotes may vary. Use as a general guideline for budgeting and supplier evaluation.
                </p>
            </div>
        </div>
    );
}
