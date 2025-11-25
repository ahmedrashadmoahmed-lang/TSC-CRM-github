'use client';

import { useState } from 'react';
import FormBuilder from '@/components/FormBuilder';
import Card from '@/components/Card';

export default function TestFormPage() {
    const [result, setResult] = useState(null);

    const formFields = [
        {
            name: 'name',
            label: 'الاسم',
            type: 'text',
            required: true,
            placeholder: 'أدخل الاسم',
        },
        {
            name: 'email',
            label: 'البريد الإلكتروني',
            type: 'email',
            required: true,
            placeholder: 'example@email.com',
        },
        {
            name: 'phone',
            label: 'رقم الهاتف',
            type: 'tel',
            required: false,
            placeholder: '05xxxxxxxx',
        },
        {
            name: 'department',
            label: 'القسم',
            type: 'select',
            required: true,
            options: [
                { value: 'sales', label: 'المبيعات' },
                { value: 'hr', label: 'الموارد البشرية' },
                { value: 'it', label: 'تقنية المعلومات' },
                { value: 'finance', label: 'المالية' },
            ],
        },
        {
            name: 'startDate',
            label: 'تاريخ البدء',
            type: 'date',
            required: true,
        },
        {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            required: false,
            placeholder: 'أضف ملاحظاتك هنا...',
            rows: 4,
        },
        {
            name: 'active',
            label: '',
            type: 'checkbox',
            checkboxLabel: 'نشط',
            required: false,
        },
    ];

    const handleSubmit = async (data) => {
        console.log('Form submitted:', data);
        setResult(data);
        alert('تم الإرسال بنجاح! ✅');
    };

    return (
        <div className="test-form-page">
            <div className="page-header">
                <h1>🧪 اختبار النموذج</h1>
                <p>صفحة لاختبار مكون FormBuilder</p>
            </div>

            <div className="form-container">
                <Card title="نموذج اختبار">
                    <FormBuilder
                        fields={formFields}
                        onSubmit={handleSubmit}
                        submitLabel="إرسال"
                        onCancel={() => alert('تم الإلغاء')}
                        cancelLabel="إلغاء"
                    />
                </Card>

                {result && (
                    <Card title="النتيجة">
                        <pre className="result-display">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </Card>
                )}
            </div>

            <style jsx>{`
        .test-form-page {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
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

        .form-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .result-display {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .test-form-page {
            padding: 1rem;
          }
        }
      `}</style>
        </div>
    );
}
