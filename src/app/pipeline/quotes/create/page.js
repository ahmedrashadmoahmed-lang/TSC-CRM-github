'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import QuoteBuilder from '@/components/quotes/QuoteBuilder';
import QuotePDF from '@/components/quotes/QuotePDF';
import { Save, ArrowLeft } from 'lucide-react';

export default function CreateQuotePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [opportunities, setOpportunities] = useState([]);

    const [formData, setFormData] = useState({
        customerId: '',
        opportunityId: '',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
        status: 'draft',
        terms: '1. الأسعار صالحة لمدة 7 أيام.\n2. الدفع 50% مقدم و 50% عند الاستلام.\n3. الأسعار غير شاملة ضريبة القيمة المضافة إلا إذا ذكر خلاف ذلك.',
        notes: ''
    });

    const [items, setItems] = useState([]);

    useEffect(() => {
        // Fetch Customers and Opportunities
        const fetchData = async () => {
            try {
                const [custRes, oppRes] = await Promise.all([
                    fetch('/api/customers'),
                    fetch('/api/opportunities')
                ]);

                if (custRes.ok) setCustomers(await custRes.json());
                if (oppRes.ok) setOpportunities(await oppRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const calculateTotals = () => {
        return items.reduce((acc, item) => {
            acc.subtotal += item.quantity * item.unitPrice;
            acc.tax += (item.quantity * item.unitPrice) * (item.tax / 100);
            acc.discount += (item.quantity * item.unitPrice) * (item.discount / 100);
            acc.total += item.total;
            return acc;
        }, { subtotal: 0, tax: 0, discount: 0, total: 0 });
    };

    const handleSubmit = async () => {
        if (!formData.customerId || !formData.opportunityId || items.length === 0) {
            alert('يرجى ملء جميع الحقول المطلوبة وإضافة بند واحد على الأقل');
            return;
        }

        setLoading(true);
        try {
            const totals = calculateTotals();
            const payload = {
                ...formData,
                ...totals,
                items
            };

            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('تم إنشاء عرض السعر بنجاح');
                router.push('/pipeline');
            } else {
                throw new Error('Failed to create quote');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء إنشاء عرض السعر');
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();
    const selectedCustomer = customers.find(c => c.id === formData.customerId);

    return (
        <MainLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">إنشاء عرض سعر جديد</h1>
                            <p className="text-slate-400">إعداد عرض سعر للعميل مع حساب التكلفة والربحية</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <QuotePDF
                            quoteData={{
                                ...formData,
                                ...totals,
                                customerName: selectedCustomer?.name,
                                customerEmail: selectedCustomer?.email
                            }}
                            items={items}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors"
                            style={{ backgroundColor: '#059669', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}
                        >
                            <Save size={18} />
                            {loading ? 'جاري الحفظ...' : 'حفظ العرض'}
                        </button>
                    </div>
                </div>

                {/* Main Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Customer & Opportunity Info */}
                    <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700" style={{ gridColumn: 'span 2', backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                        <h2 className="text-lg font-semibold mb-4 text-slate-200">بيانات العرض</h2>
                        <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">العميل</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.5rem', color: '#e2e8f0' }}
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                >
                                    <option value="">اختر العميل</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">الفرصة البيعية</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.5rem', color: '#e2e8f0' }}
                                    value={formData.opportunityId}
                                    onChange={(e) => setFormData({ ...formData, opportunityId: e.target.value })}
                                >
                                    <option value="">اختر الفرصة</option>
                                    {opportunities.map(op => (
                                        <option key={op.id} value={op.id}>{op.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">تاريخ الصلاحية</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.5rem', color: '#e2e8f0' }}
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">الحالة</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.5rem', color: '#e2e8f0' }}
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">مسودة (Draft)</option>
                                    <option value="sent">تم الإرسال (Sent)</option>
                                    <option value="accepted">مقبول (Accepted)</option>
                                    <option value="rejected">مرفوض (Rejected)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700" style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                        <h2 className="text-lg font-semibold mb-4 text-slate-200">ملخص العرض</h2>
                        <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="flex justify-between text-slate-400" style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                <span>المجموع الفرعي</span>
                                <span>{totals.subtotal.toFixed(2)} EGP</span>
                            </div>
                            <div className="flex justify-between text-slate-400" style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                <span>الضريبة</span>
                                <span>{totals.tax.toFixed(2)} EGP</span>
                            </div>
                            <div className="flex justify-between text-slate-400" style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                <span>الخصم</span>
                                <span>{totals.discount.toFixed(2)} EGP</span>
                            </div>
                            <div className="border-t border-slate-700 my-2" style={{ borderTop: '1px solid #334155', margin: '0.5rem 0' }}></div>
                            <div className="flex justify-between text-xl font-bold text-white" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                                <span>الإجمالي</span>
                                <span>{totals.total.toFixed(2)} EGP</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote Builder */}
                <div className="mb-6">
                    <QuoteBuilder items={items} onItemsChange={setItems} />
                </div>

                {/* Terms & Notes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700" style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                        <label className="block text-sm text-slate-400 mb-2">الشروط والأحكام</label>
                        <textarea
                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-200 h-32"
                            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.75rem', color: '#e2e8f0', height: '8rem' }}
                            value={formData.terms}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        />
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700" style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                        <label className="block text-sm text-slate-400 mb-2">ملاحظات داخلية</label>
                        <textarea
                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-200 h-32"
                            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.75rem', color: '#e2e8f0', height: '8rem' }}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="ملاحظات للفريق الداخلي فقط..."
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
