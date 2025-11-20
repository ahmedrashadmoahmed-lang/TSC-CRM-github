'use client';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';
import { stats, invoices, customers } from '@/data/realData';

export default function Home() {
  const recentActivities = invoices.slice(0, 5).map(inv => ({
    id: inv.id,
    type: inv.status === 'paid' ? 'payment' : 'invoice',
    title: inv.status === 'paid' ? 'تم تحصيل فاتورة' : 'فاتورة جديدة',
    description: `${inv.customerName} - ${inv.description.substring(0, 30)}...`,
    amount: `EGP ${inv.finalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    time: inv.date,
    status: inv.status
  }));

  return (
    <MainLayout>
      <Header
        title="لوحة التحكم"
        subtitle="نظرة عامة على أداء الأعمال"
      />

      <div className={styles.container}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>نظرة عامة</h2>
          <div className={styles.overviewGrid}>
            <Card hover>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💰</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricValue}>
                    EGP {(stats.totalSales / 1000).toFixed(0)}K
                  </h3>
                  <p className={styles.metricLabel}>إجمالي المبيعات</p>
                  <Badge variant="success" size="sm">
                    {stats.totalInvoices} فاتورة
                  </Badge>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>✅</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricValue}>
                    EGP {(stats.totalCollected / 1000).toFixed(0)}K
                  </h3>
                  <p className={styles.metricLabel}>المحصل</p>
                  <Badge variant="success" size="sm">
                    {stats.paidInvoices} مدفوعة
                  </Badge>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>⏳</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricValue}>
                    EGP {(stats.pendingAmount / 1000).toFixed(0)}K
                  </h3>
                  <p className={styles.metricLabel}>المعلق</p>
                  <Badge variant="warning" size="sm">
                    {stats.pendingInvoices} معلقة
                  </Badge>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>👥</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricValue}>{stats.totalCustomers}</h3>
                  <p className={styles.metricLabel}>العملاء</p>
                  <Badge variant="info" size="sm">نشط</Badge>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
          <div className={styles.actionsGrid}>
            <Button variant="primary" size="lg">📝 فاتورة جديدة</Button>
            <Button variant="secondary" size="lg">🛒 طلب شراء</Button>
            <Button variant="outline" size="lg">📊 تقرير المبيعات</Button>
            <Button variant="outline" size="lg">📦 جرد المخزون</Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>النشاط الأخير</h2>
          <Card>
            <div className={styles.timeline}>
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <div>
                        <h4 className={styles.timelineTitle}>{activity.title}</h4>
                        <p className={styles.timelineDescription}>{activity.description}</p>
                      </div>
                      <Badge variant={activity.status === 'paid' ? 'success' : 'warning'} size="sm">
                        {activity.amount}
                      </Badge>
                    </div>
                    <p className={styles.timelineTime}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
