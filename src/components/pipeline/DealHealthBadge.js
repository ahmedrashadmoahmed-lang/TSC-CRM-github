// Deal Health Badge Component
// Shows health score with color-coded indicator

import { useState, useEffect } from 'react';
import { Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './DealHealthBadge.module.css';

export default function DealHealthBadge({ dealId, deal, compact = false }) {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (deal?.healthScore !== undefined) {
            // Use existing health score
            setHealth({ score: deal.healthScore });
            setLoading(false);
        } else if (dealId) {
            // Fetch health score
            fetchHealthScore();
        }
    }, [dealId, deal]);

    const fetchHealthScore = async () => {
        try {
            const response = await fetch(`/api/deals/${dealId}/health`);
            const result = await response.json();
            if (result.success) {
                setHealth(result.data);
            }
        } catch (error) {
            console.error('Error fetching health score:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>...</div>;
    }

    if (!health) return null;

    const score = health.score || 0;
    const getHealthStatus = (score) => {
        if (score >= 80) return { status: 'excellent', color: '#10b981', icon: CheckCircle };
        if (score >= 60) return { status: 'good', color: '#3b82f6', icon: Heart };
        if (score >= 40) return { status: 'fair', color: '#f59e0b', icon: AlertTriangle };
        return { status: 'poor', color: '#ef4444', icon: AlertTriangle };
    };

    const { status, color, icon: Icon } = getHealthStatus(score);

    if (compact) {
        return (
            <div className={styles.compactBadge} style={{ borderColor: color }}>
                <Icon size={14} color={color} />
                <span style={{ color }}>{score}</span>
            </div>
        );
    }

    return (
        <div className={styles.healthBadge}>
            <div className={styles.healthHeader}>
                <Icon size={16} color={color} />
                <span className={styles.healthLabel}>Health Score</span>
            </div>
            <div className={styles.healthScore} style={{ color }}>
                {score}/100
            </div>
            <div className={styles.healthBar}>
                <div
                    className={styles.healthFill}
                    style={{
                        width: `${score}%`,
                        backgroundColor: color
                    }}
                />
            </div>
            <div className={styles.healthStatus} style={{ color }}>
                {status.toUpperCase()}
            </div>
        </div>
    );
}
