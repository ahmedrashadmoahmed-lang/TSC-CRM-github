'use client';

import Link from 'next/link';
import styles from './MetricCard.module.css';

export default function MetricCard({
    icon,
    label,
    value,
    unit = '',
    trend,
    status = 'normal',
    action,
    loading = false,
    count,
    total
}) {
    const getTrendIcon = () => {
        if (!trend) return null;
        return trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    };

    const getTrendColor = () => {
        if (!trend) return '';
        return trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : '';
    };

    const getStatusClass = () => {
        switch (status) {
            case 'success': return styles.statusSuccess;
            case 'warning': return styles.statusWarning;
            case 'danger': return styles.statusDanger;
            default: return '';
        }
    };

    const CardContent = () => (
        <div className={`${styles.card} ${getStatusClass()} ${loading ? styles.loading : ''}`}>
            <div className={styles.header}>
                <span className={styles.icon}>{icon}</span>
                <span className={styles.label}>{label}</span>
            </div>

            {loading ? (
                <div className={styles.skeleton}>
                    <div className={styles.skeletonLine}></div>
                </div>
            ) : (
                <>
                    <div className={styles.value}>
                        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
                        {unit && <span className={styles.unit}>{unit}</span>}
                    </div>

                    {count !== undefined && (
                        <div className={styles.secondary}>
                            <span className={styles.count}>{count} فاتورة</span>
                            {total !== undefined && (
                                <span className={styles.total}>{total.toLocaleString('ar-EG')} ج.م</span>
                            )}
                        </div>
                    )}

                    {trend !== undefined && trend !== null && (
                        <div className={`${styles.trend} ${getTrendColor()}`}>
                            <span className={styles.trendIcon}>{getTrendIcon()}</span>
                            <span className={styles.trendValue}>{Math.abs(trend)}%</span>
                            <span className={styles.trendLabel}>مقارنة بالشهر السابق</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (action && !loading) {
        return (
            <Link href={action} className={styles.cardLink}>
                <CardContent />
            </Link>
        );
    }

    return <CardContent />;
}
