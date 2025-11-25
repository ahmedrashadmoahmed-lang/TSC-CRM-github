'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, Clock, Percent } from 'lucide-react';
import Card from '@/components/ui/Card';
import styles from './PipelineAnalytics.module.css';

export default function PipelineAnalytics({ analytics }) {
    if (!analytics) return null;

    const conversionData = [
        { stage: 'Leads → Quotes', rate: parseFloat(analytics.conversionRates.leadsToQuotes) },
        { stage: 'Quotes → Negotiations', rate: parseFloat(analytics.conversionRates.quotesToNegotiations) },
        { stage: 'Negotiations → Won', rate: parseFloat(analytics.conversionRates.negotiationsToWon) },
    ];

    const stageData = Object.entries(analytics.stageMetrics).map(([stage, data]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count: data.count,
        value: data.value,
    }));

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Pipeline Analytics</h2>

            <div className={styles.metricsGrid}>
                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                        <Percent size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <p className={styles.metricLabel}>Win Rate</p>
                        <h3 className={styles.metricValue}>{analytics.winRate}%</h3>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <p className={styles.metricLabel}>Avg Deal Size</p>
                        <h3 className={styles.metricValue}>EGP {analytics.avgDealSize.toLocaleString()}</h3>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <p className={styles.metricLabel}>Avg Days to Close</p>
                        <h3 className={styles.metricValue}>{analytics.avgDaysToClose} days</h3>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <Target size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <p className={styles.metricLabel}>Total Deals</p>
                        <h3 className={styles.metricValue}>{analytics.totalDeals}</h3>
                    </div>
                </Card>
            </div>

            <div className={styles.chartsGrid}>
                <Card className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Conversion Rates</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={conversionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="stage" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Bar dataKey="rate" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Deals by Stage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stageData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="stage" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#8b5cf6" name="Count" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
