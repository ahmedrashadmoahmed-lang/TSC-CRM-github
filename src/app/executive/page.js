'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import styles from './executive.module.css';

export default function ExecutiveDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch('/api/executive/dashboard');
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    if (!data) {
        return <div className={styles.error}>فشل تحميل البيانات</div>;
    }

    const { kpis, topCustomers, monthlyTrends } = data;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📊 لوحة التحكم التنفيذية</h1>
                <p>رؤية استراتيجية شاملة للأعمال</p>
            </div>

            {/* Primary KPIs */}
            <div className={styles.primaryKPIs}>
                <Card hover>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon}>💰</div>
                        <div className={styles.kpiContent}>
                            <span className={styles.kpiValue}>
                                {(kpis.totalRevenue / 1000).toFixed(0)}K
                            </span>
                            <span className={styles.kpiLabel}>إجمالي الإيرادات</span>
                            <span className={`${styles.kpiTrend} ${kpis.revenueGrowth > 0 ? styles.positive : styles.negative}`}>
                                {kpis.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(kpis.revenueGrowth)}%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card hover>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon}>📈</div>
                        <div className={styles.kpiContent}>
                            <span className={styles.kpiValue}>
                                {(kpis.netProfit / 1000).toFixed(0)}K
                            </span>
                            <span className={styles.kpiLabel}>صافي الربح</span>
                            <span className={styles.kpiSubtext}>
                                هامش: {kpis.profitMargin}%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card hover>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon}>💵</div>
                        <div className={styles.kpiContent}>
                            <span className={styles.kpiValue}>{kpis.collectionRate}%</span>
                            <span className={styles.kpiLabel}>معدل التحصيل</span>
                            <span className={styles.kpiSubtext}>
                                {(kpis.totalCollected / 1000).toFixed(0)}K محصل
                            </span>
                        </div>
                    </div>
                </Card>

                <Card hover>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon}>👥</div>
                        <div className={styles.kpiContent}>
                            <span className={styles.kpiValue}>{kpis.activeCustomers}</span>
                            <span className={styles.kpiLabel}>عملاء نشطين</span>
                            <span className={styles.kpiSubtext}>
                                متوسط الصفقة: {(kpis.avgDealSize / 1000).toFixed(0)}K
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                {/* Monthly Trends */}
                <Card title="الاتجاهات الشهرية">
                    <div className={styles.chart}>
                        <div className={styles.chartBars}>
                            {monthlyTrends.map((month, idx) => {
                                const maxValue = Math.max(...monthlyTrends.map(m => m.revenue));
                                const height = (month.revenue / maxValue) * 100;

                                return (
                                    <div key={idx} className={styles.barGroup}>
                                        <div className={styles.barContainer}>
                                            <div
                                                className={styles.bar}
                                                style={{ height: `${height}%` }}
                                                title={`${month.revenue.toLocaleString('ar-EG')} جنيه`}
                                            />
                                        </div>
                                        <span className={styles.barLabel}>{month.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* Top Customers */}
                <Card title="أفضل العملاء">
                    <div className={styles.topList}>
                        {topCustomers.map((customer, idx) => (
                            <div key={idx} className={styles.topItem}>
                                <div className={styles.rank}>{idx + 1}</div>
                                <div className={styles.customerInfo}>
                                    <span className={styles.customerName}>{customer.name}</span>
                                    <span className={styles.customerValue}>
                                        {customer.value.toLocaleString('ar-EG')} جنيه
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Secondary KPIs */}
            <div className={styles.secondaryKPIs}>
                <Card>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{(kpis.monthlyRevenue / 1000).toFixed(0)}K</span>
                        <span className={styles.statLabel}>إيرادات الشهر</span>
                    </div>
                </Card>
                <Card>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{(kpis.ytdRevenue / 1000).toFixed(0)}K</span>
                        <span className={styles.statLabel}>إيرادات السنة</span>
                    </div>
                </Card>
                <Card>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{data.summary.totalInvoices}</span>
                        <span className={styles.statLabel}>إجمالي الفواتير</span>
                    </div>
                </Card>
                <Card>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{data.summary.pendingInvoices}</span>
                        <span className={styles.statLabel}>فواتير معلقة</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
