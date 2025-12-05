'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Chart.module.css';

/**
 * Reusable Line Chart Component
 * @param {Object} props
 * @param {Array} props.data - Chart data
 * @param {string} props.xKey - Key for X-axis data
 * @param {Array} props.lines - Array of line configurations [{key, color, name}]
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels (default: 300)
 * @param {Function} props.formatXAxis - Custom formatter for X-axis
 * @param {Function} props.formatYAxis - Custom formatter for Y-axis
 * @param {Function} props.formatTooltip - Custom formatter for tooltip
 */
export default function LineChart({
    data = [],
    xKey = 'name',
    lines = [],
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
                <RechartsLineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
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
                    {lines.map((line, index) => (
                        <Line
                            key={line.key || index}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color || `var(--color-primary)`}
                            strokeWidth={2}
                            name={line.name || line.key}
                            dot={{ fill: line.color || `var(--color-primary)`, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}
