'use client';

import React from 'react';
import styles from './SparklineChart.module.css';

export default function SparklineChart({ data = [], color = '#007bff', height = 40, width = 100 }) {
    if (!data || data.length === 0) {
        return null;
    }

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    // Generate SVG path
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg
            className={styles.sparkline}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
        >
            {/* Area fill */}
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
            </defs>

            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill={`url(#gradient-${color})`}
            />

            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dots */}
            {data.map((value, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - ((value - min) / range) * height;
                return (
                    <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="2"
                        fill={color}
                        className={styles.dot}
                    />
                );
            })}
        </svg>
    );
}
