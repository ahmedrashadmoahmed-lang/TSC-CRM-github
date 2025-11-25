'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FormBuilder from '@/components/FormBuilder';
import ConfirmDialog from '@/components/ConfirmDialog';
import SkeletonLoader from '@/components/SkeletonLoader';
import Badge from '@/components/Badge';
import Dropdown from '@/components/Dropdown';
import { useFetch } from '@/hooks';
import toast from 'react-hot-toast';

export default function ProductsPage() {
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [saving, setSaving] = useState(false);

    const { data: products, loading, error, refetch } = useFetch('/api/products');

    const columns = [
        {
            key: 'sku',
            label: 'رمز المنتج',
            render: (value) => <strong>{value}</strong>,
        },
        {
            key: 'name',
            label: 'اسم المنتج',
        },
        {
            key: 'category',
            label: 'الفئة',
            render: (value) => value || '-',
        },
        {
            key: 'price',
            label: 'السعر',
            render: (value) => `${value.toLocaleString('ar-EG')} ج.م`,
        },
        {
            key: 'unit',
            label: 'الوحدة',
        },
        {
            key: 'status',
            label: 'الحالة',
            render: (value) => (
                <Badge variant={value === 'active' ? 'success' : 'error'} rounded>
                    {value === 'active' ? 'نشط' : 'معطل'}
                </Badge>
            ),
        },
    ];

    const fields = [
        {
            name: 'sku',
            type: 'text',
            label: 'رمز المنتج (SKU)',
            placeholder: 'مثال: PROD-001',
            required: true,
        },
        {
            name: 'name',
            type: 'text',
            label: 'اسم المنتج',
            placeholder: 'أدخل اسم المنتج',
            required: true,
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'الوصف',
            placeholder: 'وصف المنتج',
            rows: 3,
        },
        {
            name: 'category',
            type: 'text',
            label: 'الفئة',
            placeholder: 'مثال: إلكترونيات',
        },
        {
            name: 'price',
            type: 'number',
            label: 'السعر',
            placeholder: '0.00',
            required: true,
            step: '0.01',
        },
        {
            name: 'cost',
            type: 'number',
            label: 'التكلفة',
            placeholder: '0.00',
            step: '0.01',
        },
        {
            name: 'unit',
            type: 'select',
            label: 'الوحدة',
            required: true,
            options: [
                { value: 'قطعة', label: 'قطعة' },
                { value: 'كرتونة', label: 'كرتونة' },
                { value: 'كيلو', label: 'كيلو' },
                { value: 'متر', label: 'متر' },
                { value: 'لتر', label: 'لتر' },
            ],
        },
        {
            name: 'minStock',
            type: 'number',
            label: 'الحد الأدنى للمخزون',
            placeholder: '0',
        },
        {
            name: 'barcode',
            type: 'text',
            label: 'الباركود',
            placeholder: 'اختياري',
        },
        {
            name: 'status',
            type: 'select',
            label: 'الحالة',
            required: true,
            options: [
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'معطل' },
            ],
        },
    ];

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowForm(true);
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setShowConfirm(true);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            const url = selectedProduct
                ? `/api/products/${selectedProduct.id}`
                : '/api/products';

            const method = selectedProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message || 'تم الحفظ بنجاح');
                setShowForm(false);
                setSelectedProduct(null);
                refetch();
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(`/api/products/${selectedProduct.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                toast.success('تم الحذف بنجاح');
                setShowConfirm(false);
                setSelectedProduct(null);
                refetch();
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    if (loading) {
        return <SkeletonLoader type="table" count={1} />;
    }

    if (error) {
        return (
            <div className="error-container">
                <p>حدث خطأ أثناء تحميل البيانات</p>
                <button onClick={refetch}>إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>المنتجات</h1>
                    <p className="page-subtitle">إدارة المنتجات والأصناف</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedProduct(null);
                        setShowForm(true);
                    }}
                    className="btn-primary"
                >
                    + إضافة منتج جديد
                </button>
            </div>

            <DataTable
                columns={columns}
                data={products || []}
                searchable
                pagination
                pageSize={10}
                onRowClick={(row) => console.log('Row clicked:', row)}
                actions={(row) => (
                    <Dropdown
                        trigger={<button className="btn-icon">⋮</button>}
                        items={[
                            {
                                text: 'تعديل',
                                icon: '✏️',
                                onClick: () => handleEdit(row),
                            },
                            {
                                text: 'عرض التفاصيل',
                                icon: '👁️',
                                onClick: () => console.log('View:', row),
                            },
                            {
                                text: 'حركات المخزون',
                                icon: '📦',
                                onClick: () => console.log('Inventory:', row),
                            },
                            { divider: true },
                            {
                                text: 'حذف',
                                icon: '🗑️',
                                onClick: () => handleDelete(row),
                                danger: true,
                            },
                        ]}
                        align="right"
                    />
                )}
            />

            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelectedProduct(null);
                }}
                title={selectedProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                size="large"
            >
                <FormBuilder
                    fields={fields}
                    initialValues={selectedProduct || { status: 'active', unit: 'قطعة' }}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setSelectedProduct(null);
                    }}
                    loading={saving}
                />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setSelectedProduct(null);
                }}
                onConfirm={handleConfirmDelete}
                title="حذف المنتج"
                message={`هل أنت متأكد من حذف المنتج "${selectedProduct?.name}"؟`}
                variant="danger"
                confirmLabel="حذف"
            />

            <style jsx>{`
        .page-container {
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .btn-icon {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .btn-icon:hover {
          background: var(--bg-secondary);
        }

        .error-container {
          text-align: center;
          padding: 3rem;
        }

        .error-container button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
