'use client';

import { useState, useEffect } from 'react';
import styles from './DealHealthIndicator.module.css';

export default function DealHealthIndicator({ opportunityId, compact = false }) {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchHealth();
    }, [opportunityId]);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/deals/${opportunityId}/health`);
            const result = await response.json();
            if (result.success) setHealth(result.data.health);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>...</div>;
    if (!health) return null;

    const { totalScore, status, breakdown, recommendations } = health;

    if (compact) {
        return (
            <div className={`${styles.badge} ${styles[status.level]}`} onClick={() => setShowDetails(true)}>
                <span className={styles.icon}>{status.icon}</span>
                <span className={styles.score}>{totalScore}</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.scoreCircle}>
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke={getScoreColor(totalScore)}
                            strokeWidth="10"
                            strokeDasharray={`${totalScore * 2.827} 282.7`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className={styles.scoreValue}>
                        <div className={styles.scoreNumber}>{totalScore}</div>
                        <div className={styles.scoreLabel}>{status.label}</div>
                    </div>
                </div>
            </div>

            <div className={styles.breakdown}>
                <h4>التفاصيل</h4>
                {Object.entries(breakdown).map(([key, value]) => (
                    <div key={key} className={styles.breakdownItem}>
                        <span className={styles.breakdownLabel}>{getLabel(key)}</span>
                        <div className={styles.breakdownBar}>
                            <div
                                className={styles.breakdownFill}
                                style={{ width: `${value}%`, background: getScoreColor(value) }}
                            />
                        </div>
                        <span className={styles.breakdownValue}>{value}</span>
                    </div>
                ))}
            </div>

            {recommendations.length > 0 && (
                <div className={styles.recommendations}>
                    <h4>التوصيات</h4>
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

function getScoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#f97316';
    return '#ef4444';
}

function getLabel(key) {
    const labels = {
        activity: 'النشاط',
        engagement: 'التفاعل',
        velocity: 'السرعة',
        value: 'القيمة',
        stage: 'المرحلة'
    };
    return labels[key] || key;
}
