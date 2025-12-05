'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './newPO.module.css';

export default function NewPOPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        supplierId: '',
        expectedDelivery: '',
        warehouseId: '',
        deliveryAddress: '',
        paymentTerms: 'credit_30',
        notes: '',
        items: [
            {
                productId: '',
                productName: '',
                description: '',
                quantity: 1,
                unitPrice: 0
            }
        ]
    });

    useEffect(() => {
        loadSuppliers();
        loadProducts();
    }, []);

    const loadSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            const data = await res.json();
            if (data.success) {
                setSuppliers(data.data);
            }
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    productId: '',
                    productName: '',
                    description: '',
                    quantity: 1,
                    unitPrice: 0
                }
            ]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // If product selected, auto-fill details
        if (field === 'productId' && value) {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].productName = product.name;
                newItems[index].unitPrice = product.price;
                newItems[index].description = product.description || '';
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.supplierId) {
            alert('يرجى اختيار المورد');
            return;
        }

        if (formData.items.length === 0 || !formData.items[0].productName) {
            alert('يرجى إضافة بند واحد على الأقل');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/po', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                alert('✅ تم إنشاء أمر الشراء بنجاح');
                router.push(`/po/${data.data.id}`);
            } else {
                alert('❌ فشل إنشاء أمر الشراء: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to create PO:', error);
            alert('❌ حدث خطأ أثناء إنشاء أمر الشراء');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>➕ أمر شراء جديد</h1>
                    <p>إنشاء أمر شراء جديد</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    ← إلغاء
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.grid}>
                    <Card title="معلومات المورد">
                        <div className={styles.form}>
                            <div className={styles.field}>
                                <label>المورد *</label>
                                <select
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">اختر المورد</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="تاريخ التسليم المتوقع"
                                type="date"
                                value={formData.expectedDelivery}
                                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                            />

                            <div className={styles.field}>
                                <label>شروط الدفع</label>
                                <select
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    className={styles.select}
                                >
                                    <option value="advance">دفع مقدم</option>
                                    <option value="cod">الدفع عند الاستلام</option>
                                    <option value="credit_30">30 يوم</option>
                                    <option value="credit_60">60 يوم</option>
                                    <option value="credit_90">90 يوم</option>
                                    <option value="installments">أقساط</option>
                                </select>
                            </div>

                            <Input
                                label="عنوان التسليم"
                                value={formData.deliveryAddress}
                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card title="ملخص الطلب">
                        <div className={styles.summary}>
                            <div className={styles.summaryItem}>
                                <span>عدد البنود:</span>
                                <span>{formData.items.length}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span>إجمالي الكمية:</span>
                                <span>{formData.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)}</span>
                            </div>
                            <div className={`${styles.summaryItem} ${styles.total}`}>
                                <span>المبلغ الإجمالي:</span>
                                <span>{calculateTotal().toLocaleString()} EGP</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="بنود الطلب">
                    <div className={styles.items}>
                        {formData.items.map((item, index) => (
                            <div key={index} className={styles.item}>
                                <div className={styles.itemNumber}>{index + 1}</div>

                                <div className={styles.itemFields}>
                                    <div className={styles.field}>
                                        <label>المنتج *</label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                            className={styles.select}
                                            required
                                        >
                                            <option value="">اختر المنتج</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - {product.price.toLocaleString()} EGP
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        label="الكمية *"
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        required
                                    />

                                    <Input
                                        label="سعر الوحدة *"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                        required
                                    />

                                    <div className={styles.itemTotal}>
                                        <span>الإجمالي:</span>
                                        <span>{(item.quantity * item.unitPrice).toLocaleString()} EGP</span>
                                    </div>
                                </div>

                                {formData.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className={styles.removeBtn}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={handleAddItem}>
                            ➕ إضافة بند
                        </Button>
                    </div>
                </Card>

                <Card title="ملاحظات">
                    <textarea
                        className={styles.textarea}
                        rows="4"
                        placeholder="ملاحظات إضافية (اختياري)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </Card>

                <div className={styles.actions}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'جاري الإنشاء...' : '✅ إنشاء أمر الشراء'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        إلغاء
                    </Button>
                </div>
            </form>
        </div>
    );
}
