'use client';

import { useState, useEffect } from 'react';
import {
    Clock, AlertCircle, Inbox, TrendingDown, DollarSign,
    AlertTriangle, Mail, RefreshCw, X, Check
} from 'lucide-react';
import styles from './NotificationCenter.module.css';
import RFQAlertEngine from '@/lib/rfqAlertEngine';

const iconMap = {
    clock: Clock,
    'alert-circle': AlertCircle,
    inbox: Inbox,
    'trending-down': TrendingDown,
    'dollar-sign': DollarSign,
    'alert-triangle': AlertTriangle,
    mail: Mail,
    'refresh-cw': RefreshCw
};

export default function NotificationCenter({ rfqs = [] }) {
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        console.log('=== NotificationCenter useEffect RUNNING ===');
        console.log('RFQs received:', rfqs);
        console.log('RFQs length:', rfqs?.length);
        console.log('RFQAlertEngine:', RFQAlertEngine);

        if (rfqs && rfqs.length > 0) {
            console.log('Calling RFQAlertEngine.generateBulkAlerts...');

            try {
                const generated = RFQAlertEngine.generateBulkAlerts(rfqs);
                console.log('Generated alerts:', generated);
                console.log('Number of alerts:', generated.length);

                setAlerts(generated);

                const summaryData = RFQAlertEngine.getAlertSummary(generated);
                console.log('Summary:', summaryData);
                setSummary(summaryData);
            } catch (error) {
                console.error('Error generating alerts:', error);
            }
        } else {
            console.log('No RFQs to process');
        }

        console.log('=== useEffect COMPLETED ===');
    }, [rfqs]);

    console.log('NotificationCenter rendering, alerts count:', alerts.length);

    const filteredAlerts = filter === 'all'
        ? alerts
        : RFQAlertEngine.filterAlerts(alerts, { severity: filter });

    const handleMarkAsRead = (alertId) => {
        setAlerts(alerts.map(a =>
            a.id === alertId ? { ...a, read: true } : a
        ));
    };

    const handleDismiss = (alertId) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
    };

    const handleClearAll = () => {
        setAlerts([]);
    };

    return (
        <div className={styles.center}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>Notifications</h2>
                    {summary && (
                        <p>{summary.total} alerts • {summary.unread} unread</p>
                    )}
                </div>
                {alerts.length > 0 && (
                    <button className={styles.clearBtn} onClick={handleClearAll}>
                        Clear All
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            {summary && summary.total > 0 && (
                <div className={styles.summary}>
                    <div
                        className={`${styles.summaryCard} ${filter === 'critical' ? styles.active : ''}`}
                        onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
                    >
                        <span className={styles.count}>{summary.critical}</span>
                        <span className={styles.label}>Critical</span>
                    </div>
                    <div
                        className={`${styles.summaryCard} ${filter === 'warning' ? styles.active : ''}`}
                        onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
                    >
                        <span className={styles.count}>{summary.warning}</span>
                        <span className={styles.label}>Warning</span>
                    </div>
                    <div
                        className={`${styles.summaryCard} ${filter === 'info' ? styles.active : ''}`}
                        onClick={() => setFilter(filter === 'info' ? 'all' : 'info')}
                    >
                        <span className={styles.count}>{summary.info}</span>
                        <span className={styles.label}>Info</span>
                    </div>
                    <div
                        className={`${styles.summaryCard} ${filter === 'success' ? styles.active : ''}`}
                        onClick={() => setFilter(filter === 'success' ? 'all' : 'success')}
                    >
                        <span className={styles.count}>{summary.success}</span>
                        <span className={styles.label}>Success</span>
                    </div>
                </div>
            )}

            {/* Alerts List */}
            <div className={styles.alertsList}>
                {filteredAlerts.length === 0 ? (
                    <div className={styles.empty}>
                        <Check size={48} />
                        <p>No alerts</p>
                        <span>All caught up!</span>
                    </div>
                ) : (
                    filteredAlerts.map(alert => {
                        const Icon = iconMap[alert.icon] || AlertCircle;
                        const action = RFQAlertEngine.getRecommendedAction(alert);

                        return (
                            <div
                                key={alert.id}
                                className={`${styles.alertCard} ${styles[alert.severity]} ${alert.read ? styles.read : ''}`}
                            >
                                <div className={styles.alertIcon} style={{ color: alert.color }}>
                                    <Icon size={20} />
                                </div>

                                <div className={styles.alertContent}>
                                    <p className={styles.alertMessage}>{alert.message}</p>

                                    {action && (
                                        <button className={styles.actionBtn}>
                                            {action.label}
                                        </button>
                                    )}

                                    <span className={styles.alertTime}>
                                        {new Date(alert.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className={styles.alertActions}>
                                    {!alert.read && (
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => handleMarkAsRead(alert.id)}
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        className={styles.iconBtn}
                                        onClick={() => handleDismiss(alert.id)}
                                        title="Dismiss"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
