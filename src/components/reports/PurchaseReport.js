'use client';

import { useState, useEffect } from 'react';
import AreaChart from '@/components/charts/AreaChart';
import BarChart from '@/components/charts/BarChart';
import MetricsCard from './MetricsCard';
import styles from './Report.module.css';

export default function PurchaseReport({ dateRange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPurchaseData();
    }, [dateRange]);

    const fetchPurchaseData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange?.startDate) params.append('startDate', dateRange.startDate.toISOString());
            if (dateRange?.endDate) params.append('endDate', dateRange.endDate.toISOString());

            const response = await fetch(`/api/reports/purchases?${params}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching purchase data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading purchase data...</div>;
    }

    if (!data) {
        return <div className={styles.error}>Failed to load purchase data</div>;
    }

    const formatCurrency = (value) => `EGP ${value.toLocaleString()}`;

    return (
        <div className={styles.reportContainer}>
            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
                <MetricsCard
                    title="Total Spending"
                    value={formatCurrency(data.totalSpending || 0)}
                    subtitle={`${data.totalOrders || 0} purchase orders`}
                    icon="🛒"
                    color="primary"
                />
                <MetricsCard
                    title="Average PO Value"
                    value={formatCurrency(data.averageOrderValue || 0)}
                    icon="💵"
                    color="success"
                />
                <MetricsCard
                    title="Pending Orders"
                    value={data.pendingOrders || 0}
                    subtitle={formatCurrency(data.pendingValue || 0)}
                    icon="⏳"
                    color="warning"
                />
                <MetricsCard
                    title="Completed Orders"
                    value={data.completedOrders || 0}
                    subtitle={formatCurrency(data.completedValue || 0)}
                    icon="✅"
                    color="success"
                />
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                {data.trendData && data.trendData.length > 0 && (
                    <div className={styles.chartWrapperFull}>
                        <AreaChart
                            title="Purchase Order Trends"
                            data={data.trendData}
                            xKey="month"
                            areas={[{ key: 'value', color: '#8b5cf6', name: 'Spending' }]}
                            height={350}
                            formatYAxis={formatCurrency}
                            formatTooltip={(value) => [formatCurrency(value), 'Spending']}
                        />
                    </div>
                )}

                {data.topSuppliers && data.topSuppliers.length > 0 && (
                    <div className={styles.chartWrapper}>
                        <BarChart
                            title="Top Suppliers"
                            data={data.topSuppliers}
                            xKey="name"
                            bars={[{ key: 'value', color: '#3b82f6', name: 'Total Spent' }]}
                            height={350}
                            formatYAxis={formatCurrency}
                            formatTooltip={(value) => [formatCurrency(value), 'Spent']}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
