'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './SupplierComparison.module.css';

export default function SupplierComparison({ suppliers = [], onSelect }) {
    const [sortBy, setSortBy] = useState('price');

    const sortedSuppliers = [...suppliers].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return a.totalPrice - b.totalPrice;
            case 'delivery':
                return a.deliveryDays - b.deliveryDays;
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });

    const getBestValue = () => {
        if (suppliers.length === 0) return null;
        return sortedSuppliers[0];
    };

    const bestValue = getBestValue();

    return (
        <Card title="🔍 مقارنة الموردين">
            <div className={styles.controls}>
                <div className={styles.sortButtons}>
                    <span>ترتيب حسب:</span>
                    <button
                        className={sortBy === 'price' ? styles.active : ''}
                        onClick={() => setSortBy('price')}
                    >
                        💰 السعر
                    </button>
                    <button
                        className={sortBy === 'delivery' ? styles.active : ''}
                        onClick={() => setSortBy('delivery')}
                    >
                        🚚 التسليم
                    </button>
                    <button
                        className={sortBy === 'rating' ? styles.active : ''}
                        onClick={() => setSortBy('rating')}
                    >
                        ⭐ التقييم
                    </button>
                </div>
            </div>

            {suppliers.length === 0 ? (
                <div className={styles.empty}>
                    <p>لا توجد عروض للمقارنة</p>
                </div>
            ) : (
                <div className={styles.comparison}>
                    {sortedSuppliers.map((supplier, index) => (
                        <div
                            key={supplier.id}
                            className={`${styles.supplierCard} ${supplier.id === bestValue?.id ? styles.bestValue : ''
                                }`}
                        >
                            {supplier.id === bestValue?.id && (
                                <div className={styles.bestBadge}>
                                    <Badge variant="success">🏆 الأفضل قيمة</Badge>
                                </div>
                            )}

                            <div className={styles.rank}>#{index + 1}</div>

                            <h3>{supplier.name}</h3>

                            <div className={styles.metrics}>
                                <div className={styles.metric}>
                                    <span className={styles.label}>السعر الإجمالي</span>
                                    <span className={styles.value}>
                                        {supplier.totalPrice?.toLocaleString()} EGP
                                    </span>
                                </div>

                                <div className={styles.metric}>
                                    <span className={styles.label}>سعر الوحدة</span>
                                    <span className={styles.value}>
                                        {supplier.unitPrice?.toLocaleString()} EGP
                                    </span>
                                </div>

                                <div className={styles.metric}>
                                    <span className={styles.label}>مدة التسليم</span>
                                    <span className={styles.value}>
                                        {supplier.deliveryDays} يوم
                                    </span>
                                </div>

                                <div className={styles.metric}>
                                    <span className={styles.label}>التقييم</span>
                                    <span className={styles.value}>
                                        ⭐ {supplier.rating}/5
                                    </span>
                                </div>

                                {supplier.landedCost && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>التكلفة الشاملة</span>
                                        <span className={styles.value}>
                                            {supplier.landedCost.toLocaleString()} EGP
                                        </span>
                                    </div>
                                )}

                                {supplier.paymentTerms && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>شروط الدفع</span>
                                        <span className={styles.value}>
                                            {supplier.paymentTerms}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {supplier.notes && (
                                <div className={styles.notes}>
                                    <p>{supplier.notes}</p>
                                </div>
                            )}

                            <div className={styles.advantages}>
                                {supplier.totalPrice === Math.min(...suppliers.map(s => s.totalPrice)) && (
                                    <Badge variant="success" size="sm">💰 أقل سعر</Badge>
                                )}
                                {supplier.deliveryDays === Math.min(...suppliers.map(s => s.deliveryDays)) && (
                                    <Badge variant="primary" size="sm">⚡ أسرع تسليم</Badge>
                                )}
                                {supplier.rating === Math.max(...suppliers.map(s => s.rating)) && (
                                    <Badge variant="warning" size="sm">⭐ أعلى تقييم</Badge>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant={supplier.id === bestValue?.id ? 'primary' : 'outline'}
                                    onClick={() => onSelect && onSelect(supplier)}
                                >
                                    {supplier.id === bestValue?.id ? '✅ اختيار الأفضل' : 'اختيار'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
