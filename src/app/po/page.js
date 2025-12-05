'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import styles from './po.module.css';

const mockPOs = [
    {
        id: 'PO-2025-001',
        supplier: 'Industrial Supplies Co.',
        items: 8,
        totalAmount: 'EGP 145,000',
        status: 'pending',
        paymentTerms: '30 days',
        createdDate: '2025-11-18',
        expectedDelivery: '2025-12-05',
    },
    {
        id: 'PO-2025-002',
        supplier: 'Tech Equipment Ltd',
        items: 5,
        totalAmount: 'EGP 89,500',
        status: 'approved',
        paymentTerms: '60 days',
        createdDate: '2025-11-17',
        expectedDelivery: '2025-12-01',
    },
    {
        id: 'PO-2025-003',
        supplier: 'Office Furniture Plus',
        items: 12,
        totalAmount: 'EGP 67,800',
        status: 'shipped',
        paymentTerms: 'Prepaid 50%',
        createdDate: '2025-11-15',
        expectedDelivery: '2025-11-28',
    },
    {
        id: 'PO-2025-004',
        supplier: 'Raw Materials Inc',
        items: 20,
        totalAmount: 'EGP 234,000',
        status: 'delivered',
        paymentTerms: '90 days',
        createdDate: '2025-11-10',
        expectedDelivery: '2025-11-22',
    },
];

const supplierPerformance = [
    { supplier: 'Industrial Supplies Co.', orders: 15, onTime: 14, rating: 4.8 },
    { supplier: 'Tech Equipment Ltd', orders: 12, onTime: 11, rating: 4.5 },
    { supplier: 'Office Furniture Plus', orders: 18, onTime: 17, rating: 4.9 },
    { supplier: 'Raw Materials Inc', orders: 25, onTime: 23, rating: 4.6 },
];

export default function PurchaseOrders() {
    const [pos, setPos] = useState([]);
    const [activeTab, setActiveTab] = useState('list');

    // Set data after mount to avoid hydration issues
    useEffect(() => {
        setPos(mockPOs);
    }, []);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const poColumns = [
        { header: 'PO Number', accessor: 'id' },
        { header: 'Supplier', accessor: 'supplier' },
        {
            header: 'Items',
            cell: (row) => <Badge variant="info" size="sm">{row.items} items</Badge>
        },
        { header: 'Total Amount', accessor: 'totalAmount' },
        {
            header: 'Status',
            cell: (row) => (
                <Badge variant={getStatusVariant(row.status)} size="sm">
                    {row.status}
                </Badge>
            )
        },
        { header: 'Payment Terms', accessor: 'paymentTerms' },
        { header: 'Expected Delivery', accessor: 'expectedDelivery' },
        {
            header: 'Actions',
            cell: (row) => (
                <div className={styles.tableActions}>
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="primary" size="sm">Track</Button>
                </div>
            ),
        },
    ];

    const performanceColumns = [
        { header: 'Supplier', accessor: 'supplier' },
        { header: 'Total Orders', accessor: 'orders' },
        {
            header: 'On-Time Delivery',
            cell: (row) => (
                <div className={styles.performanceCell}>
                    <span>{row.onTime}/{row.orders}</span>
                    <Badge variant={row.onTime / row.orders >= 0.9 ? 'success' : 'warning'} size="sm">
                        {Math.round((row.onTime / row.orders) * 100)}%
                    </Badge>
                </div>
            )
        },
        {
            header: 'Rating',
            cell: (row) => (
                <div className={styles.ratingCell}>
                    <span className={styles.stars}>⭐</span>
                    <span>{row.rating}/5.0</span>
                </div>
            )
        },
    ];

    const headerActions = (
        <Button variant="primary" size="md">
            ➕ Create PO
        </Button>
    );

    return (
        <MainLayout>
            <Header
                title="Purchase Orders"
                subtitle="Manage purchase orders and supplier performance"
                actions={headerActions}
            />

            <div className={styles.container}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        📋 PO List
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'performance' ? styles.active : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        📊 Supplier Performance
                    </button>
                </div>

                {activeTab === 'list' && (
                    <section className={styles.section}>
                        <div className={styles.statsGrid}>
                            <Card hover>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>📦</span>
                                    <div>
                                        <h3 className={styles.statValue}>{Array.isArray(pos) ? pos.length : 0}</h3>
                                        <p className={styles.statLabel}>Total POs</p>
                                    </div>
                                </div>
                            </Card>
                            <Card hover>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>⏳</span>
                                    <div>
                                        <h3 className={styles.statValue}>
                                            {Array.isArray(pos) ? pos.filter(po => po.status === 'pending').length : 0}
                                        </h3>
                                        <p className={styles.statLabel}>Pending Approval</p>
                                    </div>
                                </div>
                            </Card>
                            <Card hover>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🚚</span>
                                    <div>
                                        <h3 className={styles.statValue}>
                                            {Array.isArray(pos) ? pos.filter(po => po.status === 'shipped').length : 0}
                                        </h3>
                                        <p className={styles.statLabel}>In Transit</p>
                                    </div>
                                </div>
                            </Card>
                            <Card hover>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>💰</span>
                                    <div>
                                        <h3 className={styles.statValue}>EGP 536K</h3>
                                        <p className={styles.statLabel}>Total Value</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Table columns={poColumns} data={Array.isArray(pos) ? pos : []} />
                    </section>
                )}

                {activeTab === 'performance' && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Supplier Performance Metrics</h2>
                        <Table columns={performanceColumns} data={supplierPerformance} />
                    </section>
                )}
            </div>
        </MainLayout>
    );
}
