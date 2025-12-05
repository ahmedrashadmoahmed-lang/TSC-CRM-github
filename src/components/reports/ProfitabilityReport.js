'use client';

import { useState, useEffect } from 'react';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import AreaChart from '@/components/charts/AreaChart';
import MetricsCard from './MetricsCard';
import styles from './Report.module.css';

export default function ProfitabilityReport({ dateRange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfitabilityData();
    }, [dateRange]);

    const fetchProfitabilityData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange?.startDate) params.append('startDate', dateRange.startDate.toISOString());
            if (dateRange?.endDate) params.append('endDate', dateRange.endDate.toISOString());

            const response = await fetch(`/api/reports/profitability?${params}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching profitability data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading profitability data...</div>;
    }

    if (!data) {
        return <div className={styles.error}>Failed to load profitability data</div>;
    }

    const formatCurrency = (value) => `EGP ${value.toLocaleString()}`;

    const revenueBreakdown = [
        { name: 'Sales', value: data.revenue?.sales || 0 },
        { name: 'VAT', value: data.revenue?.vat || 0 },
        { name: 'Tax', value: data.revenue?.tax || 0 },
    ];

    return (
        <div className={styles.reportContainer}>
            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
                <MetricsCard
                    title="Total Revenue"
                    value={formatCurrency(data.revenue?.total || 0)}
                    icon="💰"
                    color="primary"
                />
                <MetricsCard
                    title="Gross Profit"
                    value={formatCurrency(data.profit?.gross || 0)}
                    icon="📈"
                    color="success"
                />
                <MetricsCard
                    title="Net Profit"
                    value={formatCurrency(data.profit?.net || 0)}
                    icon="💵"
                    color="success"
                />
                <MetricsCard
                    title="Profit Margin"
                    value={`${(data.profit?.margin || 0).toFixed(1)}%`}
                    icon="📊"
                    color={data.profit?.margin > 20 ? 'success' : data.profit?.margin > 10 ? 'warning' : 'danger'}
                />
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                {data.comparison && data.comparison.length > 0 && (
                    <div className={styles.chartWrapperFull}>
                        <LineChart
                            title="Revenue vs Expenses"
                            data={data.comparison}
                            xKey="month"
                            lines={[
                                { key: 'revenue', color: '#10b981', name: 'Revenue' },
                                { key: 'expenses', color: '#ef4444', name: 'Expenses' },
                            ]}
                            height={350}
                            formatYAxis={formatCurrency}
                            formatTooltip={(value) => [formatCurrency(value), '']}
                        />
                    </div>
                )}

                <div className={styles.chartWrapper}>
                    <PieChart
                        title="Revenue Breakdown"
                        data={revenueBreakdown}
                        dataKey="value"
                        nameKey="name"
                        height={350}
                        formatTooltip={(value) => [formatCurrency(value), '']}
                        colors={['#3b82f6', '#10b981', '#f59e0b']}
                    />
                </div>

                {data.profitTrend && data.profitTrend.length > 0 && (
                    <div className={styles.chartWrapper}>
                        <AreaChart
                            title="Profit Margin Trend"
                            data={data.profitTrend}
                            xKey="month"
                            areas={[{ key: 'margin', color: '#10b981', name: 'Profit Margin %' }]}
                            height={350}
                            formatYAxis={(value) => `${value}%`}
                            formatTooltip={(value) => [`${value.toFixed(1)}%`, 'Margin']}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
