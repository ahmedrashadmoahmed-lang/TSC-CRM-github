'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './SalesFunnelChart.module.css';

export default function SalesFunnelChart({ data = [] }) {
    const COLORS = ['#007bff', '#17a2b8', '#28a745', '#ffc107', '#dc3545'];

    const formatValue = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{data.stage}</p>
                    <p className={styles.tooltipValue}>
                        عدد الصفقات: {data.count}
                    </p>
                    <p className={styles.tooltipValue}>
                        القيمة: ${formatValue(data.value)}
                    </p>
                    {data.conversionRate !== undefined && (
                        <p className={styles.tooltipConversion}>
                            معدل التحويل: {data.conversionRate}%
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return (
            <div className={styles.empty}>
                لا توجد بيانات لعرضها
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                        dataKey="stage"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: '#6c757d', fontSize: 12 }}
                    />
                    <YAxis
                        tick={{ fill: '#6c757d', fontSize: 12 }}
                        tickFormatter={formatValue}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
