'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Chart.module.css';

/**
 * Reusable Bar Chart Component
 * @param {Object} props
 * @param {Array} props.data - Chart data
 * @param {string} props.xKey - Key for X-axis data
 * @param {Array} props.bars - Array of bar configurations [{key, color, name}]
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels (default: 300)
 * @param {Function} props.formatXAxis - Custom formatter for X-axis
 * @param {Function} props.formatYAxis - Custom formatter for Y-axis
 * @param {Function} props.formatTooltip - Custom formatter for tooltip
 * @param {string} props.layout - Chart layout: 'horizontal' or 'vertical' (default: 'horizontal')
 */
export default function BarChart({
    data = [],
    xKey = 'name',
    bars = [],
    title,
    height = 300,
    formatXAxis,
    formatYAxis,
    formatTooltip,
    layout = 'horizontal',
}) {
    const defaultTooltipFormatter = (value, name) => {
        if (formatTooltip) return formatTooltip(value, name);
        return [value.toLocaleString(), name];
    };

    return (
        <div className={styles.chartContainer}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart
                    data={data}
                    layout={layout}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    {layout === 'horizontal' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <XAxis
                                type="number"
                                stroke="var(--color-text-secondary)"
                                tick={{ fill: 'var(--color-text-secondary)' }}
                                tickFormatter={formatYAxis}
                            />
                            <YAxis
                                type="category"
                                dataKey={xKey}
                                stroke="var(--color-text-secondary)"
                                tick={{ fill: 'var(--color-text-secondary)' }}
                                tickFormatter={formatXAxis}
                            />
                        </>
                    )}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                        }}
                        formatter={defaultTooltipFormatter}
                    />
                    <Legend />
                    {bars.map((bar, index) => (
                        <Bar
                            key={bar.key || index}
                            dataKey={bar.key}
                            fill={bar.color || `var(--color-primary)`}
                            name={bar.name || bar.key}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}
