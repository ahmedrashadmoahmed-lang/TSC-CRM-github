'use client';

import { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';
import styles from './EnhancedAIInsights.module.css';

export default function EnhancedAIInsights({ insights = [], loading = false }) {
    const [expandedId, setExpandedId] = useState(null);

    const getInsightIcon = (type) => {
        switch (type) {
            case 'opportunity': return TrendingUp;
            case 'warning': return AlertTriangle;
            case 'success': return CheckCircle;
            default: return Lightbulb;
        }
    };

    const getInsightColor = (type) => {
        switch (type) {
            case 'opportunity': return 'success';
            case 'warning': return 'warning';
            case 'success': return 'info';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>AI Insights & Recommendations</h3>
                <div className={styles.loadingState}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonHeader}></div>
                            <div className={styles.skeletonText}></div>
                            <div className={styles.skeletonText}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!insights || insights.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>AI Insights & Recommendations</h3>
                <div className={styles.emptyState}>
                    <Lightbulb size={48} />
                    <p>No insights available at the moment</p>
                    <span>Check back later for AI-powered recommendations</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                <Lightbulb size={20} />
                AI Insights & Recommendations
            </h3>

            <div className={styles.insightsList}>
                {insights.map((insight) => {
                    const Icon = getInsightIcon(insight.type);
                    const isExpanded = expandedId === insight.id;

                    return (
                        <div
                            key={insight.id}
                            className={`${styles.insightCard} ${styles[getInsightColor(insight.type)]}`}
                        >
                            <div className={styles.insightHeader}>
                                <div className={styles.insightIcon}>
                                    <Icon size={20} />
                                </div>
                                <div className={styles.insightContent}>
                                    <h4 className={styles.insightTitle}>{insight.title}</h4>
                                    <p className={styles.insightDescription}>{insight.description}</p>
                                </div>
                            </div>

                            {/* Recommended Action */}
                            {insight.action && (
                                <div className={styles.actionSection}>
                                    <div className={styles.actionHeader}>
                                        <span className={styles.actionLabel}>Recommended Action:</span>
                                        {insight.impact && (
                                            <span className={styles.actionImpact}>
                                                Impact: {insight.impact}
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.actionText}>{insight.action}</p>

                                    {/* Action Steps */}
                                    {insight.steps && insight.steps.length > 0 && (
                                        <div className={styles.steps}>
                                            <button
                                                className={styles.stepsToggle}
                                                onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                                            >
                                                {isExpanded ? 'Hide' : 'Show'} Steps
                                                <ArrowRight
                                                    size={14}
                                                    className={isExpanded ? styles.rotated : ''}
                                                />
                                            </button>

                                            {isExpanded && (
                                                <ol className={styles.stepsList}>
                                                    {insight.steps.map((step, index) => (
                                                        <li key={index}>{step}</li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {insight.actionButton && (
                                        <button className={styles.actionButton}>
                                            {insight.actionButton.label}
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Metrics/Data */}
                            {insight.metrics && (
                                <div className={styles.metrics}>
                                    {Object.entries(insight.metrics).map(([key, value]) => (
                                        <div key={key} className={styles.metric}>
                                            <span className={styles.metricLabel}>{key}:</span>
                                            <span className={styles.metricValue}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
