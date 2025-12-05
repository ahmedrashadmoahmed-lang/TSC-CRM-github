// Quote Comparison Test Page
// Test quote comparison and scoring

'use client';

import { useState } from 'react';
import QuoteComparison from '@/components/rfq/QuoteComparison';
import styles from './page.module.css';

export default function QuoteComparisonTestPage() {
    // Mock quotes data
    const mockQuotes = [
        {
            id: 'q1',
            supplier: {
                id: 's1',
                name: 'Office Depot Egypt',
                rating: 4.5
            },
            totalPrice: 45000,
            deliveryTime: 7,
            paymentTerms: 'Net 30',
            submittedAt: new Date()
        },
        {
            id: 'q2',
            supplier: {
                id: 's2',
                name: 'Staples Middle East',
                rating: 4.2
            },
            totalPrice: 42000,
            deliveryTime: 10,
            paymentTerms: 'Net 45',
            submittedAt: new Date()
        },
        {
            id: 'q3',
            supplier: {
                id: 's3',
                name: 'Amazon Business',
                rating: 4.8
            },
            totalPrice: 48000,
            deliveryTime: 5,
            paymentTerms: 'Net 60',
            submittedAt: new Date()
        },
        {
            id: 'q4',
            supplier: {
                id: 's4',
                name: 'Local Supplier Co.',
                rating: 3.5
            },
            totalPrice: 39000,
            deliveryTime: 14,
            paymentTerms: 'Cash on Delivery',
            submittedAt: new Date()
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📊 Quote Comparison Test</h1>
                <p>Testing Feature 3: Intelligent Quote Comparison</p>
            </div>

            <div className={styles.content}>
                {/* Quote Comparison Component */}
                <QuoteComparison
                    rfqId="test-rfq-1"
                    quotes={mockQuotes}
                />

                {/* Feature Info */}
                <div className={styles.info}>
                    <h2>🎯 Scoring System</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.weight}>40%</div>
                            <div className={styles.factor}>Price</div>
                            <p>Lower price = Higher score</p>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.weight}>30%</div>
                            <div className={styles.factor}>Delivery</div>
                            <p>Faster delivery = Higher score</p>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.weight}>20%</div>
                            <div className={styles.factor}>Quality</div>
                            <p>Based on supplier rating</p>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.weight}>10%</div>
                            <div className={styles.factor}>Terms</div>
                            <p>Better payment terms = Higher score</p>
                        </div>
                    </div>
                </div>

                {/* Feature Status */}
                <div className={styles.status}>
                    <h2>✅ Feature 3 Status</h2>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Comparison Engine</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>4-Factor Scoring</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Automatic Ranking</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Winner Highlighting</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>CSV Export</span>
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
