'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './chart-of-accounts.module.css';

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const [accountsRes, treeRes] = await Promise.all([
                fetch('/api/accounting/accounts'),
                fetch('/api/accounting/accounts/tree'),
            ]);

            const accountsData = await accountsRes.json();
            const treeDataRes = await treeRes.json();

            if (accountsData.success) {
                setAccounts(accountsData.data);
            }
            if (treeDataRes.success) {
                setTreeData(treeDataRes.data);
                // Expand root nodes by default
                const rootIds = treeDataRes.data.map(node => node.id);
                setExpandedNodes(new Set(rootIds));
            }
        } catch (error) {
            console.error('Failed to load accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const getTypeColor = (type) => {
        const colors = {
            asset: '#3b82f6',
            liability: '#ef4444',
            equity: '#8b5cf6',
            revenue: '#10b981',
            expense: '#f59e0b',
        };
        return colors[type] || '#6b7280';
    };

    const getTypeLabel = (type) => {
        const labels = {
            asset: 'أصول',
            liability: 'خصوم',
            equity: 'حقوق ملكية',
            revenue: 'إيرادات',
            expense: 'مصروفات',
        };
        return labels[type] || type;
    };

    const renderTreeNode = (node, depth = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const indent = depth * 30;

        return (
            <div key={node.id} className={styles.treeNode}>
                <div
                    className={`${styles.nodeContent} ${selectedAccount?.id === node.id ? styles.selected : ''}`}
                    style={{ paddingRight: `${indent}px` }}
                    onClick={() => setSelectedAccount(node)}
                >
                    <div className={styles.nodeLeft}>
                        {hasChildren && (
                            <button
                                className={styles.expandButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                }}
                            >
                                {isExpanded ? '▼' : '◀'}
                            </button>
                        )}
                        {!hasChildren && <span className={styles.spacer}></span>}

                        <span
                            className={styles.typeIndicator}
                            style={{ backgroundColor: getTypeColor(node.type) }}
                        ></span>

                        <div className={styles.nodeInfo}>
                            <span className={styles.nodeCode}>{node.code}</span>
                            <span className={styles.nodeName}>{node.name}</span>
                        </div>
                    </div>

                    <div className={styles.nodeRight}>
                        <Badge
                            variant={node.type === 'asset' || node.type === 'revenue' ? 'success' : 'info'}
                            size="sm"
                        >
                            {getTypeLabel(node.type)}
                        </Badge>
                        {node.balance !== 0 && (
                            <span className={styles.balance}>
                                {node.balance.toLocaleString('ar-EG')} ج.م
                            </span>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className={styles.children}>
                        {node.children.map(child => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const filteredTree = filterType === 'all'
        ? treeData
        : treeData.filter(node => node.type === filterType);

    if (loading) {
        return (
            <MainLayout>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>جاري تحميل دليل الحسابات...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Header
                title="دليل الحسابات"
                subtitle="إدارة الحسابات المحاسبية"
            />

            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
                            onClick={() => setFilterType('all')}
                        >
                            الكل ({accounts.length})
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterType === 'asset' ? styles.active : ''}`}
                            onClick={() => setFilterType('asset')}
                        >
                            <span style={{ backgroundColor: getTypeColor('asset') }} className={styles.filterDot}></span>
                            الأصول
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterType === 'liability' ? styles.active : ''}`}
                            onClick={() => setFilterType('liability')}
                        >
                            <span style={{ backgroundColor: getTypeColor('liability') }} className={styles.filterDot}></span>
                            الخصوم
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterType === 'equity' ? styles.active : ''}`}
                            onClick={() => setFilterType('equity')}
                        >
                            <span style={{ backgroundColor: getTypeColor('equity') }} className={styles.filterDot}></span>
                            حقوق الملكية
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterType === 'revenue' ? styles.active : ''}`}
                            onClick={() => setFilterType('revenue')}
                        >
                            <span style={{ backgroundColor: getTypeColor('revenue') }} className={styles.filterDot}></span>
                            الإيرادات
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterType === 'expense' ? styles.active : ''}`}
                            onClick={() => setFilterType('expense')}
                        >
                            <span style={{ backgroundColor: getTypeColor('expense') }} className={styles.filterDot}></span>
                            المصروفات
                        </button>
                    </div>

                    <div className={styles.actions}>
                        <Button variant="outline" size="md">
                            📥 استيراد
                        </Button>
                        <Button variant="outline" size="md">
                            📤 تصدير
                        </Button>
                        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
                            ➕ حساب جديد
                        </Button>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.treePanel}>
                        <Card>
                            <div className={styles.treeContainer}>
                                {filteredTree.length > 0 ? (
                                    filteredTree.map(node => renderTreeNode(node))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <p>لا توجد حسابات في هذه الفئة</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {selectedAccount && (
                        <div className={styles.detailsPanel}>
                            <Card>
                                <div className={styles.accountDetails}>
                                    <div className={styles.detailsHeader}>
                                        <h3>تفاصيل الحساب</h3>
                                        <div className={styles.detailsActions}>
                                            <Button variant="outline" size="sm">✏️ تعديل</Button>
                                            <Button variant="outline" size="sm">🗑️ حذف</Button>
                                        </div>
                                    </div>

                                    <div className={styles.detailsBody}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>الكود:</span>
                                            <span className={styles.detailValue}>{selectedAccount.code}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>الاسم:</span>
                                            <span className={styles.detailValue}>{selectedAccount.name}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>النوع:</span>
                                            <Badge variant="info">{getTypeLabel(selectedAccount.type)}</Badge>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>المستوى:</span>
                                            <span className={styles.detailValue}>{selectedAccount.level}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>الرصيد:</span>
                                            <span className={styles.detailValue}>
                                                {selectedAccount.balance.toLocaleString('ar-EG')} ج.م
                                            </span>
                                        </div>
                                        {selectedAccount.parent && (
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>الحساب الأب:</span>
                                                <span className={styles.detailValue}>
                                                    {selectedAccount.parent.code} - {selectedAccount.parent.name}
                                                </span>
                                            </div>
                                        )}
                                        {selectedAccount.currency && (
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>العملة:</span>
                                                <span className={styles.detailValue}>
                                                    {selectedAccount.currency.name} ({selectedAccount.currency.symbol})
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
