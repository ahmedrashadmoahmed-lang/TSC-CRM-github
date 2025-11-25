'use client';

import { useState } from 'react';
import { Bell, Plus, Edit2, Trash2, Power, PowerOff, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CustomAlertBuilder from './CustomAlertBuilder';
import styles from './AlertsManager.module.css';

export default function AlertsManager({ alerts = [], onUpdate, onDelete, onCreate }) {
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    const handleSave = (alertData) => {
        if (editingAlert) {
            onUpdate(editingAlert.id, alertData);
        } else {
            onCreate(alertData);
        }
        setShowBuilder(false);
        setEditingAlert(null);
    };

    const handleEdit = (alert) => {
        setEditingAlert(alert);
        setShowBuilder(true);
    };

    const handleToggle = (alertId, isActive) => {
        onUpdate(alertId, { isActive: !isActive });
    };

    const getOperatorSymbol = (operator) => {
        const symbols = {
            'less_than': '<',
            'greater_than': '>',
            'equals': '=',
            'not_equals': '≠',
        };
        return symbols[operator] || operator;
    };

    const formatValue = (value, type) => {
        if (type === 'currency') return `$${value.toLocaleString()}`;
        if (type === 'percentage') return `${value}%`;
        return value;
    };

    const getMetricLabel = (metricId) => {
        const labels = {
            'revenue': 'Revenue',
            'deals': 'Open Deals',
            'leads': 'New Leads',
            'conversion_rate': 'Conversion Rate',
            'avg_deal_size': 'Avg Deal Size',
        };
        return labels[metricId] || metricId;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <Bell size={24} />
                    <div>
                        <h2 className={styles.title}>Custom Alerts</h2>
                        <p className={styles.subtitle}>
                            {alerts.length} alert{alerts.length !== 1 ? 's' : ''} configured
                        </p>
                    </div>
                </div>
                <Button variant="primary" onClick={() => setShowBuilder(true)}>
                    <Plus size={18} />
                    New Alert
                </Button>
            </div>

            {alerts.length === 0 ? (
                <div className={styles.emptyState}>
                    <Bell size={48} />
                    <h3>No alerts configured</h3>
                    <p>Create your first custom alert to get notified about important metrics</p>
                    <Button variant="primary" onClick={() => setShowBuilder(true)}>
                        <Plus size={18} />
                        Create Alert
                    </Button>
                </div>
            ) : (
                <div className={styles.alertsList}>
                    {alerts.map(alert => (
                        <Card key={alert.id} className={styles.alertCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.alertInfo}>
                                    <h3 className={styles.alertName}>{alert.name}</h3>
                                    <div className={styles.condition}>
                                        <span className={styles.metric}>
                                            {getMetricLabel(alert.condition.metric)}
                                        </span>
                                        <span className={styles.operator}>
                                            {getOperatorSymbol(alert.condition.operator)}
                                        </span>
                                        <span className={styles.value}>
                                            {formatValue(alert.condition.value, alert.condition.type)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.status}>
                                    <Badge variant={alert.isActive ? 'success' : 'default'}>
                                        {alert.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.channels}>
                                    <span className={styles.channelsLabel}>Channels:</span>
                                    {alert.channels.map(channel => (
                                        <Badge key={channel} variant="info" size="sm">
                                            {channel.replace('_', ' ')}
                                        </Badge>
                                    ))}
                                </div>

                                {alert.lastTriggered && (
                                    <div className={styles.lastTriggered}>
                                        <Clock size={14} />
                                        <span>
                                            Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => handleToggle(alert.id, alert.isActive)}
                                    title={alert.isActive ? 'Deactivate' : 'Activate'}
                                >
                                    {alert.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                                </button>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => handleEdit(alert)}
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className={`${styles.actionButton} ${styles.danger}`}
                                    onClick={() => onDelete(alert.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Alert Builder Modal */}
            {showBuilder && (
                <div className={styles.modal}>
                    <div className={styles.modalOverlay} onClick={() => {
                        setShowBuilder(false);
                        setEditingAlert(null);
                    }} />
                    <div className={styles.modalContent}>
                        <CustomAlertBuilder
                            initialData={editingAlert}
                            onSave={handleSave}
                            onCancel={() => {
                                setShowBuilder(false);
                                setEditingAlert(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
