'use client';

import React, { useState, useEffect } from 'react';
import { Clock, User, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './ActivityFeed.module.css';

export function ActivityFeed({ limit = 10 }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchActivities();
    }, [limit]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboard/recent-activity?limit=${limit}`);

            if (!response.ok) throw new Error('Failed to fetch activities');

            const result = await response.json();
            if (result.success) {
                setActivities(result.data.activities);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'client_added': return <User size={16} />;
            case 'deal_created': case 'deal_won': return <TrendingUp size={16} />;
            case 'task_completed': return <CheckCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Loading activities...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={24} />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <Clock size={48} />
                    <p>No recent activity</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.timeline}>
                {activities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                        <div className={`${styles.iconWrapper} ${styles[activity.color]}`}>
                            {getIcon(activity.type)}
                        </div>
                        <div className={styles.content}>
                            <p className={styles.description}>{activity.description}</p>
                            <div className={styles.meta}>
                                <span className={styles.user}>{activity.user.name}</span>
                                <span className={styles.separator}>•</span>
                                <span className={styles.time}>
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ActivityFeed;
