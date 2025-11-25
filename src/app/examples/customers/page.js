'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FormBuilder from '@/components/FormBuilder';
import ConfirmDialog from '@/components/ConfirmDialog';
import SkeletonLoader from '@/components/SkeletonLoader';
import Badge from '@/components/Badge';
import Dropdown from '@/components/Dropdown';
import { useFetch } from '@/hooks';
import { customerSchema } from '@/lib/validation';
import toast from 'react-hot-toast';

export default function CustomersExample() {
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [saving, setSaving] = useState(false);

    const { data: customers, loading, error, refetch } = useFetch('/api/customers');

    const columns = [
        {
            key: 'name',
            label: 'اسم العميل',
            render: (value) => <strong>{value}</strong>,
        },
        {
            key: 'email',
            label: 'البريد الإلكتروني',
        },
        {
            key: 'phone',
            label: 'الهاتف',
        },
        {
            key: 'type',
            label: 'النوع',
            render: (value) => (
                <Badge variant={value === 'individual' ? 'primary' : 'success'}>
                    {value === 'individual' ? 'فرد' : 'شركة'}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'الحالة',
            render: (value) => (
                <Badge variant={value === 'active' ? 'success' : 'error'} rounded>
                    {value === 'active' ? 'نشط' : 'معلق'}
                </Badge>
            ),
        },
    ];

    const fields = [
        {
            name: 'name',
            type: 'text',
            label: 'اسم العميل',
            placeholder: 'أدخل اسم العميل',
            required: true,
        },
        {
            name: 'email',
            type: 'email',
            label: 'البريد الإلكتروني',
            placeholder: 'example@email.com',
        },
        {
            name: 'phone',
            type: 'tel',
            label: 'رقم الهاتف',
            placeholder: '01xxxxxxxxx',
        },
        {
            name: 'type',
            type: 'select',
            label: 'نوع العميل',
            required: true,
            options: [
                { value: 'individual', label: 'فرد' },
                { value: 'company', label: 'شركة' },
            ],
        },
        {
            name: 'address',
            type: 'textarea',
            label: 'العنوان',
            placeholder: 'أدخل العنوان الكامل',
            rows: 3,
        },
    ];

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setShowForm(true);
    };

    const handleDelete = (customer) => {
        setSelectedCustomer(customer);
        setShowConfirm(true);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            const url = selectedCustomer
                ? `/api/customers/${selectedCustomer.id}`
                : '/api/customers';

            const method = selectedCustomer ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message || 'تم الحفظ بنجاح');
                setShowForm(false);
                setSelectedCustomer(null);
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
            const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                toast.success('تم الحذف بنجاح');
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
                <h1>العملاء</h1>
                <button
                    onClick={() => {
                        setSelectedCustomer(null);
                        setShowForm(true);
                    }}
                    className="btn-primary"
                >
                    + إضافة عميل جديد
                </button>
            </div>

            <DataTable
                columns={columns}
                data={customers || []}
                searchable
                pagination
                pageSize={10}
                onRowClick={(row) => console.log('Row clicked:', row)}
                actions={(row) => (
                    <Dropdown
                        trigger={
                            <button className="btn-icon">⋮</button>
                        }
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
                    setSelectedCustomer(null);
                }}
                title={selectedCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
                size="medium"
            >
                <FormBuilder
                    fields={fields}
                    schema={customerSchema}
                    initialValues={selectedCustomer || {}}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setSelectedCustomer(null);
                    }}
                    loading={saving}
                />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setSelectedCustomer(null);
                }}
                onConfirm={handleConfirmDelete}
                title="حذف العميل"
                message={`هل أنت متأكد من حذف العميل "${selectedCustomer?.name}"؟`}
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
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
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
      `}</style>
        </div>
    );
}
