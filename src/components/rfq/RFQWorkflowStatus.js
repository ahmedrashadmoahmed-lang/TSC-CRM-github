// RFQ Workflow Status Component
// Displays 7-stage workflow with progress tracking

import { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';
import styles from './RFQWorkflowStatus.module.css';
import RFQWorkflowEngine from '@/lib/rfqWorkflowEngine';
import ApprovalAction from './ApprovalAction';
import POConversionModal from './POConversionModal';

export default function RFQWorkflowStatus({ rfq, onStageClick }) {
    const [showPOModal, setShowPOModal] = useState(false);
    const stages = RFQWorkflowEngine.stages;
    const currentStageIndex = stages.findIndex(s => s.id === rfq.stage);
    const progress = RFQWorkflowEngine.calculateProgress(rfq);
    const alerts = RFQWorkflowEngine.getAlerts(rfq);

    const getStageIcon = (stage, index) => {
        if (index < currentStageIndex) {
            return <CheckCircle size={20} className={styles.completed} />;
        }
        if (index === currentStageIndex) {
            return <Clock size={20} className={styles.current} />;
        }
        return <Circle size={20} className={styles.pending} />;
    };

    return (
        <div className={styles.workflow}>
            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Stages */}
            <div className={styles.stages}>
                {stages.map((stage, index) => (
                    <div
                        key={stage.id}
                        className={`${styles.stage} ${index === currentStageIndex ? styles.active : ''
                            } ${index < currentStageIndex ? styles.completed : ''}`}
                        onClick={() => onStageClick && onStageClick(stage)}
                    >
                        <div className={styles.stageIcon}>
                            {getStageIcon(stage, index)}
                        </div>
                        <div className={styles.stageInfo}>
                            <span className={styles.stageName}>{stage.name}</span>
                            <span className={styles.stageDesc}>{stage.description}</span>
                        </div>
                        {index < stages.length - 1 && (
                            <div className={styles.connector} />
                        )}
                    </div>
                ))}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className={styles.alerts}>
                    {alerts.map((alert, idx) => (
                        <div key={idx} className={`${styles.alert} ${styles[alert.type]}`}>
                            <AlertTriangle size={16} />
                            <span>{alert.message}</span>
                            {alert.action && (
                                <button className={styles.alertAction}>
                                    {alert.action.replace(/_/g, ' ')}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Current Stage Info */}
            <div className={styles.currentStage}>
                <div className={styles.currentStageHeader}>
                    <span className={styles.currentStageLabel}>Current Stage</span>
                    <span
                        className={styles.currentStageBadge}
                        style={{ backgroundColor: stages[currentStageIndex]?.color }}
                    >
                        {stages[currentStageIndex]?.name}
                    </span>
                </div>

                {/* Approval Action UI */}
                {rfq.stage === 'needs_approval' ? (
                    <div className={styles.approvalSection}>
                        <ApprovalAction
                            rfqId={rfq.id}
                            onActionComplete={() => window.location.reload()}
                        />
                    </div>
                ) : (
                    <div className={styles.currentStageActions}>
                        {stages[currentStageIndex]?.allowedActions.map(action => (
                            <button
                                key={action}
                                className={styles.actionButton}
                                onClick={() => {
                                    if (action === 'create_po') {
                                        setShowPOModal(true);
                                    } else {
                                        console.log('Action:', action);
                                        // Handle other actions
                                    }
                                }}
                            >
                                {action.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PO Conversion Modal */}
            <POConversionModal
                rfq={rfq}
                isOpen={showPOModal}
                onClose={() => setShowPOModal(false)}
                onConvert={(po) => {
                    window.location.href = `/purchase-orders/${po.id}`;
                }}
            />
        </div>
    );
}
