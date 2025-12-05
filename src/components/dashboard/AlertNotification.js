import { useState, useEffect } from 'react';
import styles from './AlertNotification.module.css';
import { X, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function AlertNotification({ alert, onDismiss, onAction }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Auto-dismiss after 10 seconds for non-critical alerts
        if (alert.priority !== 'high' && alert.priority !== 'urgent') {
            const timer = setTimeout(() => {
                handleDismiss();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss?.(alert.id);
        }, 300);
    };

    const handleAction = (action) => {
        onAction?.(alert.id, action);
        handleDismiss();
    };

    if (!isVisible) return null;

    const getIcon = () => {
        switch (alert.type) {
            case 'warning':
                return <AlertTriangle size={20} />;
            case 'success':
                return <CheckCircle size={20} />;
            case 'info':
                return <Info size={20} />;
            default:
                return <Bell size={20} />;
        }
    };

    const getPriorityClass = () => {
        switch (alert.priority) {
            case 'urgent':
                return styles.urgent;
            case 'high':
                return styles.high;
            case 'medium':
                return styles.medium;
            default:
                return styles.low;
        }
    };

    return (
        <div className={`${styles.notification} ${getPriorityClass()} ${isExiting ? styles.exiting : ''}`}>
            <div className={styles.iconContainer}>
                {getIcon()}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h4 className={styles.title}>{alert.title}</h4>
                    {alert.timestamp && (
                        <span className={styles.timestamp}>
                            {new Date(alert.timestamp).toLocaleTimeString('ar-EG')}
                        </span>
                    )}
                </div>

                <p className={styles.message}>{alert.message}</p>

                {alert.details && (
                    <div className={styles.details}>
                        {Object.entries(alert.details).map(([key, value]) => (
                            <div key={key} className={styles.detailItem}>
                                <span className={styles.detailKey}>{key}:</span>
                                <span className={styles.detailValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {alert.actions && alert.actions.length > 0 && (
                    <div className={styles.actions}>
                        {alert.actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleAction(action)}
                                className={styles.actionButton}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={handleDismiss}
                className={styles.dismissButton}
                aria-label="إغلاق التنبيه"
            >
                <X size={18} />
            </button>
        </div>
    );
}
