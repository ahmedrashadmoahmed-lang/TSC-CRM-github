'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './automation.module.css';

export default function AutomationPage() {
    const [workflows, setWorkflows] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('workflows'); // workflows, templates

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [workflowsRes, templatesRes] = await Promise.all([
                fetch('/api/automation/workflows'),
                fetch('/api/automation/email/templates')
            ]);

            const [workflowsData, templatesData] = await Promise.all([
                workflowsRes.json(),
                templatesRes.json()
            ]);

            if (workflowsData.success) setWorkflows(workflowsData.data);
            if (templatesData.success) setTemplates(templatesData.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkflow = async (id, enabled) => {
        try {
            await fetch('/api/automation/workflows', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, enabled: !enabled })
            });
            loadData();
        } catch (error) {
            console.error('Failed to toggle workflow:', error);
        }
    };

    const executeWorkflow = async (id) => {
        try {
            await fetch(`/api/automation/workflows?id=${id}`, {
                method: 'PUT'
            });
            alert('تم تنفيذ سير العمل بنجاح');
            loadData();
        } catch (error) {
            console.error('Failed to execute workflow:', error);
            alert('فشل تنفيذ سير العمل');
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>⚙️ الأتمتة</h1>
                    <p>إدارة سير العمل والقوالب التلقائية</p>
                </div>
                <Button>➕ إضافة جديد</Button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'workflows' ? styles.active : ''}`}
                    onClick={() => setActiveTab('workflows')}
                >
                    🔄 سير العمل ({workflows.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
                    onClick={() => setActiveTab('templates')}
                >
                    📧 قوالب البريد ({templates.length})
                </button>
            </div>

            {activeTab === 'workflows' && (
                <div className={styles.grid}>
                    {workflows.map(workflow => (
                        <Card key={workflow.id} hover>
                            <div className={styles.workflowCard}>
                                <div className={styles.workflowHeader}>
                                    <div>
                                        <h3>{workflow.name}</h3>
                                        <p className={styles.description}>{workflow.description}</p>
                                    </div>
                                    <Badge variant={workflow.enabled ? 'success' : 'default'}>
                                        {workflow.enabled ? 'مفعل' : 'معطل'}
                                    </Badge>
                                </div>

                                <div className={styles.workflowDetails}>
                                    <div className={styles.detail}>
                                        <span className={styles.label}>المشغل:</span>
                                        <span>{getTriggerLabel(workflow.trigger.type)}</span>
                                    </div>
                                    <div className={styles.detail}>
                                        <span className={styles.label}>الإجراءات:</span>
                                        <span>{workflow.actions.length} إجراء</span>
                                    </div>
                                    <div className={styles.detail}>
                                        <span className={styles.label}>التنفيذات:</span>
                                        <span>{workflow.executionCount}</span>
                                    </div>
                                    {workflow.lastRun && (
                                        <div className={styles.detail}>
                                            <span className={styles.label}>آخر تشغيل:</span>
                                            <span>{new Date(workflow.lastRun).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => executeWorkflow(workflow.id)}
                                    >
                                        ▶️ تشغيل
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleWorkflow(workflow.id, workflow.enabled)}
                                    >
                                        {workflow.enabled ? '⏸️ تعطيل' : '▶️ تفعيل'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {activeTab === 'templates' && (
                <div className={styles.grid}>
                    {templates.map(template => (
                        <Card key={template.id} hover>
                            <div className={styles.templateCard}>
                                <div className={styles.templateHeader}>
                                    <h3>{template.name}</h3>
                                    <Badge>{template.category}</Badge>
                                </div>

                                <div className={styles.templateDetails}>
                                    <div className={styles.detail}>
                                        <span className={styles.label}>الموضوع:</span>
                                        <span>{template.subject}</span>
                                    </div>
                                    <div className={styles.detail}>
                                        <span className={styles.label}>المتغيرات:</span>
                                        <span>{template.variables.length} متغير</span>
                                    </div>
                                </div>

                                <div className={styles.variables}>
                                    {template.variables.slice(0, 3).map((v, idx) => (
                                        <span key={idx} className={styles.variable}>
                                            {`{{${v}}}`}
                                        </span>
                                    ))}
                                    {template.variables.length > 3 && (
                                        <span className={styles.more}>+{template.variables.length - 3}</span>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    <Button size="sm" variant="outline">
                                        ✏️ تعديل
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        👁️ معاينة
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function getTriggerLabel(type) {
    const labels = {
        invoice_overdue: 'فاتورة متأخرة',
        low_stock: 'مخزون منخفض',
        payment_received: 'استلام دفعة',
        customer_inactive: 'عميل غير نشط',
        scheduled: 'مجدول'
    };
    return labels[type] || type;
}
