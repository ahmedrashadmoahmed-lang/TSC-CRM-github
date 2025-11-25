'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import SimpleBarChart from '@/components/dashboard/SimpleBarChart';
import { useFetch } from '@/hooks';
import { formatCurrency, formatNumber } from '@/utils/helpers';

export default function DashboardPage() {
    const { data: dashboardData, loading, error, refetch } = useFetch('/api/analytics/dashboard');

    const stats = dashboardData?.overview || {};
    const topCustomers = dashboardData?.topCustomers || [];
    const recentInvoices = dashboardData?.recentInvoices || [];
    const monthlyRevenue = dashboardData?.monthlyRevenue || [];

    // Format monthly revenue for chart
    const chartData = monthlyRevenue.map((item) => ({
        label: item.month,
        value: item.revenue,
    }));

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1>لوحة التحكم</h1>
                    <p className="page-subtitle">نظرة عامة على أداء النظام</p>
                </div>
                <button onClick={refetch} className="btn-refresh">
                    🔄 تحديث
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <StatCard
                    title="إجمالي العملاء"
                    value={formatNumber(stats.totalCustomers)}
                    icon="👥"
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    title="إجمالي الفواتير"
                    value={formatNumber(stats.totalInvoices)}
                    icon="📄"
                    color="info"
                    loading={loading}
                />
                <StatCard
                    title="إجمالي الإيرادات"
                    value={formatCurrency(stats.totalRevenue)}
                    icon="💰"
                    color="success"
                    loading={loading}
                />
                <StatCard
                    title="فواتير معلقة"
                    value={formatNumber(stats.pendingInvoices)}
                    icon="⏳"
                    color="warning"
                    loading={loading}
                />
                <StatCard
                    title="فواتير متأخرة"
                    value={formatNumber(stats.overdueInvoices)}
                    icon="⚠️"
                    color="error"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <ChartCard
                    title="الإيرادات الشهرية"
                    subtitle="آخر 12 شهر"
                    loading={loading}
                    actions={
                        <button className="btn-secondary">تصدير</button>
                    }
                >
                    <SimpleBarChart
                        data={chartData}
                        xKey="label"
                        yKey="value"
                        formatValue={formatCurrency}
                        height={300}
                    />
                </ChartCard>

                <ChartCard
                    title="أفضل العملاء"
                    subtitle="حسب القيمة الإجمالية"
                    loading={loading}
                >
                    <div className="top-customers-list">
                        {topCustomers.map((customer, index) => (
                            <div key={customer.id} className="customer-item">
                                <div className="customer-rank">{index + 1}</div>
                                <div className="customer-info">
                                    <div className="customer-name">{customer.name}</div>
                                    <div className="customer-stats">
                                        {formatNumber(customer.totalInvoices)} فاتورة
                                    </div>
                                </div>
                                <div className="customer-value">
                                    {formatCurrency(customer.totalValue)}
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Recent Invoices */}
            <ChartCard
                title="الفواتير الأخيرة"
                subtitle="آخر 10 فواتير"
                loading={loading}
            >
                <div className="invoices-table">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>العميل</th>
                                <th>التاريخ</th>
                                <th>القيمة</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.invoiceNumber}</td>
                                    <td>{invoice.customer.name}</td>
                                    <td>{new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{formatCurrency(invoice.finalValue)}</td>
                                    <td>
                                        <span className={`status-badge status-${invoice.status}`}>
                                            {invoice.status === 'paid' ? 'مدفوعة' :
                                                invoice.status === 'pending' ? 'معلقة' :
                                                    invoice.status === 'partial' ? 'جزئية' : 'ملغاة'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>

            <style jsx>{`
        .dashboard-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }

        .btn-refresh {
          padding: 0.75rem 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .btn-refresh:hover {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .top-customers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .customer-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .customer-item:hover {
          background: var(--bg-tertiary);
          transform: translateX(-4px);
        }

        .customer-rank {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-light);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .customer-info {
          flex: 1;
        }

        .customer-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .customer-stats {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .customer-value {
          font-weight: 700;
          color: var(--primary-color);
        }

        .invoices-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: var(--bg-secondary);
        }

        th {
          padding: 1rem;
          text-align: right;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: 1rem;
          text-align: right;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        tbody tr:hover {
          background: var(--bg-secondary);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-paid {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .status-pending {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .status-partial {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .status-cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-refresh {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
