'use client';

import { useState, useEffect } from 'react';
import styles from './SalesVelocityDashboard.module.css';

export default function SalesVelocityDashboard({ tenantId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');

    useEffect(() => {
        fetchVelocityData();
    }, [tenantId, timeRange]);

    const fetchVelocityData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/analytics/sales-velocity?tenantId=${tenantId}&days=${timeRange}`);
            const result = await response.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!data) return null;

    const { metrics, stageMetrics, trends, recommendations } = data;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Sales Velocity Dashboard</h2>
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={styles.select}>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>⚡</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricValue}>{metrics.avgVelocity}</div>
                        <div className={styles.metricLabel}>Avg Velocity Score</div>
                        <div className={styles.metricTrend}>
                            {trends.velocity > 0 ? '↑' : '↓'} {Math.abs(trends.velocity)}%
                        </div>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>🎯</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricValue}>{metrics.dealsEntering}</div>
                        <div className={styles.metricLabel}>Deals Entering</div>
                        <div className={styles.metricTrend}>
                            {trends.entering > 0 ? '↑' : '↓'} {Math.abs(trends.entering)}%
                        </div>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>✅</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricValue}>{metrics.dealsClosing}</div>
                        <div className={styles.metricLabel}>Deals Closing</div>
                        <div className={styles.metricTrend}>
                            {trends.closing > 0 ? '↑' : '↓'} {Math.abs(trends.closing)}%
                        </div>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>💰</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricValue}>${(metrics.revenueVelocity / 1000).toFixed(1)}K</div>
                        <div className={styles.metricLabel}>Revenue Velocity</div>
                        <div className={styles.metricTrend}>
                            {trends.revenue > 0 ? '↑' : '↓'} {Math.abs(trends.revenue)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Metrics */}
            <div className={styles.section}>
                <h3>Stage Performance</h3>
                <div className={styles.stageList}>
                    {stageMetrics.map(stage => (
                        <div key={stage.stage} className={styles.stageItem}>
                            <div className={styles.stageHeader}>
                                <span className={styles.stageName}>{stage.stage}</span>
                                <span className={styles.stageCount}>{stage.count} deals</span>
                            </div>
                            <div className={styles.stageMetrics}>
                                <div className={styles.stageMetric}>
                                    <span className={styles.metricLabel}>Avg Time:</span>
                                    <span className={styles.metricValue}>{stage.avgDays}d</span>
                                </div>
                                <div className={styles.stageMetric}>
                                    <span className={styles.metricLabel}>Conversion:</span>
                                    <span className={styles.metricValue}>{stage.conversionRate}%</span>
                                </div>
                                <div className={styles.stageMetric}>
                                    <span className={styles.metricLabel}>Velocity:</span>
                                    <span className={`${styles.metricValue} ${getVelocityClass(stage.velocityScore)}`}>
                                        {stage.velocityScore}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className={styles.recommendations}>
                    <h3>💡 Recommendations</h3>
                    {recommendations.map((rec, i) => (
                        <div key={i} className={`${styles.recommendation} ${styles[rec.priority]}`}>
                            <span className={styles.recIcon}>{rec.icon}</span>
                            <div className={styles.recContent}>
                                <div className={styles.recTitle}>{rec.title}</div>
                                <div className={styles.recDesc}>{rec.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getVelocityClass(score) {
    if (score >= 80) return styles.velocityHigh;
    if (score >= 60) return styles.velocityMedium;
    return styles.velocityLow;
}
