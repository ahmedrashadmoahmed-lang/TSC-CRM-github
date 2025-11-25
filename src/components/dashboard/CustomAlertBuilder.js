'use client';

import { useState } from 'react';
import { Plus, X, Bell, Mail, MessageSquare, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './CustomAlertBuilder.module.css';

const METRICS = [
    { id: 'revenue', label: 'Revenue', type: 'currency' },
    { id: 'deals', label: 'Open Deals', type: 'number' },
    { id: 'leads', label: 'New Leads', type: 'number' },
    { id: 'conversion_rate', label: 'Conversion Rate', type: 'percentage' },
    { id: 'avg_deal_size', label: 'Avg Deal Size', type: 'currency' },
];

const OPERATORS = [
    { id: 'less_than', label: 'Less than (<)', symbol: '<' },
    { id: 'greater_than', label: 'Greater than (>)', symbol: '>' },
    { id: 'equals', label: 'Equals (=)', symbol: '=' },
    { id: 'not_equals', label: 'Not equals (≠)', symbol: '!=' },
];

const CHANNELS = [
    { id: 'in_app', label: 'In-App Notification', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'slack', label: 'Slack', icon: MessageSquare },
];

export default function CustomAlertBuilder({ onSave, onCancel, initialData = null }) {
    const [alert, setAlert] = useState(initialData || {
        name: '',
        metric: 'revenue',
        operator: 'less_than',
        value: '',
        channels: ['in_app'],
        isActive: true,
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!alert.name.trim()) {
            newErrors.name = 'Alert name is required';
        }

        if (!alert.value || parseFloat(alert.value) <= 0) {
            newErrors.value = 'Valid value is required';
        }

        if (alert.channels.length === 0) {
            newErrors.channels = 'Select at least one notification channel';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave({
                ...alert,
                condition: {
                    metric: alert.metric,
                    operator: alert.operator,
                    value: parseFloat(alert.value),
                },
            });
        }
    };

    const toggleChannel = (channelId) => {
        setAlert(prev => ({
            ...prev,
            channels: prev.channels.includes(channelId)
                ? prev.channels.filter(c => c !== channelId)
                : [...prev.channels, channelId],
        }));
    };

    const selectedMetric = METRICS.find(m => m.id === alert.metric);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>{initialData ? 'Edit Alert' : 'Create Custom Alert'}</h3>
                <button className={styles.closeButton} onClick={onCancel}>
                    <X size={20} />
                </button>
            </div>

            <div className={styles.form}>
                {/* Alert Name */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Alert Name *
                    </label>
                    <Input
                        value={alert.name}
                        onChange={(e) => setAlert({ ...alert, name: e.target.value })}
                        placeholder="e.g., Low Revenue Warning"
                        error={errors.name}
                    />
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
                </div>

                {/* Condition Builder */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Condition *
                    </label>
                    <div className={styles.conditionBuilder}>
                        <select
                            className={styles.select}
                            value={alert.metric}
                            onChange={(e) => setAlert({ ...alert, metric: e.target.value })}
                        >
                            {METRICS.map(metric => (
                                <option key={metric.id} value={metric.id}>
                                    {metric.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={styles.select}
                            value={alert.operator}
                            onChange={(e) => setAlert({ ...alert, operator: e.target.value })}
                        >
                            {OPERATORS.map(op => (
                                <option key={op.id} value={op.id}>
                                    {op.label}
                                </option>
                            ))}
                        </select>

                        <div className={styles.valueInput}>
                            {selectedMetric?.type === 'currency' && (
                                <span className={styles.prefix}>$</span>
                            )}
                            <Input
                                type="number"
                                value={alert.value}
                                onChange={(e) => setAlert({ ...alert, value: e.target.value })}
                                placeholder="0"
                                error={errors.value}
                            />
                            {selectedMetric?.type === 'percentage' && (
                                <span className={styles.suffix}>%</span>
                            )}
                        </div>
                    </div>
                    {errors.value && <span className={styles.error}>{errors.value}</span>}
                </div>

                {/* Preview */}
                <div className={styles.preview}>
                    <p className={styles.previewLabel}>Alert will trigger when:</p>
                    <p className={styles.previewText}>
                        <strong>{selectedMetric?.label}</strong>{' '}
                        {OPERATORS.find(o => o.id === alert.operator)?.symbol}{' '}
                        <strong>
                            {selectedMetric?.type === 'currency' && '$'}
                            {alert.value || '___'}
                            {selectedMetric?.type === 'percentage' && '%'}
                        </strong>
                    </p>
                </div>

                {/* Notification Channels */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Notification Channels *
                    </label>
                    <div className={styles.channels}>
                        {CHANNELS.map(channel => {
                            const Icon = channel.icon;
                            const isSelected = alert.channels.includes(channel.id);

                            return (
                                <button
                                    key={channel.id}
                                    type="button"
                                    className={`${styles.channelButton} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => toggleChannel(channel.id)}
                                >
                                    <Icon size={20} />
                                    <span>{channel.label}</span>
                                    {isSelected && <div className={styles.checkmark}>✓</div>}
                                </button>
                            );
                        })}
                    </div>
                    {errors.channels && <span className={styles.error}>{errors.channels}</span>}
                </div>

                {/* Active Toggle */}
                <div className={styles.formGroup}>
                    <label className={styles.toggleLabel}>
                        <input
                            type="checkbox"
                            checked={alert.isActive}
                            onChange={(e) => setAlert({ ...alert, isActive: e.target.checked })}
                        />
                        <span>Alert is active</span>
                    </label>
                </div>
            </div>

            <div className={styles.footer}>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    <Save size={18} />
                    {initialData ? 'Update Alert' : 'Create Alert'}
                </Button>
            </div>
        </div>
    );
}
