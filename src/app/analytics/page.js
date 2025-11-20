'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
    const [forecast, setForecast] = useState(null);
    const [customers, setCustomers] = useState(null);
    const [expenses, setExpenses] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [forecastRes, customersRes, expensesRes] = await Promise.all([
                fetch('/api/analytics/forecast'),
                fetch('/api/analytics/customers'),
                fetch('/api/analytics/expenses')
            ]);

            const [forecastData, customersData, expensesData] = await Promise.all([
                forecastRes.json(),
                customersRes.json(),
                expensesRes.json()
            ]);

            setForecast(forecastData);
            setCustomers(customersData);
            setExpenses(expensesData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h1>📊 التحليلات والتنبؤات</h1>
                <div className={styles.loading}>جاري تحميل التحليلات...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📊 التحليلات والتنبؤات</h1>
                <p>تحليلات ذكية مدعومة بالذكاء الاصطناعي</p>
            </div>

            {/* Sales Forecast */}
            <section className={styles.section}>
                <h2>📈 توقعات المبيعات</h2>
                <div className={styles.grid}>
                    <Card title="ملخص التوقعات">
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.label}>متوسط المبيعات الشهرية</span>
                                <span className={styles.value}>
                                    {forecast?.summary.averageMonthlySales.toLocaleString('ar-EG')} جنيه
                                </span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.label}>معدل النمو</span>
                                <span className={`${styles.value} ${forecast?.trends.growthRate > 0 ? styles.positive : styles.negative}`}>
                                    {forecast?.trends.growthRate}%
                                </span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.label}>الاتجاه</span>
                                <span className={styles.value}>
                                    {forecast?.trends.trend === 'growing' ? '📈 نمو' :
                                        forecast?.trends.trend === 'declining' ? '📉 تراجع' : '➡️ مستقر'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card title="التوقعات القادمة">
                        <div className={styles.forecastList}>
                            {forecast?.forecast.map((item, idx) => (
                                <div key={idx} className={styles.forecastItem}>
                                    <span className={styles.month}>{item.month}</span>
                                    <span className={styles.amount}>
                                        {item.sales.toLocaleString('ar-EG')} جنيه
                                    </span>
                                    <span className={styles.confidence}>
                                        ثقة: {Math.round(item.confidence * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            {/* Customer Insights */}
            <section className={styles.section}>
                <h2>👥 تحليل العملاء</h2>
                <div className={styles.grid}>
                    <Card title="أفضل العملاء">
                        <div className={styles.customerList}>
                            {customers?.topCustomers.map((customer, idx) => (
                                <div key={idx} className={styles.customerItem}>
                                    <div className={styles.rank}>{idx + 1}</div>
                                    <div className={styles.customerInfo}>
                                        <span className={styles.name}>{customer.name}</span>
                                        <span className={styles.details}>
                                            {customer.totalInvoices} فاتورة • {customer.totalValue.toLocaleString('ar-EG')} جنيه
                                        </span>
                                    </div>
                                    <div className={styles.score}>
                                        <span className={styles.scoreValue}>{customer.customerScore}</span>
                                        <span className={styles.scoreLabel}>نقاط</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="العملاء المعرضون للخطر">
                        {customers?.atRiskCustomers.length > 0 ? (
                            <div className={styles.riskList}>
                                {customers.atRiskCustomers.slice(0, 5).map((customer, idx) => (
                                    <div key={idx} className={styles.riskItem}>
                                        <span className={styles.riskName}>{customer.name}</span>
                                        <span className={styles.riskRate}>
                                            تحصيل: {customer.collectionRate}%
                                        </span>
                                        <span className={`${styles.badge} ${styles.high}`}>
                                            خطر عالي
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noRisk}>✅ لا يوجد عملاء معرضون للخطر</div>
                        )}
                    </Card>
                </div>
            </section>

            {/* Expense Analysis */}
            <section className={styles.section}>
                <h2>💸 تحليل المصروفات</h2>
                <div className={styles.grid}>
                    <Card title="أكبر فئات المصروفات">
                        <div className={styles.expenseList}>
                            {expenses?.categories.slice(0, 5).map((cat, idx) => (
                                <div key={idx} className={styles.expenseItem}>
                                    <div className={styles.expenseInfo}>
                                        <span className={styles.category}>{cat.category}</span>
                                        <span className={styles.count}>{cat.count} معاملة</span>
                                    </div>
                                    <div className={styles.expenseAmount}>
                                        <span className={styles.total}>
                                            {cat.total.toLocaleString('ar-EG')} جنيه
                                        </span>
                                        <span className={styles.percentage}>{cat.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="التوصيات">
                        {expenses?.recommendations.length > 0 ? (
                            <div className={styles.recommendations}>
                                {expenses.recommendations.map((rec, idx) => (
                                    <div key={idx} className={`${styles.recommendation} ${styles[rec.priority]}`}>
                                        <div className={styles.recHeader}>
                                            <span className={styles.recTitle}>{rec.title}</span>
                                            <span className={styles.priority}>{rec.priority === 'high' ? 'عالي' : 'متوسط'}</span>
                                        </div>
                                        <p className={styles.recDesc}>{rec.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noRecommendations}>✅ لا توجد توصيات حالياً</div>
                        )}
                    </Card>
                </div>
            </section>
        </div>
    );
}
