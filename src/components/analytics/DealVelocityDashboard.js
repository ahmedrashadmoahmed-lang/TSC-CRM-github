'use client';

import { useState, useEffect } from 'react';
import styles from './DealVelocityDashboard.module.css';

export default function DealVelocityDashboard({ tenantId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVelocityData();
    }, [tenantId]);

    const fetchVelocityData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/analytics/deal-velocity?tenantId=${tenantId}`);
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

    const { summary, deals, slowDeals, recommendations } = data;

    return (
        <div className={styles.container}>
            <h2>Deal Velocity Analysis</h2>

            <div className={styles.summary}>
                <div className={styles.metric}>
                    <div className={styles.metricValue}>{summary.avgVelocityScore}</div>
                    <div className={styles.metricLabel}>Avg Velocity Score</div>
                </div>
                <div className={styles.metric}>
                    <div className={styles.metricValue}>{summary.avgTimePerStage}d</div>
                    <div className={styles.metricLabel}>Avg Time/Stage</div>
                </div>
                <div className={styles.metric}>
                    <div className={styles.metricValue}>{summary.avgTotalTime}d</div>
                    <div className={styles.metricLabel}>Avg Total Time</div>
                </div>
            </div>

            {summary.commonBottlenecks.length > 0 && (
                <div className={styles.section}>
                    <h3>Common Bottlenecks</h3>
                    {summary.commonBottlenecks.map((b, i) => (
                        <div key={i} className={styles.bottleneck}>
                            <span className={styles.bottleneckStage}>{b.stage}</span>
                            <span className={styles.bottleneckPercent}>{b.percentage}%</span>
                            <span className={styles.bottleneckCount}>({b.count} deals)</span>
                        </div>
                    ))}
                </div>
            )}

            {slowDeals.length > 0 && (
                <div className={styles.section}>
                    <h3>Slow Deals ({slowDeals.length})</h3>
                    <div className={styles.dealsList}>
                        {slowDeals.slice(0, 10).map(deal => (
                            <div key={deal.opportunityId} className={styles.dealItem}>
                                <div className={styles.dealTitle}>{deal.title}</div>
                                <div className={styles.dealMeta}>
                                    {deal.velocity.totalTime} days | Score: {deal.velocity.velocity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {recommendations.length > 0 && (
                <div className={styles.recommendations}>
                    {recommendations.map((rec, i) => (
                        <div key={i} className={`${styles.recommendation} ${styles[rec.priority]}`}>
                            <span className={styles.recIcon}>{rec.icon}</span>
                            <div>
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
