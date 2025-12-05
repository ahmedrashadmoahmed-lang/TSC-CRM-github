'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import styles from './QualityInspection.module.css';

export default function QualityInspection({ poId, onSubmit }) {
    const [formData, setFormData] = useState({
        inspectionDate: new Date().toISOString().split('T')[0],
        location: '',
        overallScore: 0,
        passedItems: 0,
        failedItems: 0,
        partialItems: 0,
        defects: [],
        actionTaken: 'accept',
        notes: '',
        recommendations: ''
    });

    const [newDefect, setNewDefect] = useState({
        item: '',
        description: '',
        severity: 'minor',
        quantity: 1
    });

    const handleAddDefect = () => {
        if (!newDefect.item || !newDefect.description) {
            alert('يرجى ملء بيانات العيب');
            return;
        }

        setFormData({
            ...formData,
            defects: [...formData.defects, { ...newDefect, id: Date.now() }]
        });

        setNewDefect({
            item: '',
            description: '',
            severity: 'minor',
            quantity: 1
        });
    };

    const handleRemoveDefect = (id) => {
        setFormData({
            ...formData,
            defects: formData.defects.filter(d => d.id !== id)
        });
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch('/api/po/quality-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    poId,
                    ...formData,
                    defects: JSON.stringify(formData.defects),
                    defectCount: formData.defects.length
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ تم حفظ فحص الجودة');
                if (onSubmit) onSubmit(data.data);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('❌ فشل حفظ الفحص');
        }
    };

    const calculateStatus = () => {
        const total = formData.passedItems + formData.failedItems + formData.partialItems;
        if (total === 0) return 'pending';
        if (formData.failedItems === 0 && formData.partialItems === 0) return 'passed';
        if (formData.passedItems === 0) return 'failed';
        return 'partial';
    };

    const status = calculateStatus();

    return (
        <Card title="🔍 فحص الجودة">
            <div className={styles.form}>
                <div className={styles.section}>
                    <h3>معلومات الفحص</h3>
                    <div className={styles.grid}>
                        <Input
                            label="تاريخ الفحص"
                            type="date"
                            value={formData.inspectionDate}
                            onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                        />
                        <Input
                            label="الموقع"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="مكان الفحص"
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>النتائج</h3>
                    <div className={styles.grid}>
                        <Input
                            label="الدرجة الإجمالية (0-100)"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.overallScore}
                            onChange={(e) => setFormData({ ...formData, overallScore: parseInt(e.target.value) })}
                        />
                        <Input
                            label="بنود ناجحة ✅"
                            type="number"
                            min="0"
                            value={formData.passedItems}
                            onChange={(e) => setFormData({ ...formData, passedItems: parseInt(e.target.value) })}
                        />
                        <Input
                            label="بنود فاشلة ❌"
                            type="number"
                            min="0"
                            value={formData.failedItems}
                            onChange={(e) => setFormData({ ...formData, failedItems: parseInt(e.target.value) })}
                        />
                        <Input
                            label="بنود جزئية 🟡"
                            type="number"
                            min="0"
                            value={formData.partialItems}
                            onChange={(e) => setFormData({ ...formData, partialItems: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className={styles.statusPreview}>
                        <span>الحالة المتوقعة:</span>
                        <Badge variant={
                            status === 'passed' ? 'success' :
                                status === 'failed' ? 'error' :
                                    status === 'partial' ? 'warning' : 'default'
                        }>
                            {status === 'passed' ? 'نجح' :
                                status === 'failed' ? 'فشل' :
                                    status === 'partial' ? 'جزئي' : 'معلق'}
                        </Badge>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>العيوب المكتشفة</h3>

                    <div className={styles.defectForm}>
                        <Input
                            label="البند"
                            value={newDefect.item}
                            onChange={(e) => setNewDefect({ ...newDefect, item: e.target.value })}
                            placeholder="اسم البند"
                        />
                        <Input
                            label="وصف العيب"
                            value={newDefect.description}
                            onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
                            placeholder="وصف تفصيلي"
                        />
                        <div className={styles.field}>
                            <label>الخطورة</label>
                            <select
                                value={newDefect.severity}
                                onChange={(e) => setNewDefect({ ...newDefect, severity: e.target.value })}
                                className={styles.select}
                            >
                                <option value="minor">بسيط</option>
                                <option value="moderate">متوسط</option>
                                <option value="major">كبير</option>
                                <option value="critical">حرج</option>
                            </select>
                        </div>
                        <Input
                            label="الكمية"
                            type="number"
                            min="1"
                            value={newDefect.quantity}
                            onChange={(e) => setNewDefect({ ...newDefect, quantity: parseInt(e.target.value) })}
                        />
                        <Button onClick={handleAddDefect}>➕ إضافة عيب</Button>
                    </div>

                    {formData.defects.length > 0 && (
                        <div className={styles.defectsList}>
                            {formData.defects.map((defect) => (
                                <div key={defect.id} className={styles.defect}>
                                    <div className={styles.defectInfo}>
                                        <h4>{defect.item}</h4>
                                        <p>{defect.description}</p>
                                        <div className={styles.defectMeta}>
                                            <Badge variant={
                                                defect.severity === 'critical' ? 'error' :
                                                    defect.severity === 'major' ? 'warning' :
                                                        'default'
                                            } size="sm">
                                                {defect.severity}
                                            </Badge>
                                            <span>الكمية: {defect.quantity}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="error"
                                        size="sm"
                                        onClick={() => handleRemoveDefect(defect.id)}
                                    >
                                        🗑️
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h3>الإجراء المتخذ</h3>
                    <div className={styles.field}>
                        <select
                            value={formData.actionTaken}
                            onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                            className={styles.select}
                        >
                            <option value="accept">قبول كامل</option>
                            <option value="partial_accept">قبول جزئي</option>
                            <option value="reject">رفض</option>
                            <option value="rework">إعادة عمل</option>
                        </select>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>ملاحظات وتوصيات</h3>
                    <textarea
                        className={styles.textarea}
                        rows="3"
                        placeholder="ملاحظات الفحص"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <textarea
                        className={styles.textarea}
                        rows="3"
                        placeholder="التوصيات"
                        value={formData.recommendations}
                        onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    />
                </div>

                <div className={styles.actions}>
                    <Button variant="primary" onClick={handleSubmit}>
                        ✅ حفظ الفحص
                    </Button>
                </div>
            </div>
        </Card>
    );
}
