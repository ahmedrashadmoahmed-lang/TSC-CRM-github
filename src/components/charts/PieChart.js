'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Chart.module.css';

/**
 * Reusable Pie Chart Component
 * @param {Object} props
 * @param {Array} props.data - Chart data
 * @param {string} props.dataKey - Key for data values
 * @param {string} props.nameKey - Key for labels
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels (default: 300)
 * @param {Array} props.colors - Array of colors for segments
 * @param {Function} props.formatTooltip - Custom formatter for tooltip
 * @param {boolean} props.showLabel - Show labels on segments (default: true)
 */
export default function PieChart({
    data = [],
    dataKey = 'value',
    nameKey = 'name',
    title,
    height = 300,
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    formatTooltip,
    showLabel = true,
}) {
    const defaultTooltipFormatter = (value, name) => {
        if (formatTooltip) return formatTooltip(value, name);
        return [value.toLocaleString(), name];
    };

    const renderLabel = (entry) => {
        if (!showLabel) return null;
        const percent = ((entry.value / data.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(1);
        return `${entry[nameKey]}: ${percent}%`;
    };

    return (
        <div className={styles.chartContainer}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsPieChart>
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={renderLabel}
                        labelLine={showLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                        }}
                        formatter={defaultTooltipFormatter}
                    />
                    <Legend />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
}
