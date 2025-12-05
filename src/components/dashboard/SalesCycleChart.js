import { useState, useEffect } from 'react';
import styles from './SalesCycleChart.module.css';

export default function SalesCycleChart() {
    const [cycleData, setCycleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        fetchCycleData();
    }, [timeRange]);

    const fetchCycleData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/analytics/sales-cycle?days=${timeRange}`);
            const result = await response.json();

            if (result.success && result.data) {
                setCycleData(result.data);
            } else {
                setError(result.error || 'فشل في تحميل البيانات');
            }
        } catch (error) {
            console.error('Error fetching sales cycle data:', error);
            setError('حدث خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>جاري تحميل بيانات دورة المبيعات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>⚠️ {error}</p>
                    <button onClick={fetchCycleData} className={styles.retryButton}>
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    if (!cycleData || !cycleData.stages || cycleData.stages.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <p>📊 لا توجد بيانات كافية لتحليل دورة المبيعات</p>
                    <p className={styles.emptyHint}>ابدأ بإضافة فرص جديدة لرؤية التحليلات</p>
                </div>
            </div>
        );
    }

    const { stages, averageCycleTime, bottlenecks, trends, recommendations } = cycleData;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>تحليل دورة المبيعات</h3>
                <div className={styles.controls}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className={styles.select}
                    >
                        <option value="7">آخر 7 أيام</option>
                        <option value="30">آخر 30 يوم</option>
                        <option value="90">آخر 90 يوم</option>
                        <option value="365">آخر سنة</option>
                    </select>
                </div>
            </div>

            {/* Average Cycle Time */}
            <div className={styles.summaryCard}>
                <div className={styles.metric}>
                    <span className={styles.label}>متوسط دورة المبيعات</span>
                    <span className={styles.value}>{averageCycleTime} يوم</span>
                </div>
                {trends && (
                    <div className={styles.trend}>
                        <span className={trends.direction === 'up' ? styles.trendUp : styles.trendDown}>
                            {trends.direction === 'up' ? '↑' : '↓'} {trends.percentage}%
                        </span>
                        <span className={styles.trendLabel}>مقارنة بالفترة السابقة</span>
                    </div>
                )}
            </div>

            {/* Stage Duration Chart */}
            <div className={styles.chartContainer}>
                <h4>متوسط الوقت في كل مرحلة</h4>
                <div className={styles.stageChart}>
                    {stages.map((stage, index) => (
                        <div key={index} className={styles.stageRow}>
                            <div className={styles.stageName}>
                                {stage.name}
                                {stage.isBottleneck && (
                                    <span className={styles.bottleneckBadge}>⚠️ عنق الزجاجة</span>
                                )}
                            </div>
                            <div className={styles.stageBar}>
                                <div
                                    className={`${styles.barFill} ${stage.isBottleneck ? styles.bottleneck : ''}`}
                                    style={{ width: `${(stage.avgDays / averageCycleTime) * 100}%` }}
                                >
                                    <span className={styles.barLabel}>{stage.avgDays} يوم</span>
                                </div>
                            </div>
                            <div className={styles.stageStats}>
                                <span className={styles.dealCount}>{stage.dealCount} صفقة</span>
                                <span className={styles.conversionRate}>{stage.conversionRate}% تحويل</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottlenecks Section */}
            {bottlenecks && bottlenecks.length > 0 && (
                <div className={styles.bottlenecksSection}>
                    <h4>⚠️ نقاط الاختناق المكتشفة</h4>
                    <div className={styles.bottlenecksList}>
                        {bottlenecks.map((bottleneck, index) => (
                            <div key={index} className={styles.bottleneckCard}>
                                <div className={styles.bottleneckHeader}>
                                    <span className={styles.bottleneckStage}>{bottleneck.stage}</span>
                                    <span className={styles.bottleneckSeverity}>
                                        {bottleneck.severity === 'high' ? '🔴 عالي' :
                                            bottleneck.severity === 'medium' ? '🟡 متوسط' : '🟢 منخفض'}
                                    </span>
                                </div>
                                <p className={styles.bottleneckReason}>{bottleneck.reason}</p>
                                <div className={styles.bottleneckActions}>
                                    <button className={styles.actionBtn}>عرض الصفقات</button>
                                    <button className={styles.actionBtn}>تحليل تفصيلي</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className={styles.recommendations}>
                <h4>💡 توصيات لتحسين دورة المبيعات</h4>
                <ul className={styles.recommendationsList}>
                    {cycleData.recommendations?.map((rec, index) => (
                        <li key={index} className={styles.recommendation}>
                            <span className={styles.recIcon}>{rec.icon}</span>
                            <span className={styles.recText}>{rec.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
