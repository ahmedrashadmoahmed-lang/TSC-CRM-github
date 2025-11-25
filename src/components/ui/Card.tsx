'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
    loading?: boolean;
}

export function Card({
    children,
    title,
    subtitle,
    className = '',
    onClick,
    hoverable = false,
    loading = false
}: CardProps) {
    return (
        <div
            className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${onClick ? styles.clickable : ''} ${className}`}
            onClick={onClick}
        >
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                </div>
            )}
            {(title || subtitle) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            <div className={styles.content}>{children}</div>
        </div>
    );
}

export default Card;
