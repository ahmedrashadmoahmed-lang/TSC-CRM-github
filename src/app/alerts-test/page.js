// Alerts & Notifications Test Page
// Test RFQ alert system

'use client';

import { useState } from 'react';
import NotificationCenter from '@/components/rfq/NotificationCenter';
import styles from './page.module.css';

export default function AlertsTestPage() {
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
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🔔 Alerts & Notifications Test</h1>
                <p>Testing Feature 4: Intelligent Alert System</p>
            </div>

            <div className={styles.content}>
                {/* Notification Center */}
                <NotificationCenter rfqs={mockRFQs} />

                {/* Alert Types Info */}
                <div className={styles.info}>
                    <h2>🎯 Alert Types (8)</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.severity} style={{ background: '#ef4444' }}>
                                Critical
                            </div>
                            <ul>
                                <li>Deadline Overdue</li>
                                <li>Budget Exceeded (&gt;20%)</li>
                            </ul>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.severity} style={{ background: '#f59e0b' }}>
                                Warning
                            </div>
                            <ul>
                                <li>Deadline Approaching (≤3 days)</li>
                                <li>No Responses (≥3 days)</li>
                                <li>Budget Warning (&gt;0%)</li>
                            </ul>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.severity} style={{ background: '#3b82f6' }}>
                                Info
                            </div>
                            <ul>
                                <li>Low Response Rate (&lt;50%)</li>
                                <li>Quote Updated</li>
                            </ul>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.severity} style={{ background: '#10b981' }}>
                                Success
                            </div>
                            <ul>
                                <li>New Quote Received</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Feature Status */}
                <div className={styles.status}>
                    <h2>✅ Feature 4 Status</h2>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Alert Engine (8 types)</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Severity Levels (4)</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Smart Detection</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>NotificationCenter UI</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Filtering & Sorting</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>🧪</span>
                            <span>Browser Testing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
