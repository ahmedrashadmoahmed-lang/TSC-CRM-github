'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Tabs from '@/components/Tabs';
import ReportFilters from '@/components/reports/ReportFilters';
import SalesReport from '@/components/reports/SalesReport';
import PurchaseReport from '@/components/reports/PurchaseReport';
import ProfitabilityReport from '@/components/reports/ProfitabilityReport';
import CustomerAnalytics from '@/components/reports/CustomerAnalytics';
import styles from './reports.module.css';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('sales');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
    });
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'sales', label: '📊 Sales Report' },
        { id: 'purchases', label: '🛒 Purchase Report' },
        { id: 'profitability', label: '💰 Profitability Analysis' },
        { id: 'customers', label: '👥 Customer Analytics' },
    ];

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
    };

    const handleExport = async (format) => {
        setLoading(true);
        try {
            // TODO: Implement export functionality
            console.log(`Exporting ${activeTab} report as ${format}`);
            alert(`Export as ${format.toUpperCase()} - Coming soon!`);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setDateRange({ ...dateRange });
    };

    const renderReport = () => {
        switch (activeTab) {
            case 'sales':
                return <SalesReport dateRange={dateRange} />;
            case 'purchases':
                return <PurchaseReport dateRange={dateRange} />;
            case 'profitability':
                return <ProfitabilityReport dateRange={dateRange} />;
            case 'customers':
                return <CustomerAnalytics dateRange={dateRange} />;
            default:
                return <SalesReport dateRange={dateRange} />;
        }
    };

    return (
        <MainLayout>
            <Header title="Reports & Analytics" subtitle="View business insights and analytics" />
            <div className={styles.container}>
                <ReportFilters
                    onDateRangeChange={handleDateRangeChange}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                    loading={loading}
                />

                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                <div className={styles.reportContent}>
                    {renderReport()}
                </div>
            </div>
        </MainLayout>
    );
}
