'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './PODashboard.module.css';

export default function PODashboard() {
    const [kpis, setKPIs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        loadKPIs();
    }, [period]);

    const loadKPIs = async () => {
        try {
            const res = await fetch(`/api/po/kpis?period=${period}`);
            const data = await res.json();

            if (data.success) {
                setKPIs(data.data);
            }
        } catch (error) {
            console.error('Failed to load KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    if (!kpis) {
        return <div className={styles.error}>فشل تحميل البيانات</div>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h2>📊 لوحة مؤشرات أوامر الشراء</h2>
                <div className={styles.periodSelector}>
                    <button
                        className={period === 'month' ? styles.active : ''}
                        onClick={() => setPeriod('month')}
                    >
                        شهر
                    </button>
                    <button
                        className={period === 'quarter' ? styles.active : ''}
                        onClick={() => setPeriod('quarter')}
                    >
                        ربع سنة
                    </button>
                    <button
                        className={period === 'year' ? styles.active : ''}
                        onClick={() => setPeriod('year')}
                    >
                        سنة
                    </button>
                </div>
            </div>

            {/* Overview KPIs */}
            <div className={styles.kpiGrid}>
                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>📦</div>
                    <div className={styles.kpiContent}>
                        <h3>{kpis.overview.totalPOs}</h3>
                        <p>إجمالي الأوامر</p>
                    </div>
                </Card>

                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>🔓</div>
                    <div className={styles.kpiContent}>
                        <h3>{kpis.overview.openPOs}</h3>
                        <p>أوامر مفتوحة</p>
                    </div>
                </Card>

                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>✅</div>
                    <div className={styles.kpiContent}>
                        <h3>{kpis.overview.closedPOs}</h3>
                        <p>أوامر مغلقة</p>
                    </div>
                </Card>

                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>⏰</div>
                    <div className={styles.kpiContent}>
                        <h3>{kpis.overview.delayedPOs}</h3>
                        <p>أوامر متأخرة</p>
                        {kpis.overview.delayedPOs > 0 && (
                            <Badge variant="error">تحتاج متابعة</Badge>
                        )}
                    </div>
                </Card>

                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>💰</div>
                    <div className={styles.kpiContent}>
                        <h3>{kpis.overview.totalValue.toLocaleString()} EGP</h3>
                        <p>القيمة الإجمالية</p>
                    </div>
                </Card>

                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>📊</div>
                    <div className={styles.kpiContent}>
                        <h3>{Math.round(kpis.overview.avgValue).toLocaleString()} EGP</h3>
                        <p>متوسط قيمة الأمر</p>
                    </div>
                </Card>
            </div>

            {/* Delivery Metrics */}
            <Card title="📦 مقاييس التسليم">
                <div className={styles.metricsGrid}>
                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.delivery.onTimeRate}%
                        </div>
                        <div className={styles.metricLabel}>معدل التسليم في الوقت</div>
                        <div className={styles.metricBar}>
                            <div
                                className={styles.metricBarFill}
                                style={{ width: `${kpis.delivery.onTimeRate}%` }}
                            />
                        </div>
                    </div>

                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.delivery.avgDeliveryTime} يوم
                        </div>
                        <div className={styles.metricLabel}>متوسط وقت التسليم</div>
                    </div>

                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.delivery.deliveredShipments}
                        </div>
                        <div className={styles.metricLabel}>شحنات مستلمة</div>
                    </div>

                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.delivery.delayedShipments}
                        </div>
                        <div className={styles.metricLabel}>شحنات متأخرة</div>
                    </div>
                </div>
            </Card>

            {/* Quality Metrics */}
            <Card title="🔍 مقاييس الجودة">
                <div className={styles.metricsGrid}>
                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.quality.qualityPassRate}%
                        </div>
                        <div className={styles.metricLabel}>معدل نجاح الفحص</div>
                        <div className={styles.metricBar}>
                            <div
                                className={styles.metricBarFill}
                                style={{
                                    width: `${kpis.quality.qualityPassRate}%`,
                                    backgroundColor: kpis.quality.qualityPassRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)'
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.quality.totalChecks}
                        </div>
                        <div className={styles.metricLabel}>إجمالي الفحوصات</div>
                    </div>

                    <div className={styles.metric}>
                        <div className={styles.metricValue}>
                            {kpis.quality.passedChecks}
                        </div>
                        <div className={styles.metricLabel}>فحوصات ناجحة</div>
                    </div>
                </div>
            </Card>

            {/* Payment Status */}
            <Card title="💳 حالة المدفوعات">
                <div className={styles.paymentGrid}>
                    <div className={styles.paymentItem}>
                        <Badge variant="success">مدفوع</Badge>
                        <span>{kpis.payment.paidPOs} أمر</span>
                    </div>
                    <div className={styles.paymentItem}>
                        <Badge variant="warning">جزئي</Badge>
                        <span>{kpis.payment.partialPaidPOs} أمر</span>
                    </div>
                    <div className={styles.paymentItem}>
                        <Badge variant="error">معلق</Badge>
                        <span>{kpis.payment.pendingPaymentPOs} أمر</span>
                    </div>
                </div>
            </Card>

            {/* Status Breakdown */}
            <Card title="📋 توزيع الحالات">
                <div className={styles.statusGrid}>
                    {Object.entries(kpis.statusBreakdown).map(([status, count]) => (
                        <div key={status} className={styles.statusItem}>
                            <span className={styles.statusLabel}>{getStatusLabel(status)}</span>
                            <span className={styles.statusCount}>{count}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function getStatusLabel(status) {
    const labels = {
        draft: 'مسودة',
        pending_approval: 'انتظار الموافقة',
        approved: 'مُعتمد',
        ordered: 'تم الطلب',
        shipped: 'تم الشحن',
        delivered: 'تم التسليم',
        closed: 'مغلق',
        cancelled: 'ملغي'
    };
    return labels[status] || status;
}
