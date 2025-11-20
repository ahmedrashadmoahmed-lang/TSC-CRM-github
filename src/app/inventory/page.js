'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import styles from './inventory.module.css';

const mockInventory = [
    {
        id: 'SKU-001',
        name: 'Industrial Motor - 5HP',
        category: 'Machinery',
        quantity: 45,
        minStock: 20,
        maxStock: 100,
        location: 'Warehouse A - Rack 12',
        value: 'EGP 67,500',
        lastUpdated: '2025-11-20',
    },
    {
        id: 'SKU-002',
        name: 'Office Chair - Executive',
        category: 'Furniture',
        quantity: 12,
        minStock: 15,
        maxStock: 50,
        location: 'Warehouse B - Section 3',
        value: 'EGP 18,000',
        lastUpdated: '2025-11-19',
    },
    {
        id: 'SKU-003',
        name: 'Laptop - Dell Latitude',
        category: 'Electronics',
        quantity: 8,
        minStock: 10,
        maxStock: 30,
        location: 'Warehouse A - Secure Room',
        value: 'EGP 120,000',
        lastUpdated: '2025-11-20',
    },
    {
        id: 'SKU-004',
        name: 'Steel Sheets - 2mm',
        category: 'Raw Materials',
        quantity: 150,
        minStock: 50,
        maxStock: 200,
        location: 'Warehouse C - Yard',
        value: 'EGP 225,000',
        lastUpdated: '2025-11-18',
    },
];

const incomingShipments = [
    {
        id: 'SHIP-001',
        po: 'PO-2025-002',
        supplier: 'Tech Equipment Ltd',
        items: 5,
        expectedDate: '2025-11-25',
        status: 'in-transit',
    },
    {
        id: 'SHIP-002',
        po: 'PO-2025-003',
        supplier: 'Office Furniture Plus',
        items: 12,
        expectedDate: '2025-11-28',
        status: 'customs',
    },
    {
        id: 'SHIP-003',
        po: 'PO-2025-005',
        supplier: 'Industrial Supplies Co.',
        items: 8,
        expectedDate: '2025-12-02',
        status: 'preparing',
    },
];

export default function Inventory() {
    const [inventory, setInventory] = useState(mockInventory);
    const [activeTab, setActiveTab] = useState('stock');

    const getStockStatus = (item) => {
        if (item.quantity < item.minStock) return { variant: 'error', label: 'Low Stock' };
        if (item.quantity > item.maxStock * 0.8) return { variant: 'warning', label: 'High Stock' };
        return { variant: 'success', label: 'Normal' };
    };

    const getShipmentStatus = (status) => {
        switch (status) {
            case 'preparing': return 'warning';
            case 'in-transit': return 'info';
            case 'customs': return 'primary';
            case 'arrived': return 'success';
            default: return 'default';
        }
    };

    const inventoryColumns = [
        { header: 'SKU', accessor: 'id' },
        { header: 'Product Name', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        {
            header: 'Quantity',
            cell: (row) => {
                const status = getStockStatus(row);
                return (
                    <div className={styles.quantityCell}>
                        <span className={styles.quantity}>{row.quantity}</span>
                        <Badge variant={status.variant} size="sm">{status.label}</Badge>
                    </div>
                );
            }
        },
        { header: 'Location', accessor: 'location' },
        { header: 'Value', accessor: 'value' },
        {
            header: 'Actions',
            cell: (row) => (
                <div className={styles.tableActions}>
                    <Button variant="outline" size="sm">Adjust</Button>
                    <Button variant="primary" size="sm">Move</Button>
                </div>
            ),
        },
    ];

    const shipmentColumns = [
        { header: 'Shipment ID', accessor: 'id' },
        { header: 'PO Number', accessor: 'po' },
        { header: 'Supplier', accessor: 'supplier' },
        {
            header: 'Items',
            cell: (row) => <Badge variant="info" size="sm">{row.items} items</Badge>
        },
        { header: 'Expected Date', accessor: 'expectedDate' },
        {
            header: 'Status',
            cell: (row) => (
                <Badge variant={getShipmentStatus(row.status)} size="sm">
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Actions',
            cell: (row) => (
                <div className={styles.tableActions}>
                    <Button variant="outline" size="sm">Track</Button>
                    <Button variant="primary" size="sm">Receive</Button>
                </div>
            ),
        },
    ];

    const headerActions = (
        <>
            <Button variant="outline" size="md">
                📊 Generate Report
            </Button>
            <Button variant="primary" size="md">
                ➕ Add Item
            </Button>
        </>
    );

    const lowStockItems = inventory.filter(item => item.quantity < item.minStock);
    const totalValue = inventory.reduce((sum, item) => {
        const value = parseFloat(item.value.replace(/[^0-9.]/g, ''));
        return sum + value;
    }, 0);

    return (
        <MainLayout>
            <Header
                title="Inventory Management"
                subtitle="Track stock levels and incoming shipments"
                actions={headerActions}
            />

            <div className={styles.container}>
                <div className={styles.statsGrid}>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📦</span>
                            <div>
                                <h3 className={styles.statValue}>{inventory.length}</h3>
                                <p className={styles.statLabel}>Total SKUs</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>⚠️</span>
                            <div>
                                <h3 className={styles.statValue}>{lowStockItems.length}</h3>
                                <p className={styles.statLabel}>Low Stock Items</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>🚚</span>
                            <div>
                                <h3 className={styles.statValue}>{incomingShipments.length}</h3>
                                <p className={styles.statLabel}>Incoming Shipments</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>💰</span>
                            <div>
                                <h3 className={styles.statValue}>EGP {(totalValue / 1000).toFixed(0)}K</h3>
                                <p className={styles.statLabel}>Total Inventory Value</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'stock' ? styles.active : ''}`}
                        onClick={() => setActiveTab('stock')}
                    >
                        📊 Stock Levels
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'shipments' ? styles.active : ''}`}
                        onClick={() => setActiveTab('shipments')}
                    >
                        🚚 Incoming Shipments
                    </button>
                </div>

                {activeTab === 'stock' && (
                    <section className={styles.section}>
                        <Table columns={inventoryColumns} data={inventory} />
                    </section>
                )}

                {activeTab === 'shipments' && (
                    <section className={styles.section}>
                        <Table columns={shipmentColumns} data={incomingShipments} />
                    </section>
                )}
            </div>
        </MainLayout>
    );
}
