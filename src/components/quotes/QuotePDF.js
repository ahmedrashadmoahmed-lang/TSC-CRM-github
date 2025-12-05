'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileDown } from 'lucide-react';

export default function QuotePDF({ quoteData, items }) {
    const pdfRef = useRef();

    const generatePDF = async () => {
        const element = pdfRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true
        });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Quote-${quoteData.quoteNumber || 'Draft'}.pdf`);
    };

    return (
        <>
            <button
                onClick={generatePDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
                <FileDown size={18} />
                تصدير PDF
            </button>

            {/* Hidden PDF Template */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={pdfRef} style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm',
                    background: 'white',
                    color: 'black',
                    fontFamily: 'Arial, sans-serif',
                    direction: 'rtl'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>عرض سعر</h1>
                            <p style={{ color: '#64748b', marginTop: '5px' }}>#{quoteData.quoteNumber || 'DRAFT'}</p>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>اسم الشركة</h2>
                            <p style={{ color: '#64748b', margin: '5px 0' }}>العنوان: القاهرة، مصر</p>
                            <p style={{ color: '#64748b', margin: 0 }}>هاتف: 01000000000</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>بيانات العميل</h3>
                            <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{quoteData.customerName || 'اسم العميل'}</p>
                            <p style={{ margin: 0 }}>{quoteData.customerEmail}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>تفاصيل العرض</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>تاريخ الإصدار:</span>
                                <span>{new Date().toLocaleDateString('ar-EG')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>صالح حتى:</span>
                                <span>{quoteData.validUntil ? new Date(quoteData.validUntil).toLocaleDateString('ar-EG') : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>الوصف</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>الكمية</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>السعر</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px' }}>{item.description}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.unitPrice.toFixed(2)}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '250px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                <span>المجموع الفرعي:</span>
                                <span>{quoteData.subtotal?.toFixed(2)} EGP</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                <span>الضريبة:</span>
                                <span>{quoteData.tax?.toFixed(2)} EGP</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 'bold', fontSize: '16px' }}>
                                <span>الإجمالي الكلي:</span>
                                <span>{quoteData.total?.toFixed(2)} EGP</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    {quoteData.terms && (
                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>الشروط والأحكام</h3>
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#334155' }}>{quoteData.terms}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
