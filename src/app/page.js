'use client';

import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/dashboard/MetricCard';
import TopDealsTable from '@/components/dashboard/TopDealsTable';
import QuickActions from '@/components/dashboard/QuickActions';
import useDashboardData from '@/hooks/useDashboardData';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './page.module.css';

export default function Home() {
  const { data, loading, error, lastUpdated, refresh } = useDashboardData(60000); // Auto-refresh every 60s

  if (error) {
    return (
      <MainLayout>
        <div className={styles.error}>
          <h2>حدث خطأ في تحميل البيانات</h2>
          <p>{error}</p>
          <button onClick={refresh} className={styles.retryButton}>
            إعادة المحاولة
          </button>
        </div>
      </MainLayout>
    );
  }

  const kpis = data?.kpis || {};
  const topCustomers = data?.topCustomers || [];
  const topDeals = data?.topDeals || [];
  const activities = data?.activities || [];

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        {/* Header with Refresh */}
        <div className={styles.headerSection}>
          <Header
            title="لوحة التحكم"
            subtitle="نظرة شاملة على أداء الأعمال"
          />
          <div className={styles.headerActions}>
            {lastUpdated && (
              <span className={styles.lastUpdated}>
                آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}
              </span>
            )}
            <button
              onClick={refresh}
              className={styles.refreshButton}
              disabled={loading}
            >
              🔄 تحديث
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className={styles.kpiGrid}>
          <MetricCard
            icon="💰"
            label={kpis.revenueMTD?.label}
            value={kpis.revenueMTD?.value}
            unit="ج.م"
            trend={kpis.revenueMTD?.trend}
            action={kpis.revenueMTD?.action}
            loading={loading}
          />

          <MetricCard
            icon="🎯"
            label={kpis.newOpportunities?.label}
            value={kpis.newOpportunities?.value}
            action={kpis.newOpportunities?.action}
            loading={loading}
          />

          <MetricCard
            icon="🏆"
            label={kpis.winRate?.label}
            value={kpis.winRate?.value}
            unit={kpis.winRate?.unit}
            action={kpis.winRate?.action}
            loading={loading}
          />

          <MetricCard
            icon="⏱️"
            label={kpis.avgSalesCycle?.label}
            value={kpis.avgSalesCycle?.value}
            unit={kpis.avgSalesCycle?.unit}
            action={kpis.avgSalesCycle?.action}
            loading={loading}
          />

          <MetricCard
            icon="⚠️"
            label={kpis.overdueInvoices?.label}
            count={kpis.overdueInvoices?.count}
            total={kpis.overdueInvoices?.total}
            status={kpis.overdueInvoices?.status}
            action={kpis.overdueInvoices?.action}
            loading={loading}
          />

          <MetricCard
            icon="📦"
            label={kpis.lowStock?.label}
            value={kpis.lowStock?.value}
            status={kpis.lowStock?.status}
            action={kpis.lowStock?.action}
            loading={loading}
          />

          <MetricCard
            icon="💵"
            label={kpis.cashCollections?.label}
            value={kpis.cashCollections?.value}
            unit="ج.م"
            action={kpis.cashCollections?.action}
            loading={loading}
          />

          <MetricCard
            icon="📝"
            label={kpis.pendingRFQs?.label}
            value={kpis.pendingRFQs?.value}
            status={kpis.pendingRFQs?.status}
            action={kpis.pendingRFQs?.action}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <QuickActions />
        </div>

        {/* Charts Section */}
        <div className={styles.chartsGrid}>
          {/* Top Customers Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>أفضل 5 عملاء (الشهر الحالي)</h3>
            {loading ? (
              <div className={styles.chartLoading}>جاري التحميل...</div>
            ) : topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.chartEmpty}>لا توجد بيانات</div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>النشاط الأخير</h3>
            {loading ? (
              <div className={styles.chartLoading}>جاري التحميل...</div>
            ) : (
              <div className={styles.activityList}>
                {activities.slice(0, 10).map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {activity.type === 'invoice' && '💰'}
                      {activity.type === 'opportunity' && '🎯'}
                      {activity.type === 'purchase_order' && '🛒'}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityDescription}>
                        {activity.description}
                      </p>
                      <span className={styles.activityTime}>
                        {new Date(activity.timestamp).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    {activity.amount && (
                      <div className={styles.activityAmount}>
                        {activity.amount.toLocaleString('ar-EG')} ج.م
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Deals Table */}
        <div className={styles.section}>
          <TopDealsTable deals={topDeals} loading={loading} />
        </div>

        {/* Alerts Section */}
        {data?.alerts && (data.alerts.lowStock || data.alerts.overdueInvoices || data.alerts.pendingRFQs) && (
          <div className={styles.alertsSection}>
            <h3 className={styles.alertsTitle}>تنبيهات مهمة</h3>
            <div className={styles.alertsGrid}>
              {data.alerts.lowStock && (
                <div className={styles.alert}>
                  <span className={styles.alertIcon}>⚠️</span>
                  <span className={styles.alertText}>
                    يوجد منتجات منخفضة المخزون تحتاج إعادة طلب
                  </span>
                </div>
              )}
              {data.alerts.overdueInvoices && (
                <div className={styles.alert}>
                  <span className={styles.alertIcon}>🔴</span>
                  <span className={styles.alertText}>
                    يوجد فواتير متأخرة تحتاج متابعة
                  </span>
                </div>
              )}
              {data.alerts.pendingRFQs && (
                <div className={styles.alert}>
                  <span className={styles.alertIcon}>📝</span>
                  <span className={styles.alertText}>
                    يوجد طلبات عروض معلقة تحتاج رد
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
