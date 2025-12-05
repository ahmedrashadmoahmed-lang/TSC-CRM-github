// Lost Reasons Widget for Dashboard
// Shows why deals are being lost

import { useState, useEffect } from 'react';
import { TrendingDown, AlertCircle } from 'lucide-react';
import styles from './LostReasonsWidget.module.css';

export default function LostReasonsWidget({ tenantId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLostReasons();
    }, [tenantId]);

    const fetchLostReasons = async () => {
        try {
            const response = await fetch(`/api/analytics/lost-reasons?tenantId=${tenantId}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching lost reasons:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!data || !data.byCategory) return null;

    const topReasons = Object.entries(data.byCategory)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

    const total = topReasons.reduce((sum, [_, r]) => sum + r.count, 0);

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <TrendingDown size={20} className={styles.icon} />
                    <h3 className={styles.title}>Why We're Losing Deals</h3>
                </div>
                <span className={styles.total}>{total} lost deals</span>
            </div>

            <div className={styles.reasons}>
                {topReasons.map(([category, reason]) => {
                    const percentage = ((reason.count / total) * 100).toFixed(1);
                    return (
                        <div key={category} className={styles.reasonRow}>
                            <div className={styles.reasonInfo}>
                                <span className={styles.reasonName}>{category}</span>
                                <span className={styles.reasonCount}>{reason.count} deals</span>
                            </div>
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.bar}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className={styles.percentage}>{percentage}%</span>
                        </div>
                    );
                })}
            </div>

            {data.recommendations && data.recommendations.length > 0 && (
                <div className={styles.recommendations}>
                    <div className={styles.recHeader}>
                        <AlertCircle size={14} />
                        <span>Top Recommendation</span>
                    </div>
                    <p className={styles.recText}>{data.recommendations[0]}</p>
                </div>
            )}
        </div>
    );
}
