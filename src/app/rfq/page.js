'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import CurrencySelector from '@/components/rfq/CurrencySelector';
import styles from './rfq.module.css';

const mockRFQs = [
    {
        id: 'RFQ-001',
        title: 'Industrial Equipment for Factory Expansion',
        customer: 'ABC Manufacturing',
        items: 5,
        suppliers: 3,
        deadline: '2025-11-25',
        status: 'active',
        responses: 2,
    },
    {
        id: 'RFQ-002',
        title: 'Office Furniture and Fixtures',
        customer: 'Tech Solutions Ltd',
        items: 12,
        suppliers: 4,
        deadline: '2025-11-28',
        status: 'active',
        responses: 3,
    },
    {
        id: 'RFQ-003',
        title: 'IT Hardware and Networking Equipment',
        customer: 'Global Industries',
        items: 8,
        suppliers: 5,
        deadline: '2025-11-22',
        status: 'pending',
        responses: 0,
    },
    {
        id: 'RFQ-004',
        title: 'Raw Materials for Production',
        customer: 'Prime Manufacturing',
        items: 15,
        suppliers: 6,
        deadline: '2025-11-30',
        status: 'active',
        responses: 4,
    },
];

const mockSuppliers = [
    { id: 1, name: 'Supplier A', category: 'Industrial Equipment' },
    { id: 2, name: 'Supplier B', category: 'Office Furniture' },
    { id: 3, name: 'Supplier C', category: 'IT Hardware' },
    { id: 4, name: 'Supplier D', category: 'Raw Materials' },
];

export default function RFQManagement() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [rfqs, setRfqs] = useState(mockRFQs);
    const [formData, setFormData] = useState({
        title: '',
        customer: '',
        deadline: '',
        items: [{ description: '', quantity: '', unit: '' }],
        selectedSuppliers: [],
        currency: 'EGP',
        budget: '',
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'closed': return 'default';
            default: return 'info';
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: '', unit: '' }],
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const toggleSupplier = (supplierId) => {
        setFormData(prev => ({
            ...prev,
            selectedSuppliers: prev.selectedSuppliers.includes(supplierId)
                ? prev.selectedSuppliers.filter(id => id !== supplierId)
                : [...prev.selectedSuppliers, supplierId],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would send to backend
        console.log('Creating RFQ:', formData);
        setShowCreateForm(false);
        // Reset form
        setFormData({
            title: '',
            customer: '',
            deadline: '',
            items: [{ description: '', quantity: '', unit: '' }],
            selectedSuppliers: [],
            currency: 'EGP',
            budget: '',
        });
    };

    const columns = [
        { header: 'RFQ ID', accessor: 'id' },
        { header: 'Title', accessor: 'title' },
        { header: 'Customer', accessor: 'customer' },
        {
            header: 'Items',
            cell: (row) => <Badge variant="info" size="sm">{row.items} items</Badge>
        },
        {
            header: 'Suppliers',
            cell: (row) => <Badge variant="primary" size="sm">{row.suppliers} suppliers</Badge>
        },
        {
            header: 'Responses',
            cell: (row) => (
                <Badge variant={row.responses > 0 ? 'success' : 'warning'} size="sm">
                    {row.responses}/{row.suppliers}
                </Badge>
            )
        },
        { header: 'Deadline', accessor: 'deadline' },
        {
            header: 'Status',
            cell: (row) => (
                <Badge variant={getStatusVariant(row.status)} size="sm">
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Actions',
            cell: (row) => (
                <div className={styles.tableActions}>
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="primary" size="sm">Compare</Button>
                </div>
            ),
        },
    ];

    const headerActions = (
        <Button variant="primary" size="md" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '❌ Cancel' : '➕ Create RFQ'}
        </Button>
    );

    return (
        <MainLayout>
            <Header
                title="RFQ Management"
                subtitle="Create and manage Request for Quotations"
                actions={headerActions}
            />

            <div className={styles.container}>
                {showCreateForm && (
                    <section className={styles.section}>
                        <Card title="Create New RFQ">
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formRow}>
                                    <Input
                                        label="RFQ Title"
                                        placeholder="Enter RFQ title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Customer"
                                        placeholder="Select customer"
                                        value={formData.customer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Currency</label>
                                        <CurrencySelector
                                            value={formData.currency}
                                            onChange={(currency) => setFormData(prev => ({ ...prev, currency }))}
                                        />
                                    </div>
                                    <Input
                                        label="Budget (Optional)"
                                        type="number"
                                        placeholder="Enter budget amount"
                                        value={formData.budget}
                                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className={styles.itemsSection}>
                                    <div className={styles.sectionHeader}>
                                        <h3>Items</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                            ➕ Add Item
                                        </Button>
                                    </div>

                                    {formData.items.map((item, index) => (
                                        <div key={index} className={styles.itemRow}>
                                            <Input
                                                placeholder="Item description"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].description = e.target.value;
                                                    setFormData(prev => ({ ...prev, items: newItems }));
                                                }}
                                                required
                                            />
                                            <Input
                                                placeholder="Quantity"
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].quantity = e.target.value;
                                                    setFormData(prev => ({ ...prev, items: newItems }));
                                                }}
                                                required
                                            />
                                            <Input
                                                placeholder="Unit"
                                                value={item.unit}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].unit = e.target.value;
                                                    setFormData(prev => ({ ...prev, items: newItems }));
                                                }}
                                                required
                                            />
                                            {formData.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    🗑️
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.suppliersSection}>
                                    <h3>Select Suppliers</h3>
                                    <div className={styles.supplierGrid}>
                                        {mockSuppliers.map(supplier => (
                                            <label key={supplier.id} className={styles.supplierCard}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedSuppliers.includes(supplier.id)}
                                                    onChange={() => toggleSupplier(supplier.id)}
                                                />
                                                <div className={styles.supplierInfo}>
                                                    <span className={styles.supplierName}>{supplier.name}</span>
                                                    <span className={styles.supplierCategory}>{supplier.category}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        Send RFQ
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </section>
                )}

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Active RFQs</h2>
                    <Table columns={columns} data={rfqs} />
                </section>
            </div>
        </MainLayout>
    );
}
