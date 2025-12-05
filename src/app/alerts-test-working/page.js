'use client';

import NotificationCenter from '@/components/rfq/NotificationCenter';

export default function AlertsTestWorking() {
    // Mock RFQs - simple and direct
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

    return (
        <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>🔔 RFQ Alerts Test - Working Version</h1>
                <p style={{ margin: 0, color: '#666' }}>Testing with NotificationCenter component</p>
            </div>

            <NotificationCenter rfqs={mockRFQs} />

            <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ marginTop: 0 }}>📋 Test Data</h2>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>RFQ-0001:</strong> Waiting stage, deadline in 2 days, 1/3 suppliers responded</li>
                    <li><strong>RFQ-0002:</strong> Sent stage, deadline 1 day overdue, no responses after 10 days</li>
                    <li><strong>RFQ-0003:</strong> Comparing stage, quotes exceed budget by 23%</li>
                </ul>

                <h3>Expected Alerts (5):</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>⚠️ Deadline approaching (RFQ-0001, 2 days)</li>
                    <li>ℹ️ Low response rate (RFQ-0001, 33%)</li>
                    <li>🔴 Deadline overdue (RFQ-0002, 1 day)</li>
                    <li>⚠️ No responses (RFQ-0002, 10 days)</li>
                    <li>🔴 Budget exceeded (RFQ-0003, 23%)</li>
                </ul>
            </div>
        </div>
    );
}
