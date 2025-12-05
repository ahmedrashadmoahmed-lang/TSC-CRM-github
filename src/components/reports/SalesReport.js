'use client';

import { useState, useEffect } from 'react';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import MetricsCard from './MetricsCard';
import styles from './Report.module.css';

export default function SalesReport({ dateRange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSalesData();
    }, [dateRange]);

    const fetchSalesData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (dateRange?.startDate) params.append('startDate', dateRange.startDate.toISOString());
            if (dateRange?.endDate) params.append('endDate', dateRange.endDate.toISOString());

            const response = await fetch(`/api/analytics/sales?${params}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to load sales data');
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
            setError(error.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading sales data...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h3>Error Loading Sales Data</h3>
                <p>{error}</p>
                <button onClick={fetchSalesData} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    if (!data) {
        return <div className={styles.error}>No sales data available</div>;
    }

    // Prepare chart data
    const statusData = [
        { name: 'Paid', value: data.paid?.value || 0 },
        { name: 'Pending', value: data.pending?.value || 0 },
    ];

    const typeData = data.byType?.map(item => ({
        name: item.type || 'Unknown',
        value: item.value || 0,
    })) || [];

    const formatCurrency = (value) => `EGP ${value.toLocaleString()}`;

    return (
        <div className={styles.reportContainer}>
            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
                <MetricsCard
                    title="Total Sales"
                    value={formatCurrency(data.total?.value || 0)}
                    subtitle={`${data.total?.count || 0} invoices`}
                    icon="💰"
                    color="primary"
                />
                <MetricsCard
                    title="Paid Sales"
                    value={formatCurrency(data.paid?.value || 0)}
                    subtitle={`${data.paid?.count || 0} invoices`}
                    icon="✅"
                    color="success"
                />
                <MetricsCard
                    title="Pending Sales"
                    value={formatCurrency(data.pending?.value || 0)}
                    subtitle={`${data.pending?.count || 0} invoices`}
                    icon="⏳"
                    color="warning"
                />
                <MetricsCard
                    title="Average Order Value"
                    value={formatCurrency(data.total?.count > 0 ? data.total.value / data.total.count : 0)}
                    icon="📊"
                    color="primary"
                />
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartWrapper}>
                    <PieChart
                        title="Sales by Status"
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        height={350}
                        formatTooltip={(value) => [formatCurrency(value), '']}
                        colors={['#10b981', '#f59e0b']}
                    />
                </div>

                {typeData.length > 0 && (
                    <div className={styles.chartWrapper}>
                        <BarChart
                            title="Sales by Type"
                            data={typeData}
                            xKey="name"
                            bars={[{ key: 'value', color: '#3b82f6', name: 'Sales Value' }]}
                            height={350}
                            formatYAxis={formatCurrency}
                            formatTooltip={(value) => [formatCurrency(value), 'Sales']}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
