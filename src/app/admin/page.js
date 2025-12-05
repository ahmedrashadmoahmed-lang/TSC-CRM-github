'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './admin.module.css';

export default function AdminPanel() {
    const [stats, setStats] = useState(null);
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, backups, users

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, backupsRes] = await Promise.all([
                fetch('/api/admin/dashboard'),
                fetch('/api/backup')
            ]);

            const [statsData, backupsData] = await Promise.all([
                statsRes.json(),
                backupsRes.json()
            ]);

            if (statsData.success) setStats(statsData.data);
            if (backupsData.success) setBackups(backupsData.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        try {
            const res = await fetch('/api/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'full',
                    description: 'نسخة احتياطية يدوية'
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ تم إنشاء النسخة الاحتياطية بنجاح');
                loadData();
            }
        } catch (error) {
            console.error('Failed to create backup:', error);
            alert('❌ فشل إنشاء النسخة الاحتياطية');
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>⚙️ لوحة تحكم المدير</h1>
                    <p>إدارة شاملة للنظام</p>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 نظرة عامة
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'backups' ? styles.active : ''}`}
                    onClick={() => setActiveTab('backups')}
                >
                    💾 النسخ الاحتياطي
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 المستخدمون
                </button>
            </div>

            {activeTab === 'overview' && stats && (
                <>
                    {/* System Health */}
                    <div className={styles.healthGrid}>
                        <Card>
                            <div className={styles.healthCard}>
                                <span className={styles.healthLabel}>قاعدة البيانات</span>
                                <Badge variant="success">سليم</Badge>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.healthCard}>
                                <span className={styles.healthLabel}>API</span>
                                <Badge variant="success">سليم</Badge>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.healthCard}>
                                <span className={styles.healthLabel}>التخزين</span>
                                <Badge variant="success">سليم</Badge>
                            </div>
                        </Card>
                        <Card>
                            <div className={styles.healthCard}>
                                <span className={styles.healthLabel}>الأداء</span>
                                <Badge variant="success">ممتاز</Badge>
                            </div>
                        </Card>
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <Card title="إحصائيات النظام">
                            <div className={styles.statsList}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>إجمالي المستخدمين:</span>
                                    <span className={styles.statValue}>{stats.system.totalUsers}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>مستخدمون نشطون:</span>
                                    <span className={styles.statValue}>{stats.system.activeUsers}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>إجمالي السجلات:</span>
                                    <span className={styles.statValue}>{stats.system.totalRecords}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>التخزين المستخدم:</span>
                                    <span className={styles.statValue}>{stats.system.storageUsed}</span>
                                </div>
                            </div>
                        </Card>

                        <Card title="البيانات">
                            <div className={styles.statsList}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>العملاء:</span>
                                    <span className={styles.statValue}>{stats.data.customers}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>الفواتير:</span>
                                    <span className={styles.statValue}>{stats.data.invoices}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>المنتجات:</span>
                                    <span className={styles.statValue}>{stats.data.products}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>الموظفون:</span>
                                    <span className={styles.statValue}>{stats.data.employees}</span>
                                </div>
                            </div>
                        </Card>

                        <Card title="النشاط الأخير">
                            <div className={styles.activityList}>
                                {stats.activity.map((activity, idx) => (
                                    <div key={idx} className={styles.activityItem}>
                                        <span className={styles.activityUser}>{activity.user}</span>
                                        <span className={styles.activityAction}>{getActionLabel(activity.action)}</span>
                                        <span className={styles.activityTime}>
                                            {new Date(activity.time).toLocaleTimeString('ar-EG')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'backups' && (
                <div className={styles.backupsSection}>
                    <div className={styles.backupsHeader}>
                        <h2>النسخ الاحتياطية</h2>
                        <Button onClick={createBackup}>
                            ➕ إنشاء نسخة احتياطية
                        </Button>
                    </div>

                    <div className={styles.backupsGrid}>
                        {backups.map((backup) => (
                            <Card key={backup.id} hover>
                                <div className={styles.backupCard}>
                                    <div className={styles.backupHeader}>
                                        <h3>{backup.description}</h3>
                                        <Badge variant={backup.type === 'full' ? 'primary' : 'default'}>
                                            {backup.type === 'full' ? 'كامل' : 'تدريجي'}
                                        </Badge>
                                    </div>
                                    <div className={styles.backupDetails}>
                                        <div className={styles.detail}>
                                            <span>الحجم:</span>
                                            <span>{(backup.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <div className={styles.detail}>
                                            <span>السجلات:</span>
                                            <span>{backup.recordCount}</span>
                                        </div>
                                        <div className={styles.detail}>
                                            <span>التاريخ:</span>
                                            <span>{new Date(backup.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        <div className={styles.detail}>
                                            <span>بواسطة:</span>
                                            <span>{backup.createdBy}</span>
                                        </div>
                                    </div>
                                    <div className={styles.backupActions}>
                                        <Button size="sm" variant="outline">📥 استعادة</Button>
                                        <Button size="sm" variant="outline">📤 تحميل</Button>
                                        <Button size="sm" variant="outline">🗑️ حذف</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className={styles.usersSection}>
                    <h2>إدارة المستخدمين</h2>
                    <p>قريباً...</p>
                </div>
            )}
        </div>
    );
}

function getActionLabel(action) {
    const labels = {
        user_login: 'تسجيل دخول',
        invoice_created: 'إنشاء فاتورة',
        customer_updated: 'تحديث عميل'
    };
    return labels[action] || action;
}
