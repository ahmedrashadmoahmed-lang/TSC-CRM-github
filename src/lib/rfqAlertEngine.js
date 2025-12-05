// RFQ Alert Engine
// Intelligent alert system for RFQ management

export const RFQAlertEngine = {
    // Alert types
    alertTypes: {
        DEADLINE_APPROACHING: {
            id: 'deadline_approaching',
            severity: 'warning',
            icon: 'clock',
            color: '#f59e0b'
        },
        DEADLINE_OVERDUE: {
            id: 'deadline_overdue',
            severity: 'critical',
            icon: 'alert-circle',
            color: '#ef4444'
        },
        NO_RESPONSES: {
            id: 'no_responses',
            severity: 'warning',
            icon: 'inbox',
            color: '#f59e0b'
        },
        LOW_RESPONSE_RATE: {
            id: 'low_response_rate',
            severity: 'info',
            icon: 'trending-down',
            color: '#3b82f6'
        },
        BUDGET_EXCEEDED: {
            id: 'budget_exceeded',
            severity: 'critical',
            icon: 'dollar-sign',
            color: '#ef4444'
        },
        BUDGET_WARNING: {
            id: 'budget_warning',
            severity: 'warning',
            icon: 'alert-triangle',
            color: '#f59e0b'
        },
        NEW_QUOTE: {
            id: 'new_quote',
            severity: 'success',
            icon: 'mail',
            color: '#10b981'
        },
        QUOTE_UPDATED: {
            id: 'quote_updated',
            severity: 'info',
            icon: 'refresh-cw',
            color: '#3b82f6'
        }
    },

    /**
     * Generate alerts for an RFQ
     */
    generateAlerts(rfq) {
        const alerts = [];
        const now = new Date();

        // Deadline alerts
        if (rfq.deadline) {
            const deadline = new Date(rfq.deadline);
            const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

            if (daysUntilDeadline < 0) {
                alerts.push(this.createAlert(
                    this.alertTypes.DEADLINE_OVERDUE,
                    `RFQ ${rfq.rfqNumber} deadline passed ${Math.abs(daysUntilDeadline)} days ago`,
                    {
                        rfqId: rfq.id,
                        daysOverdue: Math.abs(daysUntilDeadline),
                        action: 'extend_deadline'
                    }
                ));
            } else if (daysUntilDeadline <= 3) {
                alerts.push(this.createAlert(
                    this.alertTypes.DEADLINE_APPROACHING,
                    `RFQ ${rfq.rfqNumber} deadline in ${daysUntilDeadline} days`,
                    {
                        rfqId: rfq.id,
                        daysRemaining: daysUntilDeadline,
                        action: 'review_rfq'
                    }
                ));
            }
        }

        // Response rate alerts
        if (rfq.stage === 'waiting' || rfq.stage === 'sent') {
            const totalSuppliers = rfq.suppliers?.length || 0;
            const responsesReceived = rfq.quotes?.length || 0;
            const responseRate = totalSuppliers > 0 ? (responsesReceived / totalSuppliers) * 100 : 0;

            if (responsesReceived === 0 && rfq.sentAt) {
                const daysSinceSent = Math.ceil((now - new Date(rfq.sentAt)) / (1000 * 60 * 60 * 24));
                if (daysSinceSent >= 3) {
                    alerts.push(this.createAlert(
                        this.alertTypes.NO_RESPONSES,
                        `No responses received for RFQ ${rfq.rfqNumber} after ${daysSinceSent} days`,
                        {
                            rfqId: rfq.id,
                            daysSinceSent,
                            action: 'follow_up'
                        }
                    ));
                }
            } else if (responseRate < 50 && responseRate > 0) {
                alerts.push(this.createAlert(
                    this.alertTypes.LOW_RESPONSE_RATE,
                    `Only ${responsesReceived}/${totalSuppliers} suppliers responded to RFQ ${rfq.rfqNumber}`,
                    {
                        rfqId: rfq.id,
                        responseRate,
                        action: 'send_reminder'
                    }
                ));
            }
        }

        // Budget alerts
        if (rfq.budget && rfq.quotes && rfq.quotes.length > 0) {
            const lowestQuote = Math.min(...rfq.quotes.map(q => q.totalPrice));
            const budgetDiff = lowestQuote - rfq.budget;
            const budgetDiffPercent = (budgetDiff / rfq.budget) * 100;

            if (budgetDiff > 0) {
                if (budgetDiffPercent > 20) {
                    alerts.push(this.createAlert(
                        this.alertTypes.BUDGET_EXCEEDED,
                        `All quotes exceed budget by ${budgetDiffPercent.toFixed(0)}% for RFQ ${rfq.rfqNumber}`,
                        {
                            rfqId: rfq.id,
                            budget: rfq.budget,
                            lowestQuote,
                            difference: budgetDiff,
                            action: 'adjust_budget'
                        }
                    ));
                } else {
                    alerts.push(this.createAlert(
                        this.alertTypes.BUDGET_WARNING,
                        `Lowest quote is ${budgetDiffPercent.toFixed(0)}% over budget for RFQ ${rfq.rfqNumber}`,
                        {
                            rfqId: rfq.id,
                            budget: rfq.budget,
                            lowestQuote,
                            difference: budgetDiff,
                            action: 'review_quotes'
                        }
                    ));
                }
            }
        }

        return alerts;
    },

    /**
     * Create alert object
     */
    createAlert(type, message, metadata = {}) {
        return {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type.id,
            severity: type.severity,
            icon: type.icon,
            color: type.color,
            message,
            metadata,
            createdAt: new Date(),
            read: false,
            dismissed: false
        };
    },

    /**
     * Get alerts for multiple RFQs
     */
    generateBulkAlerts(rfqs) {
        const allAlerts = [];

        rfqs.forEach(rfq => {
            const rfqAlerts = this.generateAlerts(rfq);
            allAlerts.push(...rfqAlerts);
        });

        // Sort by severity and date
        return this.sortAlerts(allAlerts);
    },

    /**
     * Sort alerts by priority
     */
    sortAlerts(alerts) {
        const severityOrder = {
            critical: 0,
            warning: 1,
            info: 2,
            success: 3
        };

        return alerts.sort((a, b) => {
            // First by severity
            const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
            if (severityDiff !== 0) return severityDiff;

            // Then by date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    },

    /**
     * Filter alerts
     */
    filterAlerts(alerts, filters = {}) {
        let filtered = [...alerts];

        if (filters.severity) {
            filtered = filtered.filter(a => a.severity === filters.severity);
        }

        if (filters.type) {
            filtered = filtered.filter(a => a.type === filters.type);
        }

        if (filters.unreadOnly) {
            filtered = filtered.filter(a => !a.read);
        }

        if (filters.notDismissed) {
            filtered = filtered.filter(a => !a.dismissed);
        }

        return filtered;
    },

    /**
     * Get alert summary
     */
    getAlertSummary(alerts) {
        const summary = {
            total: alerts.length,
            critical: 0,
            warning: 0,
            info: 0,
            success: 0,
            unread: 0
        };

        alerts.forEach(alert => {
            summary[alert.severity]++;
            if (!alert.read) summary.unread++;
        });

        return summary;
    },

    /**
     * Get recommended action for alert
     */
    getRecommendedAction(alert) {
        const actions = {
            extend_deadline: {
                label: 'Extend Deadline',
                description: 'Add more time for suppliers to respond',
                icon: 'calendar-plus'
            },
            review_rfq: {
                label: 'Review RFQ',
                description: 'Check RFQ details and status',
                icon: 'eye'
            },
            follow_up: {
                label: 'Follow Up',
                description: 'Contact suppliers for updates',
                icon: 'phone'
            },
            send_reminder: {
                label: 'Send Reminder',
                description: 'Remind suppliers about pending RFQ',
                icon: 'bell'
            },
            adjust_budget: {
                label: 'Adjust Budget',
                description: 'Increase budget or negotiate',
                icon: 'dollar-sign'
            },
            review_quotes: {
                label: 'Review Quotes',
                description: 'Evaluate received quotes',
                icon: 'file-text'
            }
        };

        return actions[alert.metadata.action] || null;
    }
};

export default RFQAlertEngine;
