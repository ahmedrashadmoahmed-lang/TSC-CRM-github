'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './WorkflowTracker.module.css';

const WORKFLOW_STAGES = [
    { id: 1, name: 'اتصال بالعميل', icon: '📞', path: '/pipeline', status: 'sales' },
    { id: 2, name: 'طلب أسعار', icon: '📝', path: '/rfq', status: 'rfq' },
    { id: 3, name: 'مقارنة عروض', icon: '⚖️', path: '/rfq', status: 'comparison' },
    { id: 4, name: 'عرض للعميل', icon: '💰', path: '/pipeline', status: 'quote' },
    { id: 5, name: 'موافقة العميل', icon: '✅', path: '/pipeline', status: 'approval' },
    { id: 6, name: 'إعادة تقييم', icon: '🔄', path: '/rfq', status: 'reevaluate' },
    { id: 7, name: 'أمر شراء', icon: '🛒', path: '/po', status: 'po_created' },
    { id: 8, name: 'الدفع للمورد', icon: '💳', path: '/po', status: 'payment' },
    { id: 9, name: 'الشحن', icon: '🚚', path: '/po', status: 'shipment' },
    { id: 10, name: 'الاستلام', icon: '📦', path: '/po', status: 'receiving' },
    { id: 11, name: 'الأرقام التسلسلية', icon: '🔢', path: '/po', status: 'serial' },
    { id: 12, name: 'المخازن', icon: '🏪', path: '/inventory', status: 'inventory' },
    { id: 13, name: 'فاتورة العميل', icon: '🧾', path: '/invoicing', status: 'invoice' },
    { id: 14, name: 'التوصيل', icon: '🚛', path: '/fulfillment', status: 'delivery' },
    { id: 15, name: 'التحصيل', icon: '💵', path: '/invoicing', status: 'collection' }
];

export default function WorkflowTracker({ currentStage = 1, dealId = null, compact = false }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const getStageStatus = (stageId) => {
        if (stageId < currentStage) return 'completed';
        if (stageId === currentStage) return 'active';
        return 'pending';
    };

    // Show loading state during SSR to match client
    if (!mounted) {
        return (
            <div className={styles.tracker}>
                <div className={styles.header}>
                    <h3>📊 مراحل العملية</h3>
                    <div className={styles.progress}>
                        <span>جاري التحميل...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className={styles.compactTracker}>
                <div className={styles.compactProgress}>
                    <div
                        className={styles.compactProgressBar}
                        style={{ width: `${(currentStage / WORKFLOW_STAGES.length) * 100}%` }}
                    />
                </div>
                <div className={styles.compactInfo}>
                    <span className={styles.compactStage}>
                        المرحلة {currentStage} من {WORKFLOW_STAGES.length}
                    </span>
                    <span className={styles.compactName}>
                        {WORKFLOW_STAGES[currentStage - 1]?.name}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tracker}>
            <div className={styles.header}>
                <h3>📊 مراحل العملية</h3>
                <div className={styles.progress}>
                    <span>{currentStage} / {WORKFLOW_STAGES.length}</span>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(currentStage / WORKFLOW_STAGES.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.stages}>
                {WORKFLOW_STAGES.map((stage) => {
                    const status = getStageStatus(stage.id);
                    const isClickable = status === 'completed' || status === 'active';

                    return (
                        <div
                            key={stage.id}
                            className={`${styles.stage} ${styles[status]}`}
                        >
                            {isClickable ? (
                                <Link
                                    href={dealId ? `${stage.path}?dealId=${dealId}` : stage.path}
                                    className={styles.stageLink}
                                >
                                    <div className={styles.stageIcon}>
                                        {status === 'completed' && <span className={styles.checkmark}>✓</span>}
                                        {status === 'active' && <span className={styles.pulse}></span>}
                                        <span>{stage.icon}</span>
                                    </div>
                                    <div className={styles.stageContent}>
                                        <span className={styles.stageNumber}>#{stage.id}</span>
                                        <span className={styles.stageName}>{stage.name}</span>
                                    </div>
                                </Link>
                            ) : (
                                <div className={styles.stageDisabled}>
                                    <div className={styles.stageIcon}>
                                        <span>{stage.icon}</span>
                                    </div>
                                    <div className={styles.stageContent}>
                                        <span className={styles.stageNumber}>#{stage.id}</span>
                                        <span className={styles.stageName}>{stage.name}</span>
                                    </div>
                                </div>
                            )}

                            {stage.id < WORKFLOW_STAGES.length && (
                                <div className={styles.connector} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
