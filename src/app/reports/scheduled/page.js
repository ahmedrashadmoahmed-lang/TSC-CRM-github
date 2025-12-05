'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './scheduled.module.css';

export default function ScheduledReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const res = await fetch('/api/reports/scheduled');
            const data = await res.json();
            if (data.success) {
                setReports(data.data);
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleReport = async (id, enabled) => {
        try {
            await fetch('/api/reports/scheduled', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, enabled: !enabled })
            });
            loadReports();
        } catch (error) {
            console.error('Failed to toggle report:', error);
        }
    };

    const deleteReport = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;

        try {
            await fetch(`/api/reports/scheduled?id=${id}`, {
                method: 'DELETE'
            });
            loadReports();
        } catch (error) {
            console.error('Failed to delete report:', error);
        }
    };

    const sendNow = async (report) => {
        try {
            await fetch('/api/reports/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: report.id,
                    recipients: report.recipients,
                    subject: `تقرير: ${report.name}`,
                    message: 'تم إرسال التقرير يدوياً'
                })
            });
            alert('تم إرسال التقرير بنجاح');
        } catch (error) {
            console.error('Failed to send report:', error);
            alert('فشل إرسال التقرير');
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>📅 التقارير المجدولة</h1>
                    <p>إدارة التقارير التلقائية والمجدولة</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    ➕ تقرير جديد
                </Button>
            </div>

            <div className={styles.grid}>
                {reports.map(report => (
                    <Card key={report.id} hover>
                        <div className={styles.reportCard}>
                            <div className={styles.reportHeader}>
                                <div>
                                    <h3>{report.name}</h3>
                                    <div className={styles.meta}>
                                        <Badge variant={report.enabled ? 'success' : 'default'}>
                                            {report.enabled ? 'مفعل' : 'معطل'}
                                        </Badge>
                                        <span className={styles.frequency}>
                                            {getFrequencyLabel(report.frequency)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.reportDetails}>
                                <div className={styles.detail}>
                                    <span className={styles.label}>النوع:</span>
                                    <span>{getTypeLabel(report.type)}</span>
                                </div>
                                <div className={styles.detail}>
                                    <span className={styles.label}>التنسيق:</span>
                                    <span>{report.format.toUpperCase()}</span>
                                </div>
                                <div className={styles.detail}>
                                    <span className={styles.label}>المستلمون:</span>
                                    <span>{report.recipients.length} مستلم</span>
                                </div>
                                <div className={styles.detail}>
                                    <span className={styles.label}>التشغيل التالي:</span>
                                    <span>{new Date(report.nextRun).toLocaleDateString('ar-EG')}</span>
                                </div>
                                {report.lastRun && (
                                    <div className={styles.detail}>
                                        <span className={styles.label}>آخر تشغيل:</span>
                                        <span>{new Date(report.lastRun).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendNow(report)}
                                >
                                    📤 إرسال الآن
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleReport(report.id, report.enabled)}
                                >
                                    {report.enabled ? '⏸️ تعطيل' : '▶️ تفعيل'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteReport(report.id)}
                                >
                                    🗑️ حذف
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {reports.length === 0 && (
                <div className={styles.empty}>
                    <p>📭 لا توجد تقارير مجدولة</p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        إنشاء تقرير جديد
                    </Button>
                </div>
            )}
        </div>
    );
}

function getFrequencyLabel(frequency) {
    const labels = {
        daily: 'يومي',
        weekly: 'أسبوعي',
        monthly: 'شهري',
        quarterly: 'ربع سنوي'
    };
    return labels[frequency] || frequency;
}

function getTypeLabel(type) {
    const labels = {
        sales: 'المبيعات',
        invoices: 'الفواتير',
        inventory: 'المخزون',
        financial: 'مالي',
        custom: 'مخصص'
    };
    return labels[type] || type;
}
