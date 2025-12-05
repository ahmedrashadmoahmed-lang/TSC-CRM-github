// RFQ Workflow Engine
// Manages multi-stage RFQ workflow with 7 stages

export const RFQWorkflowEngine = {
    // 7-Stage Workflow
    stages: [
        {
            id: 'draft',
            name: 'Draft',
            color: '#6b7280',
            description: 'RFQ is being created',
            allowedActions: ['edit', 'delete', 'submit_for_approval']
        },
        {
            id: 'needs_approval',
            name: 'Pending Approval',
            color: '#f59e0b',
            description: 'Awaiting internal approval',
            allowedActions: ['approve', 'reject', 'view']
        },
        {
            id: 'approved',
            name: 'Approved',
            color: '#10b981',
            description: 'RFQ approved for sending',
            allowedActions: ['send', 'edit']
        },
        {
            id: 'sent',
            name: 'Sent to Suppliers',
            color: '#3b82f6',
            description: 'RFQ sent to suppliers',
            allowedActions: ['view', 'remind', 'cancel']
        },
        {
            id: 'waiting',
            name: 'Awaiting Response',
            color: '#f59e0b',
            description: 'Waiting for supplier quotes',
            allowedActions: ['view', 'remind', 'extend_deadline']
        },
        {
            id: 'comparing',
            name: 'Comparing Quotes',
            color: '#8b5cf6',
            description: 'Evaluating received quotes',
            allowedActions: ['compare', 'evaluate', 'request_clarification']
        },
        {
            id: 'selected',
            name: 'Supplier Selected',
            color: '#10b981',
            description: 'Best supplier selected',
            allowedActions: ['create_po', 'negotiate']
        },
        {
            id: 'po_created',
            name: 'PO Created',
            color: '#059669',
            description: 'Purchase order created',
            allowedActions: ['view', 'close']
        },
        {
            id: 'closed',
            name: 'Closed',
            color: '#1f2937',
            description: 'RFQ process completed',
            allowedActions: ['view', 'archive']
        }
    ],

    /**
     * Move RFQ to next stage
     */
    moveToNextStage(currentStage) {
        const currentIndex = this.stages.findIndex(s => s.id === currentStage);
        if (currentIndex === -1 || currentIndex === this.stages.length - 1) {
            return null;
        }
        return this.stages[currentIndex + 1];
    },

    /**
     * Get current stage info
     */
    getStageInfo(stageId) {
        return this.stages.find(s => s.id === stageId);
    },

    /**
     * Check if action is allowed in current stage
     */
    canPerformAction(stageId, action) {
        const stage = this.getStageInfo(stageId);
        return stage?.allowedActions.includes(action) || false;
    },

    /**
     * Get overdue RFQs
     */
    getOverdueRFQs(rfqs, days = 7) {
        const now = new Date();
        return rfqs.filter(rfq => {
            if (rfq.stage === 'closed' || rfq.stage === 'po_created') return false;

            if (rfq.deadline) {
                return new Date(rfq.deadline) < now;
            }

            if (rfq.sentAt && rfq.stage === 'waiting') {
                const daysSinceSent = (now - new Date(rfq.sentAt)) / (1000 * 60 * 60 * 24);
                return daysSinceSent > days;
            }

            return false;
        });
    },

    /**
     * Get RFQs without supplier responses
     */
    getNoResponseRFQs(rfqs) {
        return rfqs.filter(rfq =>
            rfq.stage === 'waiting' &&
            (!rfq.quotes || rfq.quotes.length === 0)
        );
    },

    /**
     * Generate alerts for RFQ
     */
    getAlerts(rfq) {
        const alerts = [];
        const now = new Date();

        // Deadline alerts
        if (rfq.deadline) {
            const deadline = new Date(rfq.deadline);
            const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

            if (daysUntilDeadline < 0) {
                alerts.push({
                    type: 'error',
                    message: 'Deadline passed',
                    action: 'extend_deadline'
                });
            } else if (daysUntilDeadline < 2) {
                alerts.push({
                    type: 'warning',
                    message: `Deadline in ${Math.ceil(daysUntilDeadline)} days`,
                    action: 'remind_suppliers'
                });
            }
        }

        // No response alerts
        if (rfq.stage === 'waiting' && (!rfq.quotes || rfq.quotes.length === 0)) {
            const daysSinceSent = rfq.sentAt
                ? (now - new Date(rfq.sentAt)) / (1000 * 60 * 60 * 24)
                : 0;

            if (daysSinceSent > 3) {
                alerts.push({
                    type: 'warning',
                    message: 'No supplier responses yet',
                    action: 'send_reminder'
                });
            }
        }

        // Few responses alert
        if (rfq.stage === 'waiting' && rfq.suppliers && rfq.quotes) {
            const responseRate = (rfq.quotes.length / rfq.suppliers.length) * 100;
            if (responseRate < 50 && rfq.deadline) {
                const daysUntilDeadline = (new Date(rfq.deadline) - now) / (1000 * 60 * 60 * 24);
                if (daysUntilDeadline < 3) {
                    alerts.push({
                        type: 'info',
                        message: `Only ${rfq.quotes.length}/${rfq.suppliers.length} suppliers responded`,
                        action: 'send_reminder'
                    });
                }
            }
        }

        // Budget alert
        if (rfq.budget && rfq.quotes && rfq.quotes.length > 0) {
            const lowestQuote = Math.min(...rfq.quotes.map(q => q.totalPrice));
            if (lowestQuote > rfq.budget) {
                alerts.push({
                    type: 'warning',
                    message: `Lowest quote (${lowestQuote}) exceeds budget (${rfq.budget})`,
                    action: 'review_budget'
                });
            }
        }

        return alerts;
    },

    /**
     * Calculate RFQ progress percentage
     */
    calculateProgress(rfq) {
        const stageIndex = this.stages.findIndex(s => s.id === rfq.stage);
        return ((stageIndex + 1) / this.stages.length) * 100;
    },

    /**
     * Get next recommended action
     */
    getNextAction(rfq) {
        switch (rfq.stage) {
            case 'draft':
                return { action: 'submit_for_approval', label: 'Submit for Approval', icon: 'file-check' };
            case 'needs_approval':
                // This would typically be conditional on user role
                return { action: 'approve', label: 'Approve RFQ', icon: 'check-circle' };
            case 'approved':
                return { action: 'send', label: 'Send to Suppliers', icon: 'send' };
            case 'sent':
            case 'waiting':
                if (!rfq.quotes || rfq.quotes.length === 0) {
                    return { action: 'remind', label: 'Send Reminder', icon: 'bell' };
                }
                return { action: 'compare', label: 'Compare Quotes', icon: 'compare' };
            case 'comparing':
                return { action: 'select', label: 'Select Supplier', icon: 'check' };
            case 'selected':
                return { action: 'create_po', label: 'Create Purchase Order', icon: 'file-text' };
            case 'po_created':
                return { action: 'close', label: 'Close RFQ', icon: 'x' };
            default:
                return null;
        }
    },

    /**
     * Validate stage transition
     */
    canTransitionTo(currentStage, targetStage) {
        const currentIndex = this.stages.findIndex(s => s.id === currentStage);
        const targetIndex = this.stages.findIndex(s => s.id === targetStage);

        // Can't go backwards (except to draft for editing/rejection)
        if (targetStage === 'draft' && (currentStage === 'sent' || currentStage === 'needs_approval')) return true;

        // Can only move forward one stage at a time
        return targetIndex === currentIndex + 1;
    },

    /**
     * Get stage statistics for dashboard
     */
    getStageStatistics(rfqs) {
        const stats = {};
        this.stages.forEach(stage => {
            stats[stage.id] = {
                count: rfqs.filter(r => r.stage === stage.id).length,
                totalValue: rfqs
                    .filter(r => r.stage === stage.id)
                    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
            };
        });
        return stats;
    }
};

export default RFQWorkflowEngine;
