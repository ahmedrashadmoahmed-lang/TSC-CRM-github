'use client';

import styles from './POStepper.module.css';

export default function POStepper({ currentStatus }) {
    const steps = [
        { key: 'draft', label: 'مسودة', icon: '📝' },
        { key: 'pending_approval', label: 'انتظار الموافقة', icon: '⏳' },
        { key: 'approved', label: 'مُعتمد', icon: '✅' },
        { key: 'ordered', label: 'تم الطلب', icon: '📦' },
        { key: 'shipped', label: 'تم الشحن', icon: '🚚' },
        { key: 'delivered', label: 'تم التسليم', icon: '✓' },
        { key: 'closed', label: 'مغلق', icon: '🔒' }
    ];

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.key === currentStatus);
    };

    const currentIndex = getCurrentStepIndex();

    return (
        <div className={styles.stepper}>
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isFuture = index > currentIndex;

                return (
                    <div key={step.key} className={styles.stepWrapper}>
                        <div className={styles.step}>
                            <div
                                className={`${styles.stepCircle} ${isCompleted ? styles.completed :
                                        isCurrent ? styles.current :
                                            styles.future
                                    }`}
                            >
                                <span className={styles.stepIcon}>{step.icon}</span>
                            </div>
                            <div className={styles.stepLabel}>{step.label}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`${styles.stepLine} ${isCompleted ? styles.lineCompleted : styles.lineFuture
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
