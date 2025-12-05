'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import styles from './QuoteBuilder.module.css';

export default function QuoteBuilder({ items, onItemsChange, currency = 'EGP' }) {
    const [rows, setRows] = useState(items || []);

    useEffect(() => {
        setRows(items);
    }, [items]);

    const addRow = () => {
        const newRow = {
            id: Date.now(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            cost: 0,
            tax: 0,
            discount: 0,
            total: 0
        };
        const updatedRows = [...rows, newRow];
        setRows(updatedRows);
        onItemsChange(updatedRows);
    };

    const removeRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
        onItemsChange(updatedRows);
    };

    const updateRow = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;

        // Recalculate total
        const qty = parseFloat(updatedRows[index].quantity) || 0;
        const price = parseFloat(updatedRows[index].unitPrice) || 0;
        const tax = parseFloat(updatedRows[index].tax) || 0;
        const discount = parseFloat(updatedRows[index].discount) || 0;

        const subtotal = qty * price;
        const taxAmount = subtotal * (tax / 100);
        const discountAmount = subtotal * (discount / 100);

        updatedRows[index].total = subtotal + taxAmount - discountAmount;

        setRows(updatedRows);
        onItemsChange(updatedRows);
    };

    const calculateMargin = (row) => {
        const price = parseFloat(row.unitPrice) || 0;
        const cost = parseFloat(row.cost) || 0;
        if (price === 0) return 0;
        return ((price - cost) / price) * 100;
    };

    const getMarginColor = (margin) => {
        if (margin < 10) return '#ef4444'; // Red
        if (margin < 20) return '#f59e0b'; // Yellow/Orange
        return '#22c55e'; // Green
    };

    const calculateTotalMargin = () => {
        let totalRevenue = 0;
        let totalCost = 0;

        rows.forEach(row => {
            const qty = parseFloat(row.quantity) || 0;
            const price = parseFloat(row.unitPrice) || 0;
            const cost = parseFloat(row.cost) || 0;

            totalRevenue += qty * price;
            totalCost += qty * cost;
        });

        if (totalRevenue === 0) return { margin: 0, profit: 0, revenue: 0, cost: 0 };

        const profit = totalRevenue - totalCost;
        const margin = (profit / totalRevenue) * 100;

        return { margin, profit, revenue: totalRevenue, cost: totalCost };
    };

    const totalMarginData = calculateTotalMargin();

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '30%' }}>الوصف</th>
                        <th style={{ width: '10%' }}>الكمية</th>
                        <th style={{ width: '15%' }}>سعر الوحدة</th>
                        <th style={{ width: '10%' }}>التكلفة</th>
                        <th style={{ width: '10%' }}>الضريبة %</th>
                        <th style={{ width: '10%' }}>الخصم %</th>
                        <th style={{ width: '10%' }}>الإجمالي</th>
                        <th style={{ width: '5%' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.id}>
                            <td>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={row.description}
                                    onChange={(e) => updateRow(index, 'description', e.target.value)}
                                    placeholder="اسم المنتج أو الخدمة"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={row.quantity}
                                    onChange={(e) => updateRow(index, 'quantity', parseFloat(e.target.value))}
                                    min="1"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={row.unitPrice}
                                    onChange={(e) => updateRow(index, 'unitPrice', parseFloat(e.target.value))}
                                />
                                <div className={styles.marginIndicator} style={{
                                    color: getMarginColor(calculateMargin(row))
                                }}>
                                    Margin: {calculateMargin(row).toFixed(1)}%
                                </div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={row.cost}
                                    onChange={(e) => updateRow(index, 'cost', parseFloat(e.target.value))}
                                    placeholder="0.00"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={row.tax}
                                    onChange={(e) => updateRow(index, 'tax', parseFloat(e.target.value))}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={row.discount}
                                    onChange={(e) => updateRow(index, 'discount', parseFloat(e.target.value))}
                                />
                            </td>
                            <td>
                                <div className={styles.total}>
                                    {row.total.toFixed(2)} {currency}
                                </div>
                            </td>
                            <td>
                                <button
                                    onClick={() => removeRow(index)}
                                    className={styles.deleteButton}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {rows.length > 0 && (
                <div className={styles.profitSummary}>
                    <div className={styles.summaryTitle}>
                        <Calculator size={18} />
                        <span>ملخص الربحية</span>
                    </div>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>إجمالي الإيرادات</span>
                            <span className={styles.summaryValue} style={{ color: '#3b82f6' }}>
                                {totalMarginData.revenue.toFixed(2)} {currency}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>إجمالي التكلفة</span>
                            <span className={styles.summaryValue} style={{ color: '#64748b' }}>
                                {totalMarginData.cost.toFixed(2)} {currency}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>الربح المتوقع</span>
                            <span className={styles.summaryValue} style={{ color: '#10b981' }}>
                                {totalMarginData.profit.toFixed(2)} {currency}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>هامش الربح</span>
                            <span className={styles.summaryValue} style={{
                                color: getMarginColor(totalMarginData.margin),
                                fontSize: '1.25rem',
                                fontWeight: '700'
                            }}>
                                {totalMarginData.margin.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={addRow} className={styles.addButton}>
                <Plus size={18} /> إضافة بند جديد
            </button>
        </div>
    );
}
