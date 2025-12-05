// RFQ Analytics Dashboard
// Comprehensive analytics and insights for RFQ management

'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    Clock,
    Users,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    PieChart
} from 'lucide-react';
import styles from './RFQDashboard.module.css';

export default function RFQDashboard({ rfqs = [], quotes = [], suppliers = [] }) {
    const [metrics, setMetrics] = useState(null);
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        if (rfqs.length > 0) {
            calculateMetrics();
        }
    }, [rfqs, quotes, timeRange]);

    const calculateMetrics = () => {
        const now = new Date();
        const rangeDate = new Date();
        rangeDate.setDate(rangeDate.getDate() - parseInt(timeRange));

        // Filter RFQs by time range
        const filteredRFQs = rfqs.filter(rfq =>
            new Date(rfq.createdAt) >= rangeDate
        );

        // Total RFQs
        const totalRFQs = filteredRFQs.length;

        // Active RFQs
        const activeRFQs = filteredRFQs.filter(rfq =>
            rfq.status === 'active' && rfq.stage !== 'closed'
        );

        // Completion rate
        const closedRFQs = filteredRFQs.filter(rfq => rfq.stage === 'closed');
        const completionRate = totalRFQs > 0 ? (closedRFQs.length / totalRFQs) * 100 : 0;

        // Average cycle time
        const completedWithDates = closedRFQs.filter(rfq => rfq.createdAt && rfq.closedAt);
        const avgCycleTime = completedWithDates.length > 0
            ? completedWithDates.reduce((sum, rfq) => {
                const duration = (new Date(rfq.closedAt) - new Date(rfq.createdAt)) / (1000 * 60 * 60 * 24);
                return sum + duration;
            }, 0) / completedWithDates.length
            : 0;

        // Total value
        const totalValue = filteredRFQs.reduce((sum, rfq) =>
            sum + (rfq.estimatedCost || rfq.budget || 0), 0
        );

        // Average quotes per RFQ
        const rfqsWithQuotes = filteredRFQs.filter(rfq => rfq.quotes && rfq.quotes.length > 0);
        const avgQuotesPerRFQ = rfqsWithQuotes.length > 0
            ? rfqsWithQuotes.reduce((sum, rfq) => sum + rfq.quotes.length, 0) / rfqsWithQuotes.length
            : 0;

        // Response rate
        const totalInvitations = filteredRFQs.reduce((sum, rfq) =>
            sum + (rfq.suppliers?.length || 0), 0
        );
        const totalResponses = filteredRFQs.reduce((sum, rfq) =>
            sum + (rfq.quotes?.length || 0), 0
        );
        const responseRate = totalInvitations > 0 ? (totalResponses / totalInvitations) * 100 : 0;

        // Overdue RFQs
        const overdueRFQs = activeRFQs.filter(rfq =>
            rfq.deadline && new Date(rfq.deadline) < now
        );

        // Stage distribution
        const stageDistribution = {};
        filteredRFQs.forEach(rfq => {
            stageDistribution[rfq.stage] = (stageDistribution[rfq.stage] || 0) + 1;
        });

        // Top suppliers
        const supplierStats = {};
        filteredRFQs.forEach(rfq => {
            rfq.quotes?.forEach(quote => {
                const supplierId = quote.supplierId;
                if (!supplierStats[supplierId]) {
                    supplierStats[supplierId] = {
                        id: supplierId,
                        name: quote.supplier?.name || 'Unknown',
                        quotesSubmitted: 0,
                        quotesSelected: 0,
                        totalValue: 0
                    };
                }
                supplierStats[supplierId].quotesSubmitted++;
                if (quote.isSelected) {
                    supplierStats[supplierId].quotesSelected++;
                    supplierStats[supplierId].totalValue += quote.totalPrice || 0;
                }
            });
        });

        const topSuppliers = Object.values(supplierStats)
            .sort((a, b) => b.quotesSelected - a.quotesSelected)
            .slice(0, 5);

        // Savings
        const rfqsWithSavings = filteredRFQs.filter(rfq => {
            const selectedQuote = rfq.quotes?.find(q => q.isSelected);
            return selectedQuote && rfq.budget && selectedQuote.totalPrice < rfq.budget;
        });

        const totalSavings = rfqsWithSavings.reduce((sum, rfq) => {
            const selectedQuote = rfq.quotes.find(q => q.isSelected);
            return sum + (rfq.budget - selectedQuote.totalPrice);
        }, 0);

        setMetrics({
            totalRFQs,
            activeRFQs: activeRFQs.length,
            closedRFQs: closedRFQs.length,
            completionRate,
            avgCycleTime,
            totalValue,
            avgQuotesPerRFQ,
            responseRate,
            overdueRFQs: overdueRFQs.length,
            stageDistribution,
            topSuppliers,
            totalSavings,
            savingsRate: totalValue > 0 ? (totalSavings / totalValue) * 100 : 0
        });
    };

    if (!metrics) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>RFQ Analytics Dashboard</h2>
                    <p>Comprehensive insights and performance metrics</p>
                </div>

                <div className={styles.timeRange}>
                    <label>Time Range:</label>
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="180">Last 6 months</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.primary}`}>
                    <div className={styles.kpiIcon}>
                        <BarChart3 size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Total RFQs</div>
                        <div className={styles.kpiValue}>{metrics.totalRFQs}</div>
                        <div className={styles.kpiDetail}>
                            {metrics.activeRFQs} active, {metrics.closedRFQs} closed
                        </div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.success}`}>
                    <div className={styles.kpiIcon}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Completion Rate</div>
                        <div className={styles.kpiValue}>{metrics.completionRate.toFixed(1)}%</div>
                        <div className={styles.kpiDetail}>
                            {metrics.closedRFQs} of {metrics.totalRFQs} completed
                        </div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.info}`}>
                    <div className={styles.kpiIcon}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Avg Cycle Time</div>
                        <div className={styles.kpiValue}>{Math.round(metrics.avgCycleTime)}</div>
                        <div className={styles.kpiDetail}>days from creation to closure</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.currency}`}>
                    <div className={styles.kpiIcon}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Total Value</div>
                        <div className={styles.kpiValue}>
                            {(metrics.totalValue / 1000).toFixed(0)}K
                        </div>
                        <div className={styles.kpiDetail}>
                            EGP {metrics.totalValue.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.warning}`}>
                    <div className={styles.kpiIcon}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Overdue RFQs</div>
                        <div className={styles.kpiValue}>{metrics.overdueRFQs}</div>
                        <div className={styles.kpiDetail}>require immediate attention</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.success}`}>
                    <div className={styles.kpiIcon}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Total Savings</div>
                        <div className={styles.kpiValue}>
                            {(metrics.totalSavings / 1000).toFixed(0)}K
                        </div>
                        <div className={styles.kpiDetail}>
                            {metrics.savingsRate.toFixed(1)}% of total value
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                {/* Stage Distribution */}
                <div className={styles.chartCard}>
                    <h3>
                        <PieChart size={18} />
                        Stage Distribution
                    </h3>
                    <div className={styles.stageList}>
                        {Object.entries(metrics.stageDistribution).map(([stage, count]) => {
                            const percentage = (count / metrics.totalRFQs) * 100;
                            return (
                                <div key={stage} className={styles.stageItem}>
                                    <div className={styles.stageInfo}>
                                        <span className={styles.stageName}>{stage}</span>
                                        <span className={styles.stageCount}>{count}</span>
                                    </div>
                                    <div className={styles.stageBar}>
                                        <div
                                            className={styles.stageBarFill}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className={styles.stagePercentage}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className={styles.chartCard}>
                    <h3>
                        <BarChart3 size={18} />
                        Performance Metrics
                    </h3>
                    <div className={styles.metricsList}>
                        <div className={styles.metricItem}>
                            <div className={styles.metricLabel}>Response Rate</div>
                            <div className={styles.metricBar}>
                                <div
                                    className={styles.metricBarFill}
                                    style={{
                                        width: `${metrics.responseRate}%`,
                                        background: metrics.responseRate >= 70 ? '#10b981' : metrics.responseRate >= 50 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>
                            <div className={styles.metricValue}>
                                {metrics.responseRate.toFixed(0)}%
                            </div>
                        </div>

                        <div className={styles.metricItem}>
                            <div className={styles.metricLabel}>Avg Quotes per RFQ</div>
                            <div className={styles.metricBar}>
                                <div
                                    className={styles.metricBarFill}
                                    style={{
                                        width: `${Math.min((metrics.avgQuotesPerRFQ / 5) * 100, 100)}%`,
                                        background: '#3b82f6'
                                    }}
                                />
                            </div>
                            <div className={styles.metricValue}>
                                {metrics.avgQuotesPerRFQ.toFixed(1)}
                            </div>
                        </div>

                        <div className={styles.metricItem}>
                            <div className={styles.metricLabel}>Completion Rate</div>
                            <div className={styles.metricBar}>
                                <div
                                    className={styles.metricBarFill}
                                    style={{
                                        width: `${metrics.completionRate}%`,
                                        background: metrics.completionRate >= 80 ? '#10b981' : metrics.completionRate >= 60 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>
                            <div className={styles.metricValue}>
                                {metrics.completionRate.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Suppliers */}
            <div className={styles.tableCard}>
                <h3>
                    <Users size={18} />
                    Top Performing Suppliers
                </h3>
                {metrics.topSuppliers.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Supplier</th>
                                <th>Quotes Submitted</th>
                                <th>Quotes Selected</th>
                                <th>Win Rate</th>
                                <th>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.topSuppliers.map((supplier, index) => {
                                const winRate = supplier.quotesSubmitted > 0
                                    ? (supplier.quotesSelected / supplier.quotesSubmitted) * 100
                                    : 0;

                                return (
                                    <tr key={supplier.id}>
                                        <td>
                                            <span className={`${styles.rank} ${styles[`rank${index + 1}`]}`}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td className={styles.supplierName}>{supplier.name}</td>
                                        <td>{supplier.quotesSubmitted}</td>
                                        <td>{supplier.quotesSelected}</td>
                                        <td>
                                            <span className={styles.winRate}>
                                                {winRate.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className={styles.value}>
                                            EGP {supplier.totalValue.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.empty}>
                        <p>No supplier data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
