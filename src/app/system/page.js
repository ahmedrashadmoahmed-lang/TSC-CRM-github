'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './system.module.css';

export default function SystemMonitoringPage() {
    const [metrics, setMetrics] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadData();

        if (autoRefresh) {
            const interval = setInterval(loadData, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadData = async () => {
        try {
            const [metricsRes, analyticsRes] = await Promise.all([
                fetch('/api/system/performance'),
                fetch('/api/analytics/user')
            ]);

            const [metricsData, analyticsData] = await Promise.all([
                metricsRes.json(),
                analyticsRes.json()
            ]);

            if (metricsData.success) setMetrics(metricsData.data);
            if (analyticsData.success) setAnalytics(analyticsData.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}د ${hours}س ${minutes}ق`;
    };

    const getHealthColor = (status) => {
        return status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'error';
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    if (!metrics || !analytics) {
        return <div className={styles.error}>فشل تحميل البيانات</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>🖥️ مراقبة النظام</h1>
                    <p>مراقبة الأداء والتحليلات في الوقت الفعلي</p>
                </div>
                <div className={styles.headerActions}>
                    <label className={styles.refreshToggle}>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span>تحديث تلقائي</span>
                    </label>
                    <button className={styles.refreshBtn} onClick={loadData}>
                        🔄 تحديث
                    </button>
                </div>
            </div>

            {/* System Health */}
            <div className={styles.healthGrid}>
                <Card>
                    <div className={styles.healthCard}>
                        <span className={styles.healthLabel}>قاعدة البيانات</span>
                        <Badge variant={getHealthColor(metrics.health.database)}>
                            {metrics.health.database === 'healthy' ? 'سليم' : 'تحذير'}
                        </Badge>
                    </div>
                </Card>
                <Card>
                    <div className={styles.healthCard}>
                        <span className={styles.healthLabel}>API</span>
                        <Badge variant={getHealthColor(metrics.health.api)}>
                            {metrics.health.api === 'healthy' ? 'سليم' : 'تحذير'}
                        </Badge>
                    </div>
                </Card>
                <Card>
                    <div className={styles.healthCard}>
                        <span className={styles.healthLabel}>التخزين</span>
                        <Badge variant={getHealthColor(metrics.health.storage)}>
                            {metrics.health.storage === 'healthy' ? 'سليم' : 'تحذير'}
                        </Badge>
                    </div>
                </Card>
                <Card>
                    <div className={styles.healthCard}>
                        <span className={styles.healthLabel}>الحالة العامة</span>
                        <Badge variant={getHealthColor(metrics.health.overall)}>
                            {metrics.health.overall === 'healthy' ? 'ممتاز' : 'تحذير'}
                        </Badge>
                    </div>
                </Card>
            </div>

            {/* Performance Metrics */}
            <div className={styles.metricsGrid}>
                <Card title="أداء الخادم">
                    <div className={styles.metricsList}>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>وقت التشغيل:</span>
                            <span className={styles.metricValue}>{formatUptime(metrics.server.uptime)}</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>الذاكرة:</span>
                            <span className={styles.metricValue}>
                                {metrics.server.memory.used}MB / {metrics.server.memory.total}MB
                                ({metrics.server.memory.percentage}%)
                            </span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>الإصدار:</span>
                            <span className={styles.metricValue}>{metrics.application.version}</span>
                        </div>
                    </div>
                </Card>

                <Card title="أداء التطبيق">
                    <div className={styles.metricsList}>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>متوسط استجابة API:</span>
                            <span className={styles.metricValue}>{metrics.performance.apiResponseTime.avg}ms</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>متوسط تحميل الصفحة:</span>
                            <span className={styles.metricValue}>{metrics.performance.pageLoadTime.avg}s</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>استعلامات بطيئة:</span>
                            <span className={styles.metricValue}>{metrics.performance.databaseQueries.slow}</span>
                        </div>
                    </div>
                </Card>

                <Card title="الاستخدام الحالي">
                    <div className={styles.metricsList}>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>مستخدمون نشطون:</span>
                            <span className={styles.metricValue}>{metrics.usage.activeUsers}</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>جلسات:</span>
                            <span className={styles.metricValue}>{metrics.usage.totalSessions}</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>طلبات/دقيقة:</span>
                            <span className={styles.metricValue}>{metrics.usage.requestsPerMinute}</span>
                        </div>
                    </div>
                </Card>

                <Card title="الموارد">
                    <div className={styles.metricsList}>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>التخزين:</span>
                            <span className={styles.metricValue}>
                                {metrics.resources.storage.used}GB / {metrics.resources.storage.total}GB
                            </span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>Bandwidth (In):</span>
                            <span className={styles.metricValue}>{metrics.resources.bandwidth.incoming}MB/h</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.metricLabel}>Bandwidth (Out):</span>
                            <span className={styles.metricValue}>{metrics.resources.bandwidth.outgoing}MB/h</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* User Analytics */}
            <div className={styles.analyticsGrid}>
                <Card title="نظرة عامة على المستخدمين">
                    <div className={styles.overviewStats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{analytics.overview.totalUsers}</span>
                            <span className={styles.statLabel}>إجمالي المستخدمين</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{analytics.overview.activeUsers}</span>
                            <span className={styles.statLabel}>نشطون</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{analytics.overview.newUsers}</span>
                            <span className={styles.statLabel}>جدد</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{analytics.overview.avgSessionDuration}د</span>
                            <span className={styles.statLabel}>متوسط الجلسة</span>
                        </div>
                    </div>
                </Card>

                <Card title="أكثر الصفحات زيارة">
                    <div className={styles.topList}>
                        {analytics.topPages.slice(0, 5).map((page, idx) => (
                            <div key={idx} className={styles.topItem}>
                                <span className={styles.rank}>{idx + 1}</span>
                                <span className={styles.itemName}>{page.path}</span>
                                <span className={styles.itemValue}>{page.views} زيارة</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
