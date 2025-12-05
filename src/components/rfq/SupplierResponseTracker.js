'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './SupplierResponseTracker.module.css';

export default function SupplierResponseTracker({ rfqId }) {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, [rfqId]);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch(`/api/rfq/${rfqId}/suppliers`);
            if (res.ok) {
                const data = await res.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'responded':
                return <CheckCircle2 size={20} className={styles.iconSuccess} />;
            case 'declined':
                return <XCircle size={20} className={styles.iconError} />;
            case 'viewed':
                return <AlertCircle size={20} className={styles.iconWarning} />;
            default:
                return <Clock size={20} className={styles.iconPending} />;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'responded': return 'success';
            case 'declined': return 'error';
            case 'viewed': return 'warning';
            default: return 'default';
        }
    };

    const getTimeSince = (date) => {
        if (!date) return 'N/A';
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        return `${diff} days ago`;
    };

    if (loading) {
        return <div className={styles.loading}>Loading suppliers...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Supplier Responses</h3>
                <div className={styles.stats}>
                    <span className={styles.statItem}>
                        {suppliers.filter(s => s.status === 'responded').length} / {suppliers.length} Responded
                    </span>
                </div>
            </div>

            <div className={styles.supplierList}>
                {suppliers.map((supplier) => (
                    <div key={supplier.id} className={styles.supplierCard}>
                        <div className={styles.supplierInfo}>
                            <div className={styles.iconWrapper}>
                                {getStatusIcon(supplier.status)}
                            </div>
                            <div className={styles.details}>
                                <h4 className={styles.supplierName}>{supplier.supplier.name}</h4>
                                <p className={styles.supplierMeta}>
                                    Invited: {getTimeSince(supplier.invitedAt)}
                                    {supplier.respondedAt && ` • Responded: ${getTimeSince(supplier.respondedAt)}`}
                                </p>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Badge variant={getStatusVariant(supplier.status)}>
                                {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                            </Badge>

                            {supplier.status === 'invited' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {/* Send reminder */ }}
                                >
                                    <Send size={16} />
                                    Remind
                                </Button>
                            )}

                            {supplier.status === 'responded' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => window.location.href = `/rfq/${rfqId}/compare`}
                                >
                                    View Quote
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {suppliers.length === 0 && (
                <div className={styles.empty}>
                    <p>No suppliers invited yet</p>
                </div>
            )}
        </div>
    );
}
