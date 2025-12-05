'use client';

import { useState } from 'react';
import styles from './LostReasonModal.module.css';

const CATEGORIES = [
    { value: 'Competitor', label: 'خسرنا لمنافس', icon: '🏆' },
    { value: 'Price', label: 'السعر مرتفع', icon: '💰' },
    { value: 'Timing', label: 'التوقيت غير مناسب', icon: '⏰' },
    { value: 'No Interest', label: 'لا يوجد اهتمام', icon: '❌' },
    { value: 'Budget', label: 'لا توجد ميزانية', icon: '💸' },
    { value: 'Other', label: 'أخرى', icon: '📝' }
];

export default function LostReasonModal({ opportunityId, opportunityTitle, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        category: '',
        subcategory: '',
        description: '',
        competitorName: '',
        competitorPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            setError('يرجى اختيار السبب');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/opportunities/${opportunityId}/lost-reason`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    competitorPrice: formData.competitorPrice ? parseFloat(formData.competitorPrice) : null,
                    tenantId: 'tenant_id_here', // TODO: Get from session
                    createdBy: 'user_id_here' // TODO: Get from session
                })
            });

            const result = await response.json();

            if (result.success) {
                onSubmit?.(result.data);
                onClose();
            } else {
                setError(result.error || 'حدث خطأ');
            }
        } catch (err) {
            console.error('Error submitting lost reason:', err);
            setError('حدث خطأ في حفظ البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>لماذا خسرنا هذه الصفقة؟</h2>
                    <p className={styles.subtitle}>{opportunityTitle}</p>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Category Selection */}
                    <div className={styles.field}>
                        <label className={styles.label}>السبب الرئيسي *</label>
                        <div className={styles.categoryGrid}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`${styles.categoryBtn} ${formData.category === cat.value ? styles.active : ''}`}
                                    onClick={() => handleChange('category', cat.value)}
                                >
                                    <span className={styles.categoryIcon}>{cat.icon}</span>
                                    <span className={styles.categoryLabel}>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Competitor Details */}
                    {formData.category === 'Competitor' && (
                        <>
                            <div className={styles.field}>
                                <label className={styles.label}>اسم المنافس</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.competitorName}
                                    onChange={(e) => handleChange('competitorName', e.target.value)}
                                    placeholder="مثال: شركة المنافس"
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>سعر المنافس</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.competitorPrice}
                                    onChange={(e) => handleChange('competitorPrice', e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                        </>
                    )}

                    {/* Subcategory */}
                    <div className={styles.field}>
                        <label className={styles.label}>تفاصيل إضافية</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.subcategory}
                            onChange={(e) => handleChange('subcategory', e.target.value)}
                            placeholder="مثال: السعر أعلى بـ 20%"
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label className={styles.label}>ملاحظات</label>
                        <textarea
                            className={styles.textarea}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="أضف أي ملاحظات إضافية..."
                            rows={4}
                        />
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !formData.category}
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
