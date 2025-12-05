'use client';

import { useState, useEffect } from 'react';
import styles from './LostReasonsAnalytics.module.css';

export default function LostReasonsAnalytics({ tenantId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('90');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange, tenantId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/analytics/lost-reasons?tenantId=${tenantId}&days=${timeRange}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
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
                    <p>جاري تحميل التحليلات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>⚠️ {error}</p>
                    <button onClick={fetchAnalytics} className={styles.retryBtn}>
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    if (!data || data.summary.totalLost === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <p>📊 لا توجد صفقات مفقودة في هذه الفترة</p>
                </div>
            </div>
        );
    }

    const { summary, byCategory, byCompetitor, recommendations } = data;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>تحليل الصفقات المفقودة</h2>
                    <p className={styles.subtitle}>فهم لماذا نخسر الصفقات</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className={styles.select}
                >
                    <option value="30">آخر 30 يوم</option>
                    <option value="90">آخر 90 يوم</option>
                    <option value="180">آخر 6 أشهر</option>
                    <option value="365">آخر سنة</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>📉</div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardValue}>{summary.totalLost}</div>
                        <div className={styles.cardLabel}>صفقة مفقودة</div>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>💰</div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardValue}>
                            {summary.totalValue.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className={styles.cardLabel}>قيمة مفقودة</div>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>📊</div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardValue}>
                            {summary.avgDealValue.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className={styles.cardLabel}>متوسط قيمة الصفقة</div>
                    </div>
                </div>
            </div>

            {/* By Category */}
            <div className={styles.section}>
                <h3>الأسباب الرئيسية</h3>
                <div className={styles.categoryList}>
                    {byCategory.map((item, index) => (
                        <div key={item.category} className={styles.categoryItem}>
                            <div className={styles.categoryHeader}>
                                <div className={styles.categoryInfo}>
                                    <span className={styles.categoryRank}>#{index + 1}</span>
                                    <span className={styles.categoryName}>{getCategoryLabel(item.category)}</span>
                                </div>
                                <div className={styles.categoryStats}>
                                    <span className={styles.categoryCount}>{item.count} صفقة</span>
                                    <span className={styles.categoryPercent}>{item.percentage}%</span>
                                </div>
                            </div>
                            <div className={styles.categoryBar}>
                                <div
                                    className={styles.categoryBarFill}
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                            <div className={styles.categoryValue}>
                                قيمة: {item.totalValue.toLocaleString('ar-EG')} ج.م
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Competitors */}
            {byCompetitor.length > 0 && (
                <div className={styles.section}>
                    <h3>أهم المنافسين</h3>
                    <div className={styles.competitorList}>
                        {byCompetitor.map((comp, index) => (
                            <div key={comp.name} className={styles.competitorItem}>
                                <div className={styles.competitorRank}>#{index + 1}</div>
                                <div className={styles.competitorInfo}>
                                    <div className={styles.competitorName}>{comp.name}</div>
                                    <div className={styles.competitorStats}>
                                        <span>{comp.count} صفقة</span>
                                        {comp.avgPrice > 0 && (
                                            <span className={styles.competitorPrice}>
                                                متوسط السعر: {comp.avgPrice.toLocaleString('ar-EG')} ج.م
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.competitorValue}>
                                    {comp.totalValue.toLocaleString('ar-EG')} ج.م
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className={styles.section}>
                    <h3>💡 التوصيات</h3>
                    <div className={styles.recommendationsList}>
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`${styles.recommendationCard} ${styles[rec.priority]}`}
                            >
                                <div className={styles.recIcon}>{rec.icon}</div>
                                <div className={styles.recContent}>
                                    <div className={styles.recTitle}>{rec.title}</div>
                                    <div className={styles.recDescription}>{rec.description}</div>
                                </div>
                                <div className={styles.recPriority}>
                                    {rec.priority === 'high' ? 'عالي' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function getCategoryLabel(category) {
    const labels = {
        'Competitor': '🏆 خسرنا لمنافس',
        'Price': '💰 السعر مرتفع',
        'Timing': '⏰ التوقيت غير مناسب',
        'No Interest': '❌ لا يوجد اهتمام',
        'Budget': '💸 لا توجد ميزانية',
        'Other': '📝 أخرى'
    };
    return labels[category] || category;
}
