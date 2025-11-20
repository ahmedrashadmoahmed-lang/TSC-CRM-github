'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import styles from './invoicing.module.css';
import { invoices as realInvoices, customers, stats } from '@/data/realData';

export default function Invoicing() {
    const [invoices, setInvoices] = useState(realInvoices);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newInvoice, setNewInvoice] = useState({
        customerId: '',
        description: '',
        salesValue: '',
        vat: '',
        salesPerson: 'دعاء'
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const handleCreateInvoice = (e) => {
        e.preventDefault();

        const salesValue = parseFloat(newInvoice.salesValue);
        const vat = parseFloat(newInvoice.vat);
        const profitTax = salesValue * 0.01;
        const finalValue = salesValue + vat + profitTax;

        const customer = customers.find(c => c.id === newInvoice.customerId);

        const invoiceToAdd = {
            id: `INV-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            customerId: newInvoice.customerId,
            customerName: customer?.name || '',
            description: newInvoice.description,
            salesPerson: newInvoice.salesPerson,
            type: 'ضريبية',
            salesValue: salesValue,
            profitTax: profitTax,
            vat: vat,
            hasDiscount: false,
            discounts: 0,
            finalValue: finalValue,
            collected: 0,
            collectionDate: null,
            balance: finalValue,
            status: 'pending',
            notes: ''
        };

        setInvoices(prev => [invoiceToAdd, ...prev]);

        setNewInvoice({
            customerId: '',
            description: '',
            salesValue: '',
            vat: '',
            salesPerson: 'دعاء'
        });
        setShowCreateForm(false);
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        const matchesSearch = searchTerm === '' ||
            inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const columns = [
        { header: 'رقم الفاتورة', accessor: 'id' },
        { header: 'التاريخ', accessor: 'date' },
        { header: 'العميل', accessor: 'customerName' },
        { header: 'البيان', accessor: 'description' },
        {
            header: 'القيمة النهائية',
            cell: (row) => `EGP ${row.finalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        {
            header: 'المحصل',
            cell: (row) => `EGP ${row.collected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        {
            header: 'الرصيد',
            cell: (row) => (
                <span style={{ color: row.balance > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                    EGP {Math.abs(row.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            )
        },
        {
            header: 'الحالة',
            cell: (row) => (
                <Badge variant={getStatusVariant(row.status)} size="sm">
                    {row.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                </Badge>
            )
        },
        {
            header: 'إجراءات',
            cell: () => (
                <div className={styles.tableActions}>
                    <Button variant="outline" size="sm">عرض</Button>
                    <Button variant="primary" size="sm">تحصيل</Button>
                </div>
            )
        },
    ];

    const headerActions = (
        <>
            <div className={styles.filterGroup}>
                <select
                    className={styles.select}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">كل الفواتير</option>
                    <option value="paid">مدفوعة</option>
                    <option value="pending">معلقة</option>
                </select>
                <input
                    type="text"
                    placeholder="بحث..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="primary" size="md" onClick={() => setShowCreateForm(true)}>
                ➕ فاتورة جديدة
            </Button>
        </>
    );

    return (
        <MainLayout>
            <Header
                title="الفواتير والتحصيلات"
                subtitle="إدارة الفواتير والمدفوعات"
                actions={headerActions}
            />

            <div className={styles.container}>
                {showCreateForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>إنشاء فاتورة جديدة</h2>
                            <form onSubmit={handleCreateInvoice} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>العميل</label>
                                    <select
                                        className={styles.select}
                                        value={newInvoice.customerId}
                                        onChange={(e) => setNewInvoice(prev => ({ ...prev, customerId: e.target.value }))}
                                        required
                                    >
                                        <option value="">اختر العميل</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="البيان"
                                    placeholder="وصف المنتجات/الخدمات"
                                    value={newInvoice.description}
                                    onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="قيمة المبيعات"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newInvoice.salesValue}
                                    onChange={(e) => setNewInvoice(prev => ({ ...prev, salesValue: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="ض.ق.م (14%)"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newInvoice.vat}
                                    onChange={(e) => setNewInvoice(prev => ({ ...prev, vat: e.target.value }))}
                                    required
                                />
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>مندوب المبيعات</label>
                                    <select
                                        className={styles.select}
                                        value={newInvoice.salesPerson}
                                        onChange={(e) => setNewInvoice(prev => ({ ...prev, salesPerson: e.target.value }))}
                                    >
                                        <option value="منة">منة</option>
                                        <option value="هبة">هبة</option>
                                        <option value="دعاء">دعاء</option>
                                    </select>
                                </div>
                                <div className={styles.modalActions}>
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                                        إلغاء
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        إنشاء الفاتورة
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles.statsGrid}>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📊</span>
                            <div>
                                <h3 className={styles.statValue}>
                                    EGP {(stats.totalSales / 1000).toFixed(0)}K
                                </h3>
                                <p className={styles.statLabel}>إجمالي المبيعات</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>✅</span>
                            <div>
                                <h3 className={styles.statValue}>
                                    EGP {(stats.totalCollected / 1000).toFixed(0)}K
                                </h3>
                                <p className={styles.statLabel}>المحصل</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>⏳</span>
                            <div>
                                <h3 className={styles.statValue}>
                                    EGP {(stats.pendingAmount / 1000).toFixed(0)}K
                                </h3>
                                <p className={styles.statLabel}>المعلق</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📄</span>
                            <div>
                                <h3 className={styles.statValue}>{stats.totalInvoices}</h3>
                                <p className={styles.statLabel}>عدد الفواتير</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Table columns={columns} data={filteredInvoices} />
            </div>
        </MainLayout>
    );
}
