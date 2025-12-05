// RFQ Test Page
// Test the multi-stage workflow feature

'use client';

import { useState, useEffect } from 'react';
import RFQWorkflowStatus from '@/components/rfq/RFQWorkflowStatus';
import styles from './page.module.css';

export default function RFQTestPage() {
    const [rfqs, setRfqs] = useState([]);
    const [selectedRFQ, setSelectedRFQ] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock RFQ data for testing
    const mockRFQ = {
        id: 'test-rfq-1',
        rfqNumber: 'RFQ-2025-0001',
        title: 'Office Supplies Q1 2025',
        description: 'Request for quotation for office supplies',
        stage: 'waiting',
        status: 'active',
        priority: 'high',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        budget: 50000,
        currency: 'EGP',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        items: [
            {
                productName: 'Printer Paper A4',
                quantity: 100,
                unit: 'box',
                description: '80gsm white paper'
            },
            {
                productName: 'Ballpoint Pens',
                quantity: 500,
                unit: 'pcs',
                description: 'Blue ink, medium point'
            }
        ],
        suppliers: [
            { id: 's1', name: 'Office Depot', status: 'invited' },
            { id: 's2', name: 'Staples', status: 'invited' },
            { id: 's3', name: 'Amazon Business', status: 'viewed' }
        ],
        quotes: [
            {
                id: 'q1',
                supplierId: 's3',
                totalPrice: 45000,
                deliveryTime: 7,
                submittedAt: new Date()
            }
        ]
    };

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setSelectedRFQ(mockRFQ);
            setLoading(false);
        }, 500);
    }, []);

    const handleStageClick = (stage) => {
        console.log('Stage clicked:', stage);
        alert(`Stage: ${stage.name}\n${stage.description}`);
    };

    const handleCreateRFQ = () => {
        alert('Create RFQ functionality - Coming soon!');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading RFQ Test Page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🎯 RFQ Multi-Stage Workflow Test</h1>
                <p className={styles.subtitle}>Testing Feature 1: 7-Stage Workflow System</p>
            </div>

            <div className={styles.content}>
                {/* RFQ Info Card */}
                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}>
                        <h2>{selectedRFQ.rfqNumber}</h2>
                        <span className={styles.priorityBadge}>
                            {selectedRFQ.priority.toUpperCase()}
                        </span>
                    </div>
                    <h3>{selectedRFQ.title}</h3>
                    <p>{selectedRFQ.description}</p>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Budget</span>
                            <span className={styles.infoValue}>
                                {selectedRFQ.currency} {selectedRFQ.budget.toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Deadline</span>
                            <span className={styles.infoValue}>
                                {new Date(selectedRFQ.deadline).toLocaleDateString()}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Items</span>
                            <span className={styles.infoValue}>
                                {selectedRFQ.items.length} items
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Suppliers</span>
                            <span className={styles.infoValue}>
                                {selectedRFQ.suppliers.length} invited
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Quotes</span>
                            <span className={styles.infoValue}>
                                {selectedRFQ.quotes.length} received
                            </span>
                        </div>
                    </div>
                </div>

                {/* Workflow Status Component */}
                <div className={styles.workflowCard}>
                    <h2 className={styles.cardTitle}>
                        📊 Workflow Status
                    </h2>
                    <RFQWorkflowStatus
                        rfq={selectedRFQ}
                        onStageClick={handleStageClick}
                    />
                </div>

                {/* Test Controls */}
                <div className={styles.testControls}>
                    <h2 className={styles.cardTitle}>🧪 Test Controls</h2>
                    <div className={styles.buttonGrid}>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'draft' })}
                        >
                            Set to Draft
                        </button>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'sent' })}
                        >
                            Set to Sent
                        </button>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'waiting' })}
                        >
                            Set to Waiting
                        </button>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'comparing' })}
                        >
                            Set to Comparing
                        </button>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'selected' })}
                        >
                            Set to Selected
                        </button>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'po_created' })}
                        >
                            Set to PO Created
                        </button>
                        <button
                            className={styles.testButton}
                            onClick={() => setSelectedRFQ({ ...selectedRFQ, stage: 'closed' })}
                        >
                            Set to Closed
                        </button>
                    </div>
                </div>

                {/* Feature Status */}
                <div className={styles.statusCard}>
                    <h2 className={styles.cardTitle}>✅ Feature Status</h2>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <span className={styles.statusCheck}>✅</span>
                            <span>Database Schema (8 models)</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusCheck}>✅</span>
                            <span>Workflow Engine (7 stages)</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusCheck}>✅</span>
                            <span>API Endpoints (CRUD)</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusCheck}>✅</span>
                            <span>UI Component</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusCheck}>🧪</span>
                            <span>Browser Testing (In Progress)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
