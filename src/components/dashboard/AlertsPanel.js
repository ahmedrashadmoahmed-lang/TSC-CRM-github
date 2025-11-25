'use client';

import React from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './AlertsPanel.module.css';

export default function AlertsPanel({ alerts = [], onDismiss, onMarkAsRead }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        const count = alerts.filter(alert => !alert.read).length;
        setUnreadCount(count);
    }, [alerts]);

    const getIcon = (type) => {
        switch (type) {
            case 'overdue_task':
                return <AlertCircle size={20} />;
            case 'at_risk_deal':
                return <AlertTriangle size={20} />;
            case 'new_deal':
                return <CheckCircle size={20} />;
            case 'low_stock':
                return <AlertTriangle size={20} />;
            case 'overdue_invoice':
                return <AlertCircle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const getSeverityClass = (severity) => {
        return styles[severity] || styles.info;
    };

    const handleAlertClick = (alert) => {
        if (!alert.read && onMarkAsRead) {
            onMarkAsRead(alert.id);
        }
        if (alert.actionUrl) {
            window.location.href = alert.actionUrl;
        }
    };

    const handleDismiss = (e, alertId) => {
        e.stopPropagation();
        if (onDismiss) {
            onDismiss(alertId);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        return `منذ ${diffDays} يوم`;
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>التنبيهات</h3>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className={styles.alertsList}>
                        {alerts.length === 0 ? (
                            <div className={styles.empty}>
                                <Info size={32} />
                                <p>لا توجد تنبيهات</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`${styles.alert} ${getSeverityClass(alert.severity)} ${!alert.read ? styles.unread : ''}`}
                                    onClick={() => handleAlertClick(alert)}
                                >
                                    <div className={styles.alertIcon}>
                                        {getIcon(alert.type)}
                                    </div>
                                    <div className={styles.alertContent}>
                                        <div className={styles.alertTitle}>
                                            {alert.title}
                                        </div>
                                        <div className={styles.alertMessage}>
                                            {alert.message}
                                        </div>
                                        <div className={styles.alertTime}>
                                            {formatTimestamp(alert.timestamp)}
                                        </div>
                                    </div>
                                    <button
                                        className={styles.dismissButton}
                                        onClick={(e) => handleDismiss(e, alert.id)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
