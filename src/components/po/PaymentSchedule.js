'use client';

import { useState } from 'react';
import { Calendar, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './PaymentSchedule.module.css';

export default function PaymentSchedule({ poId, schedule = [], totalAmount, currency = 'EGP' }) {
    const [payments, setPayments] = useState(schedule);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircle2 size={18} className={styles.iconSuccess} />;
            case 'overdue':
                return <AlertCircle size={18} className={styles.iconError} />;
            default:
                return <Clock size={18} className={styles.iconPending} />;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'overdue': return 'error';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateProgress = () => {
        const paidAmount = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
        return (paidAmount / totalAmount) * 100;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <DollarSign size={20} />
                    Payment Schedule
                </h3>
                <div className={styles.summary}>
                    <span className={styles.summaryLabel}>Total:</span>
                    <span className={styles.summaryValue}>{formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${calculateProgress()}%` }}
                />
                <span className={styles.progressText}>
                    {calculateProgress().toFixed(0)}% Paid
                </span>
            </div>

            <div className={styles.paymentList}>
                {payments.map((payment, index) => (
                    <div key={payment.id || index} className={styles.paymentCard}>
                        <div className={styles.paymentHeader}>
                            <div className={styles.installmentInfo}>
                                {getStatusIcon(payment.status)}
                                <span className={styles.installmentNumber}>
                                    Installment #{payment.installmentNumber}
                                </span>
                            </div>
                            <Badge variant={getStatusVariant(payment.status)}>
                                {payment.status}
                            </Badge>
                        </div>

                        <div className={styles.paymentDetails}>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>
                                    <Calendar size={16} />
                                    Due Date:
                                </span>
                                <span className={styles.value}>{formatDate(payment.dueDate)}</span>
                            </div>

                            <div className={styles.detailRow}>
                                <span className={styles.label}>Amount:</span>
                                <span className={styles.value}>{formatCurrency(payment.amount)}</span>
                            </div>

                            {payment.paidDate && (
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>Paid On:</span>
                                    <span className={styles.value}>{formatDate(payment.paidDate)}</span>
                                </div>
                            )}

                            {payment.paymentMethod && (
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>Method:</span>
                                    <span className={styles.value}>
                                        {payment.paymentMethod.replace('_', ' ')}
                                    </span>
                                </div>
                            )}

                            {payment.referenceNumber && (
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>Reference:</span>
                                    <span className={styles.value}>{payment.referenceNumber}</span>
                                </div>
                            )}
                        </div>

                        {payment.status === 'pending' && (
                            <div className={styles.actions}>
                                <Button variant="primary" size="sm" fullWidth>
                                    Record Payment
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {payments.length === 0 && (
                <div className={styles.empty}>
                    <p>No payment schedule set up</p>
                    <Button variant="primary" size="sm">
                        Create Payment Schedule
                    </Button>
                </div>
            )}
        </div>
    );
}
