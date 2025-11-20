'use client';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import styles from './reports.module.css';

export default function Reports() {
    return (
        <MainLayout>
            <Header title="Reports & Analytics" subtitle="View business insights and analytics" />
            <div className={styles.container}>
                <div className={styles.grid}>
                    <Card title="Sales Report" hover>
                        <p className={styles.reportDesc}>Monthly sales performance and trends</p>
                        <div className={styles.chartPlaceholder}>📊 Chart Coming Soon</div>
                    </Card>
                    <Card title="Purchase Report" hover>
                        <p className={styles.reportDesc}>Purchase order analysis and spending</p>
                        <div className={styles.chartPlaceholder}>📈 Chart Coming Soon</div>
                    </Card>
                    <Card title="Profitability Analysis" hover>
                        <p className={styles.reportDesc}>Profit margins and revenue breakdown</p>
                        <div className={styles.chartPlaceholder}>💹 Chart Coming Soon</div>
                    </Card>
                    <Card title="Customer Analytics" hover>
                        <p className={styles.reportDesc}>Customer behavior and lifetime value</p>
                        <div className={styles.chartPlaceholder}>👥 Chart Coming Soon</div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
