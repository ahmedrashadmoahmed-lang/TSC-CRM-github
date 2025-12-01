'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import DateRangePicker from '@/components/DateRangePicker';
import Badge from '@/components/Badge';
import ExportButton from '@/components/ExportButton';
import styles from './audit-logs.module.css';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        dateRange: null,
        action: 'all',
        entity: 'all',
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
    });

    const loadAuditLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage,
                pageSize: pagination.pageSize,
                ...filters,
            });

            const response = await fetch(`/api/admin/audit-logs?${params}`);
            const data = await response.json();

            setLogs(data.logs || []);
            setPagination(prev => ({
                ...prev,
                total: data.total || 0,
                totalPages: data.totalPages || 0,
            }));
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.pageSize]);

    useEffect(() => {
        loadAuditLogs();
    }, [loadAuditLogs]);

    const columns = [
        {
            key: 'createdAt',
            label: 'Date/Time',
            render: (value) => new Date(value).toLocaleString(),
        },
        { key: 'userName', label: 'User' },
        { key: 'userEmail', label: 'Email' },
        {
            key: 'action',
            label: 'Action',
            render: (value) => (
                <Badge variant={getActionVariant(value)}>{value}</Badge>
            ),
        },
        { key: 'entity', label: 'Entity' },
        { key: 'entityId', label: 'Entity ID' },
        { key: 'ipAddress', label: 'IP Address' },
    ];

    const getActionVariant = (action) => {
        switch (action) {
            case 'CREATE':
                return 'success';
            case 'UPDATE':
                return 'info';
            case 'DELETE':
                return 'danger';
            case 'LOGIN':
                return 'primary';
            case 'LOGOUT':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const handleSearch = (query) => {
        setFilters(prev => ({ ...prev, search: query }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleDateRangeChange = (range) => {
        setFilters(prev => ({ ...prev, dateRange: range }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/audit-logs/export?${params}`);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString()}.csv`;
            a.click();
        } catch (error) {
            console.error('Failed to export audit logs:', error);
        }
    };

    return (
        <ProtectedRoute requiredRoles={['admin']}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1>Audit Logs</h1>
                        <p>View all system activity and user actions</p>
                    </div>
                    <ExportButton onExport={handleExport} />
                </div>

                <Card>
                    <div className={styles.filters}>
                        <SearchBar
                            placeholder="Search by user, action, or entity..."
                            onSearch={handleSearch}
                            debounce={500}
                        />

                        <DateRangePicker
                            onChange={handleDateRangeChange}
                            placeholder="Filter by date range"
                        />

                        <select
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="all">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                        </select>

                        <select
                            value={filters.entity}
                            onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="all">All Entities</option>
                            <option value="Invoice">Invoice</option>
                            <option value="Customer">Customer</option>
                            <option value="Supplier">Supplier</option>
                            <option value="Product">Product</option>
                            <option value="PurchaseOrder">Purchase Order</option>
                            <option value="Employee">Employee</option>
                            <option value="Payroll">Payroll</option>
                        </select>
                    </div>

                    <DataTable
                        columns={columns}
                        data={logs}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    />
                </Card>
            </div>
        </ProtectedRoute>
    );
}
