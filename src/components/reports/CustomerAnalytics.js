'use client';

import { useState, useEffect } from 'react';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import MetricsCard from './MetricsCard';
import styles from './Report.module.css';

export default function CustomerAnalytics({ dateRange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerData();
    }, [dateRange]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/customers');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading customer analytics...</div>;
    }

    if (!data) {
        return <div className={styles.error}>Failed to load customer analytics</div>;
    }

    const formatCurrency = (value) => `EGP ${value.toLocaleString()}`;

    const topCustomersData = data.topCustomers?.slice(0, 10).map(customer => ({
        name: customer.name,
        value: customer.totalValue || 0,
    })) || [];

    const customerTypeData = data.byType?.map(item => ({
        name: item.type || 'Unknown',
        value: item.count || 0,
    })) || [];

    const avgCustomerValue = data.total > 0
        ? (data.topCustomers?.reduce((sum, c) => sum + (c.totalValue || 0), 0) || 0) / data.total
        : 0;

    return (
        <div className={styles.reportContainer}>
            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
                <MetricsCard
                    title="Total Customers"
                    value={data.total || 0}
                    icon="👥"
                    color="primary"
                />
                <MetricsCard
                    title="Active Customers"
                    value={data.active || 0}
                    subtitle={`${((data.active / data.total) * 100 || 0).toFixed(1)}% of total`}
                    icon="✅"
                    color="success"
                />
                <MetricsCard
                    title="Inactive Customers"
                    value={data.inactive || 0}
                    subtitle={`${((data.inactive / data.total) * 100 || 0).toFixed(1)}% of total`}
                    icon="⏸️"
                    color="warning"
                />
                <MetricsCard
                    title="Avg Customer Value"
                    value={formatCurrency(avgCustomerValue)}
                    icon="💰"
                    color="primary"
                />
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                {topCustomersData.length > 0 && (
                    <div className={styles.chartWrapperFull}>
                        <BarChart
                            title="Top 10 Customers by Revenue"
                            data={topCustomersData}
                            xKey="name"
                            bars={[{ key: 'value', color: '#3b82f6', name: 'Total Revenue' }]}
                            height={350}
                            formatYAxis={formatCurrency}
                            formatTooltip={(value) => [formatCurrency(value), 'Revenue']}
                        />
                    </div>
                )}

                {customerTypeData.length > 0 && (
                    <div className={styles.chartWrapper}>
                        <PieChart
                            title="Customer Distribution by Type"
                            data={customerTypeData}
                            dataKey="value"
                            nameKey="name"
                            height={350}
                            formatTooltip={(value) => [value, 'Customers']}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
