'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import styles from './pipeline.module.css';

const initialDeals = {
    leads: [
        { id: 1, company: 'ABC Corporation', contact: 'John Smith', value: 'EGP 150K', priority: 'high', date: '2025-11-18' },
        { id: 2, company: 'Tech Solutions Ltd', contact: 'Sarah Johnson', value: 'EGP 85K', priority: 'medium', date: '2025-11-19' },
        { id: 3, company: 'Global Industries', contact: 'Mike Chen', value: 'EGP 220K', priority: 'high', date: '2025-11-20' },
    ],
    quotes: [
        { id: 4, company: 'XYZ Enterprises', contact: 'Emily Davis', value: 'EGP 95K', priority: 'medium', date: '2025-11-15' },
        { id: 5, company: 'Innovation Hub', contact: 'David Lee', value: 'EGP 180K', priority: 'high', date: '2025-11-16' },
    ],
    negotiations: [
        { id: 6, company: 'Prime Manufacturing', contact: 'Lisa Anderson', value: 'EGP 320K', priority: 'high', date: '2025-11-12' },
        { id: 7, company: 'Metro Supplies', contact: 'Robert Wilson', value: 'EGP 65K', priority: 'low', date: '2025-11-14' },
    ],
    won: [
        { id: 8, company: 'Elite Systems', contact: 'Jennifer Brown', value: 'EGP 275K', priority: 'high', date: '2025-11-10' },
        { id: 9, company: 'Smart Tech Co', contact: 'Thomas Garcia', value: 'EGP 140K', priority: 'medium', date: '2025-11-11' },
    ],
};

const columns = [
    { id: 'leads', title: 'Leads', color: 'info', count: 3 },
    { id: 'quotes', title: 'Quotes Sent', color: 'primary', count: 2 },
    { id: 'negotiations', title: 'Negotiations', color: 'warning', count: 2 },
    { id: 'won', title: 'Won', color: 'success', count: 2 },
];

export default function Pipeline() {
    const [deals, setDeals] = useState(initialDeals);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewDealForm, setShowNewDealForm] = useState(false);
    const [newDeal, setNewDeal] = useState({
        company: '',
        contact: '',
        value: '',
        priority: 'medium',
    });

    const moveDeal = (dealId, fromColumn, toColumn) => {
        const deal = deals[fromColumn].find(d => d.id === dealId);
        if (!deal) return;

        setDeals(prev => ({
            ...prev,
            [fromColumn]: prev[fromColumn].filter(d => d.id !== dealId),
            [toColumn]: [...prev[toColumn], deal],
        }));
    };

    const handleCreateDeal = (e) => {
        e.preventDefault();

        const newId = Math.max(...Object.values(deals).flat().map(d => d.id)) + 1;
        const today = new Date().toISOString().split('T')[0];

        const dealToAdd = {
            id: newId,
            company: newDeal.company,
            contact: newDeal.contact,
            value: newDeal.value,
            priority: newDeal.priority,
            date: today,
        };

        setDeals(prev => ({
            ...prev,
            leads: [...prev.leads, dealToAdd],
        }));

        // Reset form
        setNewDeal({
            company: '',
            contact: '',
            value: '',
            priority: 'medium',
        });
        setShowNewDealForm(false);
    };

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const headerActions = (
        <>
            <div className={styles.filterGroup}>
                <select
                    className={styles.select}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                </select>
                <input
                    type="text"
                    placeholder="Search deals..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="primary" size="md" onClick={() => setShowNewDealForm(true)}>
                ➕ New Deal
            </Button>
        </>
    );

    return (
        <MainLayout>
            <Header
                title="Sales Pipeline"
                subtitle="Manage your deals from lead to close"
                actions={headerActions}
            />

            <div className={styles.container}>
                {showNewDealForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>Create New Deal</h2>
                            <form onSubmit={handleCreateDeal} className={styles.dealForm}>
                                <Input
                                    label="Company Name"
                                    placeholder="Enter company name"
                                    value={newDeal.company}
                                    onChange={(e) => setNewDeal(prev => ({ ...prev, company: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Contact Person"
                                    placeholder="Enter contact name"
                                    value={newDeal.contact}
                                    onChange={(e) => setNewDeal(prev => ({ ...prev, contact: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Deal Value"
                                    placeholder="e.g., EGP 100K"
                                    value={newDeal.value}
                                    onChange={(e) => setNewDeal(prev => ({ ...prev, value: e.target.value }))}
                                    required
                                />
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Priority</label>
                                    <select
                                        className={styles.select}
                                        value={newDeal.priority}
                                        onChange={(e) => setNewDeal(prev => ({ ...prev, priority: e.target.value }))}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className={styles.modalActions}>
                                    <Button type="button" variant="ghost" onClick={() => setShowNewDealForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        Create Deal
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles.kanban}>
                    {columns.map(column => (
                        <div key={column.id} className={styles.column}>
                            <div className={styles.columnHeader}>
                                <div className={styles.columnTitle}>
                                    <h3>{column.title}</h3>
                                    <Badge variant={column.color} size="sm">
                                        {deals[column.id].length}
                                    </Badge>
                                </div>
                            </div>

                            <div className={styles.columnContent}>
                                {deals[column.id]
                                    .filter(deal =>
                                        (filter === 'all' || deal.priority === filter) &&
                                        (searchTerm === '' ||
                                            deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            deal.contact.toLowerCase().includes(searchTerm.toLowerCase()))
                                    )
                                    .map(deal => (
                                        <Card key={deal.id} className={styles.dealCard} hover>
                                            <div className={styles.dealHeader}>
                                                <h4 className={styles.dealCompany}>{deal.company}</h4>
                                                <Badge variant={getPriorityVariant(deal.priority)} size="sm">
                                                    {deal.priority}
                                                </Badge>
                                            </div>

                                            <div className={styles.dealInfo}>
                                                <p className={styles.dealContact}>👤 {deal.contact}</p>
                                                <p className={styles.dealValue}>💰 {deal.value}</p>
                                                <p className={styles.dealDate}>📅 {deal.date}</p>
                                            </div>

                                            <div className={styles.dealActions}>
                                                {column.id !== 'leads' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const currentIndex = columns.findIndex(c => c.id === column.id);
                                                            if (currentIndex > 0) {
                                                                moveDeal(deal.id, column.id, columns[currentIndex - 1].id);
                                                            }
                                                        }}
                                                    >
                                                        ← Back
                                                    </Button>
                                                )}
                                                {column.id !== 'won' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            const currentIndex = columns.findIndex(c => c.id === column.id);
                                                            if (currentIndex < columns.length - 1) {
                                                                moveDeal(deal.id, column.id, columns[currentIndex + 1].id);
                                                            }
                                                        }}
                                                    >
                                                        Next →
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
