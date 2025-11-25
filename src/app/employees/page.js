'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FormBuilder from '@/components/FormBuilder';
import ConfirmDialog from '@/components/ConfirmDialog';
import Badge from '@/components/Badge';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useFetch, useToast } from '@/hooks';

export default function EmployeesPage() {
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const { data: employees, loading, refetch } = useFetch('/api/employees');
    const toast = useToast();

    const columns = [
        { key: 'name', label: 'الاسم' },
        { key: 'email', label: 'البريد الإلكتروني' },
        { key: 'phone', label: 'الهاتف' },
        { key: 'position', label: 'المسمى الوظيفي' },
        { key: 'department', label: 'القسم' },
        {
            key: 'salary',
            label: 'الراتب',
            render: (row) => `${row.salary.toFixed(2)} ر.س`,
        },
        {
            key: 'status',
            label: 'الحالة',
            render: (row) => {
                const variants = {
                    active: 'success',
                    inactive: 'warning',
                    terminated: 'error',
                };
                const labels = {
                    active: 'نشط',
                    inactive: 'معطل',
                    terminated: 'منتهي',
                };
                return <Badge variant={variants[row.status]}>{labels[row.status]}</Badge>;
            },
        },
    ];

    const formFields = [
        { name: 'name', label: 'اسم الموظف', type: 'text', required: true },
        { name: 'email', label: 'البريد الإلكتروني', type: 'email' },
        { name: 'phone', label: 'الهاتف', type: 'text' },
        { name: 'position', label: 'المسمى الوظيفي', type: 'text', required: true },
        { name: 'department', label: 'القسم', type: 'text' },
        { name: 'salary', label: 'الراتب', type: 'number', required: true },
        { name: 'hireDate', label: 'تاريخ التعيين', type: 'date', required: true },
        {
            name: 'status',
            label: 'الحالة',
            type: 'select',
            options: [
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'معطل' },
                { value: 'terminated', label: 'منتهي' },
            ],
            required: true,
        },
        { name: 'nationalId', label: 'رقم الهوية', type: 'text' },
        { name: 'address', label: 'العنوان', type: 'textarea' },
    ];

    const handleSubmit = async (data) => {
        try {
            const url = editingEmployee
                ? `/api/employees/${editingEmployee.id}`
                : '/api/employees';
            const method = editingEmployee ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message || 'تم الحفظ بنجاح');
                setShowModal(false);
                setEditingEmployee(null);
                refetch();
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/employees/${deleteId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                toast.success('تم الحذف بنجاح');
                setDeleteId(null);
                refetch();
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    const actions = [
        {
            label: 'تعديل',
            onClick: (row) => {
                setEditingEmployee(row);
                setShowModal(true);
            },
        },
        {
            label: 'حذف',
            onClick: (row) => setDeleteId(row.id),
            variant: 'danger',
        },
    ];

    if (loading) {
        return <SkeletonLoader type="table" />;
    }

    return (
        <div className="employees-page">
            <div className="page-header">
                <div>
                    <h1>👔 الموظفين</h1>
                    <p>إدارة بيانات الموظفين</p>
                </div>
                <button onClick={() => setShowModal(true)} className="add-btn">
                    ➕ إضافة موظف
                </button>
            </div>

            <Card>
                <DataTable
                    data={employees?.data || []}
                    columns={columns}
                    actions={actions}
                    searchable
                    pagination
                />
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                }}
                title={editingEmployee ? 'تعديل موظف' : 'إضافة موظف'}
            >
                <FormBuilder
                    fields={formFields}
                    onSubmit={handleSubmit}
                    initialValues={editingEmployee}
                    submitLabel={editingEmployee ? 'حفظ التعديلات' : 'إضافة'}
                />
            </Modal>

            {deleteId && (
                <ConfirmDialog
                    title="تأكيد الحذف"
                    message="هل أنت متأكد من حذف هذا الموظف؟"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                    variant="danger"
                />
            )}

            <style jsx>{`
        .employees-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .page-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .add-btn {
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .employees-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .add-btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
