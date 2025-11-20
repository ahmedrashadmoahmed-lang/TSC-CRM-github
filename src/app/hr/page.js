'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import styles from './hr.module.css';
import { employees, payrollRecords } from '@/data/realData';

export default function HRPayroll() {
    const [activeTab, setActiveTab] = useState('employees');
    const [selectedMonth, setSelectedMonth] = useState('all');

    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const filteredPayroll = selectedMonth === 'all'
        ? payrollRecords
        : payrollRecords.filter(record => record.month === selectedMonth);

    const employeeColumns = [
        { header: 'الكود', accessor: 'id' },
        { header: 'الاسم', accessor: 'name' },
        { header: 'الوظيفة', accessor: 'position' },
        {
            header: 'الراتب الأساسي',
            cell: (row) => `EGP ${row.baseSalary.toLocaleString()}`
        },
        {
            header: 'الحالة',
            cell: (row) => (
                <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">
                    {row.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
            )
        },
        { header: 'تاريخ التعيين', accessor: 'joinDate' },
        { header: 'إجراءات', cell: () => <Button variant="primary" size="sm">عرض</Button> }
    ];

    const payrollColumns = [
        { header: 'الموظف', accessor: 'employeeName' },
        { header: 'الشهر', accessor: 'month' },
        {
            header: 'الراتب الأساسي',
            cell: (row) => `EGP ${row.baseSalary.toLocaleString()}`
        },
        {
            header: 'الإضافات',
            cell: (row) => row.additions > 0 ? `+${row.additions.toLocaleString()}` : '-'
        },
        {
            header: 'الخصومات',
            cell: (row) => row.deductions > 0 ? `-${row.deductions.toLocaleString()}` : '-'
        },
        {
            header: 'الصافي',
            cell: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    EGP {row.netSalary.toLocaleString()}
                </span>
            )
        },
        {
            header: 'الحالة',
            cell: (row) => (
                <Badge variant={row.paid ? 'success' : 'warning'} size="sm">
                    {row.paid ? 'مدفوع' : 'معلق'}
                </Badge>
            )
        },
        { header: 'التوقيع', accessor: 'signature' }
    ];

    const totalPayroll = filteredPayroll.reduce((sum, record) => sum + record.netSalary, 0);
    const totalAdditions = filteredPayroll.reduce((sum, record) => sum + record.additions, 0);
    const totalDeductions = filteredPayroll.reduce((sum, record) => sum + record.deductions, 0);

    const headerActions = (
        <Button variant="primary" size="md">
            ➕ إضافة موظف
        </Button>
    );

    return (
        <MainLayout>
            <Header
                title="الموارد البشرية والرواتب"
                subtitle="إدارة الموظفين والرواتب الشهرية"
                actions={headerActions}
            />

            <div className={styles.container}>
                <div className={styles.statsGrid}>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>👥</span>
                            <div>
                                <h3 className={styles.statValue}>{employees.length}</h3>
                                <p className={styles.statLabel}>عدد الموظفين</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>💰</span>
                            <div>
                                <h3 className={styles.statValue}>
                                    EGP {(totalPayroll / 1000).toFixed(1)}K
                                </h3>
                                <p className={styles.statLabel}>إجمالي الرواتب</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>➕</span>
                            <div>
                                <h3 className={styles.statValue}>
                                    EGP {totalAdditions.toLocaleString()}
                                </h3>
                                <p className={styles.statLabel}>الإضافات</p>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>➖</span>
                            <div>
                                <h3 className={styles.statValue}>
                                    EGP {totalDeductions.toLocaleString()}
                                </h3>
                                <p className={styles.statLabel}>الخصومات</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'employees' ? styles.active : ''}`}
                        onClick={() => setActiveTab('employees')}
                    >
                        👥 الموظفين ({employees.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'payroll' ? styles.active : ''}`}
                        onClick={() => setActiveTab('payroll')}
                    >
                        💰 الرواتب ({payrollRecords.length})
                    </button>
                </div>

                {activeTab === 'payroll' && (
                    <div className={styles.filterSection}>
                        <label className={styles.filterLabel}>تصفية حسب الشهر:</label>
                        <select
                            className={styles.select}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="all">كل الشهور</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                )}

                {activeTab === 'employees' && <Table columns={employeeColumns} data={employees} />}
                {activeTab === 'payroll' && <Table columns={payrollColumns} data={filteredPayroll} />}
            </div>
        </MainLayout>
    );
}
