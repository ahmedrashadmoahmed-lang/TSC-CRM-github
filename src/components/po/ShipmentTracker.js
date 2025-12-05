'use client';

import { useState } from 'react';
import { Package, MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import styles from './ShipmentTracker.module.css';

export default function ShipmentTracker({ poId, shipments = [] }) {
    const [activeShipment, setActiveShipment] = useState(shipments[0] || null);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle2 size={20} className={styles.iconSuccess} />;
            case 'in_transit':
            case 'out_for_delivery':
                return <Truck size={20} className={styles.iconActive} />;
            default:
                return <Package size={20} className={styles.iconPending} />;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'in_transit':
            case 'out_for_delivery': return 'primary';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusSteps = () => [
        { key: 'preparing', label: 'Preparing', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'in_transit', label: 'In Transit', icon: Truck },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
    ];

    const getCurrentStepIndex = (status) => {
        const steps = getStatusSteps();
        return steps.findIndex(s => s.key === status);
    };

    if (!activeShipment) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <Package size={48} />
                    <p>No shipment information available</p>
                </div>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex(activeShipment.status);
    const updates = activeShipment.updates ? JSON.parse(activeShipment.updates) : [];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <Truck size={20} />
                    Shipment Tracking
                </h3>
                <Badge variant={getStatusVariant(activeShipment.status)}>
                    {activeShipment.status.replace('_', ' ')}
                </Badge>
            </div>

            {activeShipment.trackingNumber && (
                <div className={styles.trackingInfo}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Tracking Number:</span>
                        <span className={styles.value}>{activeShipment.trackingNumber}</span>
                    </div>
                    {activeShipment.carrier && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Carrier:</span>
                            <span className={styles.value}>{activeShipment.carrier}</span>
                        </div>
                    )}
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Estimated Delivery:</span>
                        <span className={styles.value}>
                            {formatDate(activeShipment.estimatedDelivery)}
                        </span>
                    </div>
                </div>
            )}

            <div className={styles.timeline}>
                {getStatusSteps().map((step, index) => {
                    const isActive = index <= currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className={styles.timelineItem}>
                            <div className={`${styles.timelineIcon} ${isActive ? styles.active : ''}`}>
                                <Icon size={18} />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineLabel}>{step.label}</div>
                                {index < getStatusSteps().length - 1 && (
                                    <div className={`${styles.timelineLine} ${isActive ? styles.active : ''}`} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {updates.length > 0 && (
                <div className={styles.updates}>
                    <h4 className={styles.updatesTitle}>
                        <MapPin size={16} />
                        Tracking History
                    </h4>
                    <div className={styles.updatesList}>
                        {updates.map((update, index) => (
                            <div key={index} className={styles.updateItem}>
                                <div className={styles.updateTime}>
                                    <Clock size={14} />
                                    {formatDate(update.timestamp)}
                                </div>
                                <div className={styles.updateLocation}>
                                    <MapPin size={14} />
                                    {update.location}
                                </div>
                                <div className={styles.updateDescription}>{update.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
