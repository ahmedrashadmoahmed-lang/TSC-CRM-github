'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './NotificationCenter.module.css';

export default function NotificationCenter({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, filter]);

    const loadNotifications = async () => {
        try {
            const url = filter === 'unread'
                ? '/api/notifications?unread=true'
                : '/api/notifications';

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, read: true })
            });
            loadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE'
            });
            loadNotifications();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            router.push(notification.link);
            onClose();
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'الآن';
        if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
        if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
        return `منذ ${Math.floor(seconds / 86400)} يوم`;
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            default: return '🟢';
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>🔔 الإشعارات</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.filters}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        الكل ({notifications.length})
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        غير المقروءة ({notifications.filter(n => !n.read).length})
                    </button>
                </div>

                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.loading}>جاري التحميل...</div>
                    ) : notifications.length === 0 ? (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>📭</span>
                            <p>لا توجد إشعارات</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={styles.notificationHeader}>
                                    <span className={styles.priority}>
                                        {getPriorityIcon(notification.priority)}
                                    </span>
                                    <span className={styles.title}>{notification.title}</span>
                                    <span className={styles.time}>{getTimeAgo(notification.createdAt)}</span>
                                </div>
                                <p className={styles.message}>{notification.message}</p>
                                <div className={styles.actions}>
                                    {!notification.read && (
                                        <button
                                            className={styles.actionBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification.id);
                                            }}
                                        >
                                            ✓ تعليم كمقروء
                                        </button>
                                    )}
                                    <button
                                        className={styles.actionBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                    >
                                        🗑️ حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
