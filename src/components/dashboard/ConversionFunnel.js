'use client';

import { TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './ConversionFunnel.module.css';

export default function ConversionFunnel({ data, loading = false }) {
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={styles.skeletonStage}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No funnel data available</p>
            </div>
        );
    }

    const totalLeads = data[0]?.count || 0;

    return (
        <div className={styles.container}>
            <div className={styles.funnel}>
                {data.map((stage, index) => {
                    const conversionRate = totalLeads > 0
                        ? ((stage.count / totalLeads) * 100).toFixed(1)
                        : 0;

                    const dropOffRate = index > 0 && data[index - 1]
                        ? (((data[index - 1].count - stage.count) / data[index - 1].count) * 100).toFixed(1)
                        : 0;

                    const width = totalLeads > 0
                        ? Math.max((stage.count / totalLeads) * 100, 20)
                        : 100;

                    const isLowConversion = conversionRate < 20 && index > 0;
                    const isHighDropOff = dropOffRate > 50;

                    return (
                        <div key={stage.stage} className={styles.stageWrapper}>
                            <div
                                className={`${styles.stage} ${isLowConversion ? styles.warning : ''}`}
                                style={{ width: `${width}%` }}
                            >
                                <div className={styles.stageContent}>
                                    <div className={styles.stageHeader}>
                                        <h4 className={styles.stageName}>{stage.stage}</h4>
                                        {isLowConversion && (
                                            <AlertTriangle size={16} className={styles.warningIcon} />
                                        )}
                                    </div>

                                    <div className={styles.stageMetrics}>
                                        <div className={styles.count}>{stage.count.toLocaleString()}</div>
                                        <div className={styles.rate}>{conversionRate}%</div>
                                    </div>

                                    {stage.value && (
                                        <div className={styles.value}>
                                            ${stage.value.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {index < data.length - 1 && (
                                <div className={`${styles.dropOff} ${isHighDropOff ? styles.highDropOff : ''}`}>
                                    <TrendingDown size={14} />
                                    <span>{dropOffRate}% drop-off</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={styles.summary}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Overall Conversion:</span>
                    <span className={styles.summaryValue}>
                        {data.length > 0 && totalLeads > 0
                            ? ((data[data.length - 1].count / totalLeads) * 100).toFixed(1)
                            : 0}%
                    </span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Total Leads:</span>
                    <span className={styles.summaryValue}>{totalLeads.toLocaleString()}</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Closed Deals:</span>
                    <span className={styles.summaryValue}>
                        {data[data.length - 1]?.count.toLocaleString() || 0}
                    </span>
                </div>
            </div>
        </div>
    );
}
