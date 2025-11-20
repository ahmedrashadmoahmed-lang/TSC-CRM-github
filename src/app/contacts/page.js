'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import styles from './contacts.module.css';
import { customers as realCustomers, salesPeople } from '@/data/realData';

export default function Contacts() {
    const [activeTab, setActiveTab] = useState('customers');
    const [customers, setCustomers] = useState(realCustomers);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        type: 'corporate',
        contact: '',
        email: '',
        phone: ''
    });

    const handleAddCustomer = (e) => {
        e.preventDefault();

        const customerToAdd = {
            id: `C-${Date.now()}`,
            name: newCustomer.name,
            type: newCustomer.type,
            contact: newCustomer.contact,
            email: newCustomer.email,
            phone: newCustomer.phone,
            totalInvoices: 0,
            totalValue: 0,
            status: 'active'
        };

        setCustomers(prev => [...prev, customerToAdd]);

        setNewCustomer({
            name: '',
            type: 'corporate',
            contact: '',
            email: '',
            phone: ''
        });
        setShowAddForm(false);
    };

    const customerColumns = [
        { header: 'الكود', accessor: 'id' },
        { header: 'اسم العميل', accessor: 'name' },
        {
            header: 'النوع',
            cell: (row) => (
                <Badge variant={row.type === 'corporate' ? 'primary' : 'info'} size="sm">
                    {row.type === 'corporate' ? 'شركة' : 'جمعية'}
                </Badge>
            )
        },
        { header: 'عدد الفواتير', accessor: 'totalInvoices' },
        {
            header: 'إجمالي القيمة',
            cell: (row) => `EGP ${row.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        },
        {
            header: 'الحالة',
            cell: (row) => (
                <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">
                    {row.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
            )
        },
        { header: 'إجراءات', cell: () => <Button variant="primary" size="sm">عرض</Button> },
    ];

    const salesColumns = [
        { header: 'الاسم', accessor: 'name' },
        {
            header: 'إجمالي المبيعات',
            cell: (row) => `EGP ${row.totalSales.toLocaleString('en-US')}`
        },
        { header: 'عدد الفواتير', accessor: 'invoiceCount' },
        {
            header: 'متوسط الفاتورة',
            cell: (row) => `EGP ${(row.totalSales / row.invoiceCount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        },
        {
            header: 'الأداء',
            cell: (row) => <Badge variant="success" size="sm">ممتاز</Badge>
        },
    ];

    const headerActions = (
        <Button variant="primary" size="md" onClick={() => setShowAddForm(true)}>
            ➕ إضافة عميل
        </Button>
    );

    return (
        <MainLayout>
            <Header
                title="العملاء ومندوبي المبيعات"
                subtitle="إدارة بيانات العملاء ومندوبي المبيعات"
                actions={headerActions}
            />

            <div className={styles.container}>
                {showAddForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>إضافة عميل جديد</h2>
                            <form onSubmit={handleAddCustomer} className={styles.form}>
                                <Input
                                    label="اسم العميل"
                                    placeholder="أدخل اسم العميل"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>النوع</label>
                                    <select
                                        className={styles.select}
                                        value={newCustomer.type}
                                        onChange={(e) => setNewCustomer(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="corporate">شركة</option>
                                        <option value="nonprofit">جمعية</option>
                                    </select>
                                </div>
                                <Input
                                    label="جهة الاتصال"
                                    placeholder="اسم المسؤول"
                                    value={newCustomer.contact}
                                    onChange={(e) => setNewCustomer(prev => ({ ...prev, contact: e.target.value }))}
                                />
                                <Input
                                    label="البريد الإلكتروني"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <Input
                                    label="رقم الهاتف"
                                    placeholder="+20 100 123 4567"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                                />
                                <div className={styles.modalActions}>
                                    <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                                        إلغاء
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        إضافة
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'customers' ? styles.active : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        👥 العملاء ({customers.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sales' ? styles.active : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        📊 مندوبي المبيعات ({salesPeople.length})
                    </button>
                </div>

                {activeTab === 'customers' && <Table columns={customerColumns} data={customers} />}
                {activeTab === 'sales' && <Table columns={salesColumns} data={salesPeople} />}
            </div>
        </MainLayout>
    );
}
