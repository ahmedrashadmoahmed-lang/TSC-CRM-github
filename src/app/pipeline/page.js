'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import DealDetailsModal from '@/components/pipeline/DealDetailsModal';
import PipelineAnalytics from '@/components/pipeline/PipelineAnalytics';
import AdvancedFilters from '@/components/pipeline/AdvancedFilters';
import ViewToggle from '@/components/pipeline/ViewToggle';
import ListView from '@/components/pipeline/ListView';
import TableView from '@/components/pipeline/TableView';
import {
    Building2, User, DollarSign, Calendar, ArrowRight, ArrowLeft,
    Plus, Search, Filter, TrendingUp, Target, CheckCircle2, Clock,
    BarChart3, Percent
} from 'lucide-react';
import styles from './pipeline.module.css';

// Dynamic import for DragDropKanban to avoid SSR hydration issues
const DragDropKanban = dynamic(() => import('@/components/pipeline/DragDropKanban'), {
    ssr: false,
    loading: () => <div className={styles.loading}>Loading Kanban...</div>
});

const initialDeals = {
    leads: [
        { id: 1, company: 'ABC Corporation', contact: 'John Smith', value: 150000, priority: 'high', date: '2025-11-18', email: 'john@abc.com', phone: '+20 123 456 7890' },
        { id: 2, company: 'Tech Solutions Ltd', contact: 'Sarah Johnson', value: 85000, priority: 'medium', date: '2025-11-19', email: 'sarah@techsol.com', phone: '+20 123 456 7891' },
        { id: 3, company: 'Global Industries', contact: 'Mike Chen', value: 220000, priority: 'high', date: '2025-11-20', email: 'mike@global.com', phone: '+20 123 456 7892' },
    ],
    quotes: [
        { id: 4, company: 'XYZ Enterprises', contact: 'Emily Davis', value: 95000, priority: 'medium', date: '2025-11-15', email: 'emily@xyz.com', phone: '+20 123 456 7893' },
        { id: 5, company: 'Innovation Hub', contact: 'David Lee', value: 180000, priority: 'high', date: '2025-11-16', email: 'david@innohub.com', phone: '+20 123 456 7894' },
    ],
    negotiations: [
        { id: 6, company: 'Prime Manufacturing', contact: 'Lisa Anderson', value: 320000, priority: 'high', date: '2025-11-12', email: 'lisa@prime.com', phone: '+20 123 456 7895' },
        { id: 7, company: 'Metro Supplies', contact: 'Robert Wilson', value: 65000, priority: 'low', date: '2025-11-14', email: 'robert@metro.com', phone: '+20 123 456 7896' },
    ],
    won: [
        { id: 8, company: 'Elite Systems', contact: 'Jennifer Brown', value: 275000, priority: 'high', date: '2025-11-10', email: 'jennifer@elite.com', phone: '+20 123 456 7897' },
        { id: 9, company: 'Smart Tech Co', contact: 'Thomas Garcia', value: 140000, priority: 'medium', date: '2025-11-11', email: 'thomas@smarttech.com', phone: '+20 123 456 7898' },
    ],
};

const columns = [
    { id: 'leads', title: 'Leads', color: 'info', icon: Target, count: 3 },
    { id: 'quotes', title: 'Quotes Sent', color: 'primary', icon: BarChart3, count: 2 },
    { id: 'negotiations', title: 'Negotiations', color: 'warning', icon: Clock, count: 2 },
    { id: 'won', title: 'Won', color: 'success', icon: CheckCircle2, count: 2 },
];

export default function Pipeline() {
    const [deals, setDeals] = useState(initialDeals);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewDealForm, setShowNewDealForm] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [currentView, setCurrentView] = useState('kanban');
    const [advancedFilters, setAdvancedFilters] = useState(null);
    const [newDeal, setNewDeal] = useState({
        company: '',
        contact: '',
        email: '',
        phone: '',
        value: '',
        priority: 'medium',
    });

    // Calculate pipeline metrics
    const calculateMetrics = () => {
        const allDeals = Object.values(deals).flat();
        const totalValue = allDeals.reduce((sum, deal) => sum + deal.value, 0);
        const totalDeals = allDeals.length;
        const wonDeals = deals.won.length;
        const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;
        const avgDealSize = totalDeals > 0 ? (totalValue / totalDeals).toFixed(0) : 0;

        return {
            totalValue,
            totalDeals,
            wonDeals,
            winRate,
            avgDealSize,
            stageValues: {
                leads: deals.leads.reduce((sum, d) => sum + d.value, 0),
                quotes: deals.quotes.reduce((sum, d) => sum + d.value, 0),
                negotiations: deals.negotiations.reduce((sum, d) => sum + d.value, 0),
                won: deals.won.reduce((sum, d) => sum + d.value, 0),
            }
        };
    };

    const metrics = calculateMetrics();

    // Mock analytics data
    const analyticsData = {
        stageMetrics: {
            leads: { count: deals.leads.length, value: metrics.stageValues.leads },
            quotes: { count: deals.quotes.length, value: metrics.stageValues.quotes },
            negotiations: { count: deals.negotiations.length, value: metrics.stageValues.negotiations },
            won: { count: deals.won.length, value: metrics.stageValues.won },
            lost: { count: 0, value: 0 },
        },
        totalValue: metrics.totalValue,
        totalDeals: metrics.totalDeals,
        wonDeals: metrics.wonDeals,
        winRate: parseFloat(metrics.winRate),
        avgDealSize: parseFloat(metrics.avgDealSize),
        avgDaysToClose: 15,
        conversionRates: {
            leadsToQuotes: deals.leads.length > 0 ? ((deals.quotes.length / deals.leads.length) * 100).toFixed(1) : '0',
            quotesToNegotiations: deals.quotes.length > 0 ? ((deals.negotiations.length / deals.quotes.length) * 100).toFixed(1) : '0',
            negotiationsToWon: deals.negotiations.length > 0 ? ((deals.won.length / deals.negotiations.length) * 100).toFixed(1) : '0',
        },
    };

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
            email: newDeal.email,
            phone: newDeal.phone,
            value: parseFloat(newDeal.value),
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
            email: '',
            phone: '',
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const headerActions = (
        <>
            <div className={styles.filterGroup}>
                <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                <div className={styles.selectWrapper}>
                    <Filter size={16} />
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
                </div>
                <div className={styles.searchWrapper}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search deals..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <AdvancedFilters
                    onApply={setAdvancedFilters}
                    onReset={() => setAdvancedFilters(null)}
                />
            </div>
            <Button variant="primary" size="md" onClick={() => setShowNewDealForm(true)}>
                <Plus size={18} />
                New Deal
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
                {/* Pipeline Metrics */}
                <div className={styles.metricsGrid}>
                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                            <DollarSign size={24} />
                        </div>
                        <div className={styles.metricContent}>
                            <p className={styles.metricLabel}>Total Pipeline Value</p>
                            <h3 className={styles.metricValue}>{formatCurrency(metrics.totalValue)}</h3>
                        </div>
                    </Card>

                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                            <Target size={24} />
                        </div>
                        <div className={styles.metricContent}>
                            <p className={styles.metricLabel}>Total Deals</p>
                            <h3 className={styles.metricValue}>{metrics.totalDeals}</h3>
                        </div>
                    </Card>

                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                            <Percent size={24} />
                        </div>
                        <div className={styles.metricContent}>
                            <p className={styles.metricLabel}>Win Rate</p>
                            <h3 className={styles.metricValue}>{metrics.winRate}%</h3>
                        </div>
                    </Card>

                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className={styles.metricContent}>
                            <p className={styles.metricLabel}>Avg Deal Size</p>
                            <h3 className={styles.metricValue}>{formatCurrency(metrics.avgDealSize)}</h3>
                        </div>
                    </Card>
                </div>

                {/* Pipeline Analytics */}
                <PipelineAnalytics analytics={analyticsData} />

                {/* New Deal Modal */}
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
                                    label="Email"
                                    type="email"
                                    placeholder="contact@company.com"
                                    value={newDeal.email}
                                    onChange={(e) => setNewDeal(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <Input
                                    label="Phone"
                                    placeholder="+20 123 456 7890"
                                    value={newDeal.phone}
                                    onChange={(e) => setNewDeal(prev => ({ ...prev, phone: e.target.value }))}
                                />
                                <Input
                                    label="Deal Value (EGP)"
                                    type="number"
                                    placeholder="100000"
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

                {/* Views */}
                {currentView === 'kanban' && (
                    <DragDropKanban
                        columns={columns}
                        deals={deals}
                        onDealMove={moveDeal}
                        onDealClick={setSelectedDeal}
                        filter={filter}
                        searchTerm={searchTerm}
                        formatCurrency={formatCurrency}
                        getPriorityVariant={getPriorityVariant}
                    />
                )}

                {currentView === 'list' && (
                    <ListView
                        deals={deals}
                        columns={columns}
                        onDealClick={setSelectedDeal}
                        getPriorityVariant={getPriorityVariant}
                        formatCurrency={formatCurrency}
                        filter={filter}
                        searchTerm={searchTerm}
                    />
                )}

                {currentView === 'table' && (
                    <TableView
                        deals={deals}
                        columns={columns}
                        onDealClick={setSelectedDeal}
                        getPriorityVariant={getPriorityVariant}
                        formatCurrency={formatCurrency}
                        filter={filter}
                        searchTerm={searchTerm}
                    />
                )}

                {/* Deal Details Modal */}
                {selectedDeal && (
                    <DealDetailsModal
                        deal={selectedDeal}
                        onClose={() => setSelectedDeal(null)}
                        onUpdate={(updatedDeal) => {
                            // Handle deal update
                            setSelectedDeal(null);
                        }}
                    />
                )}
            </div>
        </MainLayout>
    );
}
