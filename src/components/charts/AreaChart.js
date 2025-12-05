'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Chart.module.css';

/**
 * Reusable Area Chart Component
 * @param {Object} props
 * @param {Array} props.data - Chart data
 * @param {string} props.xKey - Key for X-axis data
 * @param {Array} props.areas - Array of area configurations [{key, color, name}]
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels (default: 300)
 * @param {Function} props.formatXAxis - Custom formatter for X-axis
 * @param {Function} props.formatYAxis - Custom formatter for Y-axis
 * @param {Function} props.formatTooltip - Custom formatter for tooltip
 */
export default function AreaChart({
    data = [],
    xKey = 'name',
    areas = [],
    title,
    height = 300,
    formatXAxis,
    formatYAxis,
    formatTooltip,
}) {
    const defaultTooltipFormatter = (value, name) => {
        if (formatTooltip) return formatTooltip(value, name);
        return [value.toLocaleString(), name];
    };

    return (
        <div className={styles.chartContainer}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsAreaChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <defs>
                        {areas.map((area, index) => (
                            <linearGradient key={`gradient-${index}`} id={`color-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={area.color || 'var(--color-primary)'} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={area.color || 'var(--color-primary)'} stopOpacity={0.1} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                        dataKey={xKey}
                        stroke="var(--color-text-secondary)"
                        tick={{ fill: 'var(--color-text-secondary)' }}
                        tickFormatter={formatXAxis}
                    />
                    <YAxis
                        stroke="var(--color-text-secondary)"
                        tick={{ fill: 'var(--color-text-secondary)' }}
                        tickFormatter={formatYAxis}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                        }}
                        formatter={defaultTooltipFormatter}
                    />
                    <Legend />
                    {areas.map((area, index) => (
                        <Area
                            key={area.key || index}
                            type="monotone"
                            dataKey={area.key}
                            stroke={area.color || 'var(--color-primary)'}
                            strokeWidth={2}
                            fill={`url(#color-${area.key})`}
                            name={area.name || area.key}
                        />
                    ))}
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
}
