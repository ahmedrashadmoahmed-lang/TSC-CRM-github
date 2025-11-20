'use client';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import styles from './fulfillment.module.css';

const mockOrders = [
    { id: 'ORD-001', customer: 'ABC Corp', items: 5, status: 'ready', shipDate: '2025-11-22', destination: 'Cairo' },
    { id: 'ORD-002', customer: 'Tech Solutions', items: 3, status: 'shipped', shipDate: '2025-11-20', destination: 'Alexandria' },
    { id: 'ORD-003', customer: 'Global Industries', items: 8, status: 'processing', shipDate: '2025-11-25', destination: 'Giza' },
];

export default function Fulfillment() {
    const columns = [
        { header: 'Order ID', accessor: 'id' },
        { header: 'Customer', accessor: 'customer' },
        { header: 'Items', cell: (row) => <Badge variant="info" size="sm">{row.items} items</Badge> },
        { header: 'Status', cell: (row) => <Badge variant={row.status === 'shipped' ? 'success' : 'warning'} size="sm">{row.status}</Badge> },
        { header: 'Ship Date', accessor: 'shipDate' },
        { header: 'Destination', accessor: 'destination' },
        { header: 'Actions', cell: () => <Button variant="primary" size="sm">Track</Button> },
    ];

    return (
        <MainLayout>
            <Header title="Order Fulfillment" subtitle="Manage shipping and delivery" />
            <div className={styles.container}>
                <Table columns={columns} data={mockOrders} />
            </div>
        </MainLayout>
    );
}
