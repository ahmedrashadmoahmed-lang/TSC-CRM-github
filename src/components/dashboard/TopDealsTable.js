'use client';

import Link from 'next/link';
import styles from './TopDealsTable.module.css';

export default function TopDealsTable({ deals, loading = false }) {
    const getStageColor = (stage) => {
        const colors = {
            'qualification': '#3b82f6',
            'proposal': '#8b5cf6',
            'negotiation': '#f59e0b',
            'won': '#10b981',
            'lost': '#ef4444',
        };
        return colors[stage] || '#64748b';
    };

    const getStageLabel = (stage) => {
        const labels = {
            'qualification': 'تأهيل',
            'proposal': 'عرض',
            'negotiation': 'تفاوض',
            'won': 'فوز',
            'lost': 'خسارة',
        };
        return labels[stage] || stage;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>أفضل 5 صفقات مفتوحة</h3>
                </div>
                <div className={styles.loading}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={styles.skeletonRow}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!deals || deals.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>أفضل 5 صفقات مفتوحة</h3>
                </div>
                <div className={styles.empty}>
                    <p>لا توجد صفقات مفتوحة حالياً</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>أفضل 5 صفقات مفتوحة</h3>
                <Link href="/pipeline" className={styles.viewAll}>
                    عرض الكل ←
                </Link>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={styles.col}>الصفقة</div>
                    <div className={styles.col}>العميل</div>
                    <div className={styles.col}>القيمة</div>
                    <div className={styles.col}>المرحلة</div>
                    <div className={styles.col}>الاحتمالية</div>
                </div>

                <div className={styles.tableBody}>
                    {deals.map((deal) => (
                        <Link
                            key={deal.id}
                            href={`/pipeline?id=${deal.id}`}
                            className={styles.row}
                        >
                            <div className={styles.col}>
                                <span className={styles.dealTitle}>{deal.title}</span>
                            </div>
                            <div className={styles.col}>
                                <span className={styles.customer}>{deal.customer}</span>
                            </div>
                            <div className={styles.col}>
                                <span className={styles.value}>
                                    {deal.value.toLocaleString('ar-EG')} ج.م
                                </span>
                            </div>
                            <div className={styles.col}>
                                <span
                                    className={styles.stage}
                                    style={{ backgroundColor: getStageColor(deal.stage) }}
                                >
                                    {getStageLabel(deal.stage)}
                                </span>
                            </div>
                            <div className={styles.col}>
                                <div className={styles.probability}>
                                    <div className={styles.probabilityBar}>
                                        <div
                                            className={styles.probabilityFill}
                                            style={{ width: `${deal.probability}%` }}
                                        ></div>
                                    </div>
                                    <span className={styles.probabilityText}>{deal.probability}%</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
