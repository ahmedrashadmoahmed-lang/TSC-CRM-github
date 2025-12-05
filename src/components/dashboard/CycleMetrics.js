import { useState } from 'react';
import styles from './CycleMetrics.module.css';

export default function CycleMetrics({ data }) {
    const [selectedMetric, setSelectedMetric] = useState('avgCycleTime');

    if (!data) return null;

    const metrics = [
        {
            id: 'avgCycleTime',
            label: 'متوسط دورة المبيعات',
            value: `${data.averageCycleTime} يوم`,
            trend: data.trends?.percentage || 0,
            trendDirection: data.trends?.direction || 'neutral',
            icon: '⏱️'
        },
        {
            id: 'conversionRate',
            label: 'معدل التحويل الإجمالي',
            value: `${calculateOverallConversion(data.stages)}%`,
            trend: 5,
            trendDirection: 'up',
            icon: '📈'
        },
        {
            id: 'bottlenecks',
            label: 'نقاط الاختناق',
            value: data.bottlenecks?.length || 0,
            trend: -2,
            trendDirection: 'down',
            icon: '⚠️'
        },
        {
            id: 'fastestStage',
            label: 'أسرع مرحلة',
            value: getFastestStage(data.stages),
            icon: '⚡'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.metricsGrid}>
                {metrics.map(metric => (
                    <div
                        key={metric.id}
                        className={`${styles.metricCard} ${selectedMetric === metric.id ? styles.selected : ''}`}
                        onClick={() => setSelectedMetric(metric.id)}
                    >
                        <div className={styles.metricIcon}>{metric.icon}</div>
                        <div className={styles.metricContent}>
                            <span className={styles.metricLabel}>{metric.label}</span>
                            <span className={styles.metricValue}>{metric.value}</span>
                            {metric.trend !== undefined && (
                                <div className={styles.metricTrend}>
                                    <span className={
                                        metric.trendDirection === 'up' ? styles.trendUp :
                                            metric.trendDirection === 'down' ? styles.trendDown :
                                                styles.trendNeutral
                                    }>
                                        {metric.trendDirection === 'up' ? '↑' :
                                            metric.trendDirection === 'down' ? '↓' : '→'}
                                        {Math.abs(metric.trend)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function calculateOverallConversion(stages) {
    if (!stages || stages.length === 0) return 0;

    const totalDeals = stages.reduce((sum, stage) => sum + stage.dealCount, 0);
    const convertedDeals = stages
        .filter(s => s.name === 'Closed Won' || s.name === 'Won')
        .reduce((sum, stage) => sum + stage.dealCount, 0);

    return totalDeals > 0 ? Math.round((convertedDeals / totalDeals) * 100) : 0;
}

function getFastestStage(stages) {
    if (!stages || stages.length === 0) return 'N/A';

    const fastest = stages.reduce((min, stage) =>
        stage.avgDays < min.avgDays ? stage : min
    );

    return `${fastest.name} (${fastest.avgDays} يوم)`;
}
