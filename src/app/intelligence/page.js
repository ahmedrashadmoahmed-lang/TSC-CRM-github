'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './intelligence.module.css';

export default function BusinessIntelligencePage() {
    const [cohorts, setCohorts] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('cohorts'); // cohorts, predictions

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cohortsRes, predictionsRes] = await Promise.all([
                fetch('/api/analytics/cohorts'),
                fetch('/api/analytics/predictions')
            ]);

            const [cohortsData, predictionsData] = await Promise.all([
                cohortsRes.json(),
                predictionsRes.json()
            ]);

            if (cohortsData.success) setCohorts(cohortsData.data);
            if (predictionsData.success) setPredictions(predictionsData.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🧠 ذكاء الأعمال</h1>
                <p>تحليلات متقدمة وتنبؤات ذكية</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'cohorts' ? styles.active : ''}`}
                    onClick={() => setActiveTab('cohorts')}
                >
                    📊 تحليل الفئات
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'predictions' ? styles.active : ''}`}
                    onClick={() => setActiveTab('predictions')}
                >
                    🔮 التنبؤات
                </button>
            </div>

            {activeTab === 'cohorts' && cohorts && (
                <div className={styles.section}>
                    <div className={styles.summaryGrid}>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{cohorts.summary.totalCohorts}</span>
                                <span className={styles.statLabel}>إجمالي الفئات</span>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{Math.round(cohorts.summary.avgCohortSize)}</span>
                                <span className={styles.statLabel}>متوسط حجم الفئة</span>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{cohorts.summary.avgRetentionMonth1}%</span>
                                <span className={styles.statLabel}>الاحتفاظ (شهر 1)</span>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{cohorts.summary.avgRetentionMonth3}%</span>
                                <span className={styles.statLabel}>الاحتفاظ (3 أشهر)</span>
                            </div>
                        </Card>
                    </div>

                    <Card title="جدول الفئات">
                        <div className={styles.cohortTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>الفئة</th>
                                        <th>الحجم</th>
                                        <th>شهر 0</th>
                                        <th>شهر 1</th>
                                        <th>شهر 2</th>
                                        <th>شهر 3</th>
                                        <th>شهر 6</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cohorts.cohorts.map((cohort, idx) => (
                                        <tr key={idx}>
                                            <td className={styles.cohortName}>{cohort.cohort}</td>
                                            <td>{cohort.size}</td>
                                            <td className={styles.retentionCell}>
                                                {cohort.periods.period_0 && (
                                                    <span className={styles.retention}>
                                                        {Math.round(cohort.periods.period_0.retentionRate)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className={styles.retentionCell}>
                                                {cohort.periods.period_1 && (
                                                    <span className={styles.retention}>
                                                        {Math.round(cohort.periods.period_1.retentionRate)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className={styles.retentionCell}>
                                                {cohort.periods.period_2 && (
                                                    <span className={styles.retention}>
                                                        {Math.round(cohort.periods.period_2.retentionRate)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className={styles.retentionCell}>
                                                {cohort.periods.period_3 && (
                                                    <span className={styles.retention}>
                                                        {Math.round(cohort.periods.period_3.retentionRate)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className={styles.retentionCell}>
                                                {cohort.periods.period_6 && (
                                                    <span className={styles.retention}>
                                                        {Math.round(cohort.periods.period_6.retentionRate)}%
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'predictions' && predictions && (
                <div className={styles.section}>
                    <div className={styles.summaryGrid}>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={`${styles.statValue} ${styles.danger}`}>
                                    {predictions.summary.highChurnRisk}
                                </span>
                                <span className={styles.statLabel}>خطر عالي</span>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={`${styles.statValue} ${styles.warning}`}>
                                    {predictions.summary.mediumChurnRisk}
                                </span>
                                <span className={styles.statLabel}>خطر متوسط</span>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{predictions.summary.avgHealthScore}</span>
                                <span className={styles.statLabel}>متوسط الصحة</span>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>
                                    {(predictions.summary.totalPredictedCLV / 1000).toFixed(0)}K
                                </span>
                                <span className={styles.statLabel}>القيمة المتوقعة</span>
                            </div>
                        </Card>
                    </div>

                    <Card title="تنبؤات العملاء">
                        <div className={styles.predictionsTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>العميل</th>
                                        <th>خطر التوقف</th>
                                        <th>الصحة</th>
                                        <th>القيمة المتوقعة</th>
                                        <th>الشراء التالي</th>
                                        <th>التوصيات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.predictions.slice(0, 20).map((pred, idx) => (
                                        <tr key={idx}>
                                            <td className={styles.customerName}>{pred.customerName}</td>
                                            <td>
                                                <Badge variant={
                                                    pred.predictions.churnRisk === 'high' ? 'error' :
                                                        pred.predictions.churnRisk === 'medium' ? 'warning' : 'success'
                                                }>
                                                    {pred.predictions.churnScore}%
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge variant={
                                                    pred.predictions.healthStatus === 'healthy' ? 'success' :
                                                        pred.predictions.healthStatus === 'at-risk' ? 'warning' : 'error'
                                                }>
                                                    {pred.predictions.healthScore}
                                                </Badge>
                                            </td>
                                            <td>{pred.predictions.predictedCLV.toLocaleString('ar-EG')} جنيه</td>
                                            <td>{pred.predictions.nextPurchaseDays} يوم</td>
                                            <td>
                                                {pred.recommendations.length > 0 && (
                                                    <span className={styles.recommendation}>
                                                        {pred.recommendations[0].action}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
