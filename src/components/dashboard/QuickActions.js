'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './QuickActions.module.css';

export default function QuickActions() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const actions = [
        {
            icon: '🎯',
            label: 'فرصة جديدة',
            color: '#3b82f6',
            action: () => router.push('/pipeline?action=create'),
        },
        {
            icon: '📝',
            label: 'طلب عرض',
            color: '#8b5cf6',
            action: () => router.push('/rfq?action=create'),
        },
        {
            icon: '🛒',
            label: 'أمر شراء',
            color: '#10b981',
            action: () => router.push('/po?action=create'),
        },
        {
            icon: '💰',
            label: 'فاتورة',
            color: '#f59e0b',
            action: () => router.push('/invoicing?action=create'),
        },
        {
            icon: '📦',
            label: 'منتج',
            color: '#06b6d4',
            action: () => router.push('/products?action=create'),
        },
        {
            icon: '👤',
            label: 'عميل',
            color: '#ec4899',
            action: () => router.push('/contacts?action=create&type=customer'),
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>إجراءات سريعة</h3>
            </div>

            <div className={styles.grid}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={styles.actionButton}
                        onClick={action.action}
                        style={{ '--action-color': action.color }}
                    >
                        <span className={styles.icon}>{action.icon}</span>
                        <span className={styles.label}>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
