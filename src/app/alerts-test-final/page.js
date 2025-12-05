'use client';

import { useState } from 'react';

// Generate alerts function
function generateAlertsFromRFQs(rfqs) {
    const alerts = [];
    const now = new Date();

    rfqs.forEach(rfq => {
        // Deadline alerts
        if (rfq.deadline) {
            const deadline = new Date(rfq.deadline);
            const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

            if (daysUntilDeadline < 0) {
                alerts.push({
                    id: `alert_${Date.now()}_${Math.random()}`,
                    type: 'deadline_overdue',
                    severity: 'critical',
                    color: '#ef4444',
                    message: `RFQ ${rfq.rfqNumber} deadline passed ${Math.abs(daysUntilDeadline)} days ago`
                });
            } else if (daysUntilDeadline <= 3) {
                alerts.push({
                    id: `alert_${Date.now()}_${Math.random()}`,
                    type: 'deadline_approaching',
                    severity: 'warning',
                    color: '#f59e0b',
                    message: `RFQ ${rfq.rfqNumber} deadline in ${daysUntilDeadline} days`
                });
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
                    alerts.push({
                        id: `alert_${Date.now()}_${Math.random()}`,
                        type: 'no_responses',
                        severity: 'warning',
                        color: '#f59e0b',
                        message: `No responses received for RFQ ${rfq.rfqNumber} after ${daysSinceSent} days`
                    });
                }
            } else if (responseRate < 50 && responseRate > 0) {
                alerts.push({
                    id: `alert_${Date.now()}_${Math.random()}`,
                    type: 'low_response_rate',
                    severity: 'info',
                    color: '#3b82f6',
                    message: `Only ${responsesReceived}/${totalSuppliers} suppliers responded to RFQ ${rfq.rfqNumber}`
                });
            }
        }

        // Budget alerts
        if (rfq.budget && rfq.quotes && rfq.quotes.length > 0) {
            const lowestQuote = Math.min(...rfq.quotes.map(q => q.totalPrice));
            const budgetDiff = lowestQuote - rfq.budget;
            const budgetDiffPercent = (budgetDiff / rfq.budget) * 100;

            if (budgetDiff > 0) {
                if (budgetDiffPercent > 20) {
                    alerts.push({
                        id: `alert_${Date.now()}_${Math.random()}`,
                        type: 'budget_exceeded',
                        severity: 'critical',
                        color: '#ef4444',
                        message: `All quotes exceed budget by ${budgetDiffPercent.toFixed(0)}% for RFQ ${rfq.rfqNumber}`
                    });
                } else {
                    alerts.push({
                        id: `alert_${Date.now()}_${Math.random()}`,
                        type: 'budget_warning',
                        severity: 'warning',
                        color: '#f59e0b',
                        message: `Lowest quote is ${budgetDiffPercent.toFixed(0)}% over budget for RFQ ${rfq.rfqNumber}`
                    });
                }
            }
        }
    });

    return alerts;
}

// Mock RFQs
const mockRFQs = [
    {
        id: 'rfq1',
        rfqNumber: 'RFQ-2025-0001',
        title: 'Office Supplies',
        stage: 'waiting',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        budget: 50000,
        suppliers: [
            { id: 's1', name: 'Supplier A' },
            { id: 's2', name: 'Supplier B' },
            { id: 's3', name: 'Supplier C' }
        ],
        quotes: [
            { id: 'q1', totalPrice: 48000 }
        ]
    },
    {
        id: 'rfq2',
        rfqNumber: 'RFQ-2025-0002',
        title: 'IT Equipment',
        stage: 'sent',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        budget: 100000,
        suppliers: [
            { id: 's4', name: 'Supplier D' },
            { id: 's5', name: 'Supplier E' }
        ],
        quotes: []
    },
    {
        id: 'rfq3',
        rfqNumber: 'RFQ-2025-0003',
        title: 'Raw Materials',
        stage: 'comparing',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        budget: 75000,
        suppliers: [
            { id: 's6', name: 'Supplier F' },
            { id: 's7', name: 'Supplier G' }
        ],
        quotes: [
            { id: 'q2', totalPrice: 95000 },
            { id: 'q3', totalPrice: 92000 }
        ]
    }
];

export default function AlertsTestFinal() {
    // Generate alerts immediately during initialization
    const [alerts] = useState(() => {
        console.log('Generating alerts during useState initialization...');
        const generated = generateAlertsFromRFQs(mockRFQs);
        console.log('Generated alerts:', generated);
        return generated;
    });

    console.log('Component rendering, alerts count:', alerts.length);

    const summary = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
    };

    return (
        <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
            <h1>🔔 Alerts Test - useState Version</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>Using useState initializer instead of useEffect</p>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2>📊 Summary</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
                    <div style={{ padding: '15px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.total}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
                    </div>
                    <div style={{ padding: '15px', background: '#fee', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{summary.critical}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Critical</div>
                    </div>
                    <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.warning}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Warning</div>
                    </div>
                    <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{summary.info}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Info</div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2>🔔 Alerts ({alerts.length})</h2>
                {alerts.length === 0 ? (
                    <p style={{ color: '#999' }}>No alerts generated</p>
                ) : (
                    <div style={{ marginTop: '15px' }}>
                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '12px',
                                    marginBottom: '10px',
                                    borderLeft: `4px solid ${alert.color}`,
                                    background: '#f9f9f9',
                                    borderRadius: '4px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong style={{ color: alert.color }}>{alert.severity.toUpperCase()}</strong>
                                    <span style={{ fontSize: '11px', color: '#999' }}>{alert.type}</span>
                                </div>
                                <div>{alert.message}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
