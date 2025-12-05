'use client';

import { useState } from 'react';
import NotificationCenter from '@/components/rfq/NotificationCenter';

export default function AlertsTestSimple() {
    // Mock RFQs with various alert conditions
    const mockRFQs = [
        {
            id: 'rfq1',
            rfqNumber: 'RFQ-2025-0001',
            title: 'Office Supplies Q1',
            stage: 'waiting',
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
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
            deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
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
                <h1 style={{ margin: '0 0 10px 0' }}>🔔 Alerts & Notifications Test</h1>
                <p style={{ margin: 0, color: '#666' }}>Testing Feature 4: Intelligent Alert System</p>
            </div>

            <NotificationCenter rfqs={mockRFQs} />

            <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ marginTop: 0 }}>✅ Feature Status</h2>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>✅ Alert Engine (8 types)</li>
                    <li>✅ Severity Levels (4)</li>
                    <li>✅ Smart Detection</li>
                    <li>✅ NotificationCenter UI</li>
                    <li>✅ Filtering & Sorting</li>
                    <li>🧪 Browser Testing</li>
                </ul>
            </div>
        </div>
    );
}
