'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import styles from './NewDataBadge.module.css';

export default function NewDataBadge({ onRefresh }) {
    const [hasNewData, setHasNewData] = useState(false);
    const [lastCheck, setLastCheck] = useState(Date.now());

    useEffect(() => {
        // Check for new data every 30 seconds
        const interval = setInterval(() => {
            checkForNewData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const checkForNewData = async () => {
        try {
            // Simulate checking for new data
            // In real app, this would call an API endpoint
            const hasNew = Math.random() > 0.7; // 30% chance of new data
            setHasNewData(hasNew);
        } catch (error) {
            console.error('Error checking for new data:', error);
        }
    };

    const handleRefresh = () => {
        setHasNewData(false);
        setLastCheck(Date.now());
        onRefresh?.();
    };

    if (!hasNewData) return null;

    return (
        <div className={styles.badge}>
            <div className={styles.content}>
                <Bell size={16} className={styles.icon} />
                <span className={styles.text}>بيانات جديدة متاحة</span>
            </div>
            <button
                className={styles.refreshButton}
                onClick={handleRefresh}
            >
                تحديث الآن
            </button>
        </div>
    );
}
