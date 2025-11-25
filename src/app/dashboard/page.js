'use client';

import { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import MetricCard from '@/components/dashboard/MetricCard';
import SmartSearch from '@/components/dashboard/SmartSearch';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import SalesFunnelChart from '@/components/dashboard/SalesFunnelChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import TopDealsTable from '@/components/dashboard/TopDealsTable';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import QuickFilters from '@/components/dashboard/QuickFilters';
import ExportButton from '@/components/dashboard/ExportButton';
import ThemeToggle from '@/components/dashboard/ThemeToggle';
import KeyboardShortcuts from '@/components/dashboard/KeyboardShortcuts';
import DashboardSettings, { useWidgetVisibility } from '@/components/dashboard/DashboardSettings';
import PerformanceIndicator from '@/components/dashboard/PerformanceIndicator';
import NewDataBadge from '@/components/dashboard/NewDataBadge';
import {
    Users, TrendingUp, Target, CheckCircle, AlertCircle, RefreshCw,
    DollarSign, Package, Clock, FileText, ShoppingCart, Wallet,
    TrendingDown, Activity, BarChart3, PieChart, Zap
} from 'lucide-react';
import { useKPIs, useAlerts, useSalesFunnel } from '@/hooks/useDashboard';
import useDashboardData from '@/hooks/useDashboardData';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './comprehensive-dashboard.module.css';

export default function ComprehensiveDashboard() {
    // Widget visibility
    const { isVisible, setWidgets } = useWidgetVisibility();

    // Date range state
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [activeFilter, setActiveFilter] = useState('month');
    const searchRef = useRef(null);
    const exportButtonRef = useRef(null);

    // Use both hooks for complete data
    const { data: enhancedKpis, loading: enhancedLoading, error: kpisError, refresh: refreshKPIs } = useKPIs(60000);
    const { data: originalData, loading: originalLoading, error, lastUpdated, refresh: refreshOriginal } = useDashboardData(60000);
    const { alerts, dismissAlert, markAsRead } = useAlerts();
    const { data: funnelData, loading: funnelLoading } = useSalesFunnel();

    const loading = enhancedLoading || originalLoading;
    const kpis = originalData?.kpis || {};
    const topCustomers = originalData?.topCustomers || [];
    const topDeals = originalData?.topDeals || [];
    const activities = originalData?.activities || {};

    const handleRefresh = () => {
        refreshKPIs();
        refreshOriginal();
    };

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
        // TODO: Refresh data with new date range
        handleRefresh();
    };

    const handleQuickFilter = (filterId, days) => {
        setActiveFilter(filterId);
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        setDateRange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
        handleRefresh();
    };

    const handleKeyboardAction = (action) => {
        switch (action) {
            case 'refresh':
                handleRefresh();
                break;
            case 'export':
                exportButtonRef.current?.click();
                break;
            case 'search':
                searchRef.current?.querySelector('input')?.focus();
                break;
            case 'theme':
                // Theme toggle is handled by ThemeToggle component
                document.querySelector('[data-theme-toggle]')?.click();
                break;
        }
    };

    if (error) {
        return (
            <MainLayout>
                <div className={styles.error}>
                    <h2>حدث خطأ في تحميل البيانات</h2>
                    <p>{error}</p>
                    <button onClick={handleRefresh} className={styles.retryButton}>
                        إعادة المحاولة
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.dashboard}>
                {/* Keyboard Shortcuts Handler */}
                <KeyboardShortcuts onAction={handleKeyboardAction} />

                {/* New Data Badge */}
                <NewDataBadge onRefresh={handleRefresh} />

                {/* Header Section */}
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
                        <DateRangePicker
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onChange={handleDateRangeChange}
                        />
                        <div ref={exportButtonRef}>
                            <ExportButton dashboardData={originalData} />
                        </div>
                        <DashboardSettings onSettingsChange={setWidgets} />
                        <ThemeToggle data-theme-toggle />
                        <AlertsPanel
                            alerts={alerts}
                            onDismiss={dismissAlert}
                            onMarkAsRead={markAsRead}
                        />
                        <button
                            onClick={handleRefresh}
                            className={styles.refreshButton}
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                            تحديث
                        </button>
                    </div>
                </div>

                {/* Quick Filters */}
                <QuickFilters
                    activeFilter={activeFilter}
                    onFilterChange={handleQuickFilter}
                />

                {/* Smart Search */}
                <div className={styles.searchSection} ref={searchRef}>
                    <SmartSearch />
                </div>

                {/* Error Display */}
                {kpisError && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={20} />
                        <span>خطأ في تحميل بعض البيانات: {kpisError}</span>
                    </div>
                )}

                {/* Performance Indicators */}
                {isVisible('performance') && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>مؤشرات الأداء والأهداف</h2>
                        <div className={styles.performanceGrid}>
                            <PerformanceIndicator
                                title="الإيرادات الشهرية"
                                current={kpis.revenueMTD?.value || 0}
                                target={500000}
                                unit="ج.م"
                                icon={DollarSign}
                            />
                            <PerformanceIndicator
                                title="الصفقات المغلقة"
                                current={enhancedKpis?.closedDeals?.value || 0}
                                target={50}
                                unit="صفقة"
                                icon={CheckCircle}
                            />
                            <PerformanceIndicator
                                title="العملاء الجدد"
                                current={enhancedKpis?.newLeads?.value || 0}
                                target={100}
                                unit="عميل"
                                icon={Users}
                            />
                            <PerformanceIndicator
                                title="معدل التحويل"
                                current={enhancedKpis?.conversionRate?.value || 0}
                                target={30}
                                unit="%"
                                icon={Target}
                            />
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {kpisError && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={20} />
                        <span>خطأ في تحميل بعض البيانات: {kpisError}</span>
                    </div>
                )}

                {/* Enhanced KPI Cards with Sparklines */}
                <div className={styles.enhancedKpiGrid}>
                    <KPICard
                        title="إجمالي العملاء"
                        value={enhancedKpis?.totalClients?.value || 0}
                        trend={enhancedKpis?.totalClients?.trend}
                        sparkline={enhancedKpis?.totalClients?.sparkline}
                        icon={<Users size={24} />}
                        onClick={() => window.location.href = '/contacts'}
                        loading={enhancedLoading}
                    />

                    <KPICard
                        title="عملاء جدد"
                        value={enhancedKpis?.newLeads?.value || 0}
                        trend={enhancedKpis?.newLeads?.trend}
                        sparkline={enhancedKpis?.newLeads?.sparkline}
                        icon={<TrendingUp size={24} />}
                        onClick={() => window.location.href = '/pipeline?filter=lead'}
                        loading={enhancedLoading}
                    />

                    <KPICard
                        title="الصفقات المفتوحة"
                        value={enhancedKpis?.openDeals?.value || 0}
                        trend={enhancedKpis?.openDeals?.trend}
                        sparkline={enhancedKpis?.openDeals?.sparkline}
                        unit={enhancedKpis?.openDeals?.totalValue ? `${(enhancedKpis.openDeals.totalValue).toLocaleString()} ج.م` : ''}
                        icon={<Target size={24} />}
                        onClick={() => window.location.href = '/pipeline'}
                        loading={enhancedLoading}
                    />

                    <KPICard
                        title="معدل التحويل"
                        value={enhancedKpis?.conversionRate?.value || 0}
                        trend={enhancedKpis?.conversionRate?.trend}
                        sparkline={enhancedKpis?.conversionRate?.sparkline}
                        unit="%"
                        icon={<CheckCircle size={24} />}
                        loading={enhancedLoading}
                        status={
                            (enhancedKpis?.conversionRate?.value || 0) > 30 ? 'success' :
                                (enhancedKpis?.conversionRate?.value || 0) > 20 ? 'warning' : 'danger'
                        }
                    />

                    <KPICard
                        title="المهام المعلقة"
                        value={enhancedKpis?.pendingTasks?.value || 0}
                        sparkline={enhancedKpis?.pendingTasks?.sparkline}
                        unit={enhancedKpis?.pendingTasks?.overdue ? `${enhancedKpis.pendingTasks.overdue} متأخرة` : undefined}
                        icon={<AlertCircle size={24} />}
                        loading={enhancedLoading}
                        status={enhancedKpis?.pendingTasks?.overdue ? 'warning' : 'normal'}
                        onClick={() => window.location.href = '/tasks'}
                    />
                </div>

                {/* Original KPI Cards Grid */}
                <div className={styles.kpiGrid}>
                    <MetricCard
                        icon={<DollarSign size={24} />}
                        label={kpis.revenueMTD?.label}
                        value={kpis.revenueMTD?.value}
                        unit="ج.م"
                        trend={kpis.revenueMTD?.trend}
                        action={kpis.revenueMTD?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<Target size={24} />}
                        label={kpis.newOpportunities?.label}
                        value={kpis.newOpportunities?.value}
                        action={kpis.newOpportunities?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<TrendingUp size={24} />}
                        label={kpis.winRate?.label}
                        value={kpis.winRate?.value}
                        unit={kpis.winRate?.unit}
                        action={kpis.winRate?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<Clock size={24} />}
                        label={kpis.avgSalesCycle?.label}
                        value={kpis.avgSalesCycle?.value}
                        unit={kpis.avgSalesCycle?.unit}
                        action={kpis.avgSalesCycle?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<AlertCircle size={24} />}
                        label={kpis.overdueInvoices?.label}
                        count={kpis.overdueInvoices?.count}
                        total={kpis.overdueInvoices?.total}
                        status={kpis.overdueInvoices?.status}
                        action={kpis.overdueInvoices?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<Package size={24} />}
                        label={kpis.lowStock?.label}
                        value={kpis.lowStock?.value}
                        status={kpis.lowStock?.status}
                        action={kpis.lowStock?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<Wallet size={24} />}
                        label={kpis.cashCollections?.label}
                        value={kpis.cashCollections?.value}
                        unit="ج.م"
                        action={kpis.cashCollections?.action}
                        loading={loading}
                    />

                    <MetricCard
                        icon={<FileText size={24} />}
                        label={kpis.pendingRFQs?.label}
                        value={kpis.pendingRFQs?.value}
                        status={kpis.pendingRFQs?.status}
                        action={kpis.pendingRFQs?.action}
                        loading={loading}
                    />
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
                    <QuickActions />
                </div>

                {/* Charts Grid */}
                <div className={styles.chartsGrid}>
                    {/* Sales Funnel */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>قمع المبيعات</h3>
                        {funnelLoading ? (
                            <div className={styles.chartLoading}>جاري التحميل...</div>
                        ) : (
                            <SalesFunnelChart data={funnelData} />
                        )}
                    </div>

                    {/* Top Customers Chart */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>أفضل 5 عملاء (الشهر الحالي)</h3>
                        {loading ? (
                            <div className={styles.chartLoading}>جاري التحميل...</div>
                        ) : topCustomers.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topCustomers}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px', fontWeight: 500 }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px', fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            color: '#1f2937',
                                            fontWeight: 500
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="url(#colorGradient)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.chartEmpty}>لا توجد بيانات</div>
                        )}
                    </div>

                    {/* AI Insights */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>رؤى وتوصيات الذكاء الاصطناعي</h3>
                        <AIInsightsPanel />
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
                                            {activity.type === 'invoice' && <DollarSign size={20} />}
                                            {activity.type === 'opportunity' && <Target size={20} />}
                                            {activity.type === 'purchase_order' && <ShoppingCart size={20} />}
                                            {!activity.type && <Activity size={20} />}
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

                {/* Recent Activity Feed */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>سجل النشاط التفصيلي</h2>
                    <ActivityFeed limit={15} />
                </div>

                {/* Top Deals Table */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>أفضل الصفقات</h2>
                    <TopDealsTable deals={topDeals} loading={loading} />
                </div>

                {/* Alerts Section */}
                {originalData?.alerts && (originalData.alerts.lowStock || originalData.alerts.overdueInvoices || originalData.alerts.pendingRFQs) && (
                    <div className={styles.alertsSection}>
                        <h3 className={styles.alertsTitle}>تنبيهات مهمة</h3>
                        <div className={styles.alertsGrid}>
                            {originalData.alerts.lowStock && (
                                <div className={styles.alert}>
                                    <span className={styles.alertIcon}>
                                        <Package size={24} />
                                    </span>
                                    <span className={styles.alertText}>
                                        يوجد منتجات منخفضة المخزون تحتاج إعادة طلب
                                    </span>
                                </div>
                            )}
                            {originalData.alerts.overdueInvoices && (
                                <div className={styles.alert}>
                                    <span className={styles.alertIcon}>
                                        <AlertCircle size={24} />
                                    </span>
                                    <span className={styles.alertText}>
                                        يوجد فواتير متأخرة تحتاج متابعة
                                    </span>
                                </div>
                            )}
                            {originalData.alerts.pendingRFQs && (
                                <div className={styles.alert}>
                                    <span className={styles.alertIcon}>
                                        <FileText size={24} />
                                    </span>
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
