'use client';

import MainLayout from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import SmartSearch from '@/components/dashboard/SmartSearch';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import SalesFunnelChart from '@/components/dashboard/SalesFunnelChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import TopDealsTable from '@/components/dashboard/TopDealsTable';
import { Users, TrendingUp, Target, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useKPIs, useAlerts, useSalesFunnel } from '@/hooks/useDashboard';
import styles from './enhanced-dashboard.module.css';

export default function EnhancedDashboard() {
    // Use real data hooks
    const { data: kpis, loading: kpisLoading, error: kpisError, refresh: refreshKPIs } = useKPIs(60000);
    const { alerts, dismissAlert, markAsRead } = useAlerts();
    const { data: funnelData, loading: funnelLoading } = useSalesFunnel();

    return (
        <MainLayout>
            <div className={styles.dashboard}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Dashboard</h1>
                        <p className={styles.subtitle}>Welcome back! Here's what's happening with your business today.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <AlertsPanel
                            alerts={alerts}
                            onDismiss={dismissAlert}
                            onMarkAsRead={markAsRead}
                        />
                        <button
                            className={styles.refreshButton}
                            onClick={refreshKPIs}
                            disabled={kpisLoading}
                        >
                            <RefreshCw size={16} className={kpisLoading ? styles.spinning : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Smart Search */}
                <div className={styles.searchSection}>
                    <SmartSearch />
                </div>

                {/* Error Display */}
                {kpisError && (
                    <div className={styles.error}>
                        <AlertCircle size={20} />
                        <span>Error loading KPIs: {kpisError}</span>
                    </div>
                )}

                {/* KPI Cards */}
                <div className={styles.kpiGrid}>
                    <KPICard
                        title="Total Clients"
                        value={kpis?.totalClients?.value || 0}
                        trend={kpis?.totalClients?.trend}
                        sparkline={kpis?.totalClients?.sparkline}
                        icon={<Users size={24} />}
                        onClick={() => window.location.href = '/contacts'}
                        loading={kpisLoading}
                    />

                    <KPICard
                        title="New Leads"
                        value={kpis?.newLeads?.value || 0}
                        trend={kpis?.newLeads?.trend}
                        sparkline={kpis?.newLeads?.sparkline}
                        icon={<TrendingUp size={24} />}
                        onClick={() => window.location.href = '/pipeline?filter=lead'}
                        loading={kpisLoading}
                    />

                    <KPICard
                        title="Open Deals"
                        value={kpis?.openDeals?.value || 0}
                        trend={kpis?.openDeals?.trend}
                        sparkline={kpis?.openDeals?.sparkline}
                        unit={kpis?.openDeals?.totalValue ? `$${(kpis.openDeals.totalValue).toLocaleString()}` : ''}
                        icon={<Target size={24} />}
                        onClick={() => window.location.href = '/pipeline'}
                        loading={kpisLoading}
                    />

                    <KPICard
                        title="Conversion Rate"
                        value={kpis?.conversionRate?.value || 0}
                        trend={kpis?.conversionRate?.trend}
                        sparkline={kpis?.conversionRate?.sparkline}
                        unit="%"
                        icon={<CheckCircle size={24} />}
                        loading={kpisLoading}
                        status={
                            (kpis?.conversionRate?.value || 0) > 30 ? 'success' :
                                (kpis?.conversionRate?.value || 0) > 20 ? 'warning' : 'danger'
                        }
                    />

                    <KPICard
                        title="Pending Tasks"
                        value={kpis?.pendingTasks?.value || 0}
                        sparkline={kpis?.pendingTasks?.sparkline}
                        unit={kpis?.pendingTasks?.overdue ? `${kpis.pendingTasks.overdue} overdue` : undefined}
                        icon={<AlertCircle size={24} />}
                        loading={kpisLoading}
                        status={kpis?.pendingTasks?.overdue ? 'warning' : 'normal'}
                        onClick={() => window.location.href = '/tasks'}
                    />
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <QuickActions />
                </div>

                {/* Charts Grid */}
                <div className={styles.chartsGrid}>
                    {/* Sales Funnel */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Sales Funnel</h3>
                        {funnelLoading ? (
                            <div className={styles.chartLoading}>Loading...</div>
                        ) : (
                            <SalesFunnelChart data={funnelData} />
                        )}
                    </div>

                    {/* AI Insights */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>AI Insights & Recommendations</h3>
                        <AIInsightsPanel />
                    </div>
                </div>

                {/* Activity Feed */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Activity</h2>
                    <ActivityFeed limit={10} />
                </div>

                {/* Top Deals */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Top Deals</h2>
                    <TopDealsTable deals={[]} loading={kpisLoading} />
                </div>
            </div>
        </MainLayout>
    );
}
