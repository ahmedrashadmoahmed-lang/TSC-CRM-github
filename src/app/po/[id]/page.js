'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import POStepper from '@/components/po/POStepper';
import styles from './poDetails.module.css';

export default function PODetailsPage() {
    const params = useParams();
    const [po, setPO] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (params.id) {
            loadPO();
        }
    }, [params.id]);

    const loadPO = async () => {
        try {
            const res = await fetch(`/api/po/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setPO(data.data);
            }
        } catch (error) {
            console.error('Failed to load PO:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await fetch('/api/po/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    poId: params.id,
                    newStatus
                })
            });

            const data = await res.json();
            if (data.success) {
                setPO(data.data);
                alert('✅ تم تحديث الحالة بنجاح');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('❌ فشل تحديث الحالة');
        }
    };

    const handleApproval = async (status) => {
        try {
            const res = await fetch('/api/po/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    poId: params.id,
                    status,
                    comments: prompt('تعليقات (اختياري):')
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadPO();
            }
        } catch (error) {
            console.error('Failed to submit approval:', error);
            alert('❌ فشل إرسال الموافقة');
        }
    };

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    if (!po) {
        return <div className={styles.error}>أمر الشراء غير موجود</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>📦 {po.poNumber}</h1>
                    <p>تفاصيل أمر الشراء</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        ← رجوع
                    </Button>
                    <Button variant="primary">
                        📄 طباعة
                    </Button>
                </div>
            </div>

            <POStepper currentStatus={po.status} />

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    📋 التفاصيل
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'items' ? styles.active : ''}`}
                    onClick={() => setActiveTab('items')}
                >
                    📦 البنود ({po.items?.length || 0})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'shipments' ? styles.active : ''}`}
                    onClick={() => setActiveTab('shipments')}
                >
                    🚚 الشحنات ({po.shipments?.length || 0})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'approvals' ? styles.active : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    ✅ الموافقات ({po.approvals?.length || 0})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'quality' ? styles.active : ''}`}
                    onClick={() => setActiveTab('quality')}
                >
                    🔍 الجودة ({po.qualityChecks?.length || 0})
                </button>
            </div>

            {activeTab === 'details' && (
                <div className={styles.content}>
                    <div className={styles.grid}>
                        <Card title="معلومات أساسية">
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>المورد:</span>
                                    <span className={styles.value}>{po.supplier?.name}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>المبلغ الإجمالي:</span>
                                    <span className={styles.value}>{po.totalAmount.toLocaleString()} {po.currency}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>تاريخ الطلب:</span>
                                    <span className={styles.value}>{new Date(po.orderDate).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>التسليم المتوقع:</span>
                                    <span className={styles.value}>
                                        {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString('ar-EG') : '-'}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>شروط الدفع:</span>
                                    <span className={styles.value}>{po.paymentTerms || '-'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>حالة الدفع:</span>
                                    <span className={styles.value}>
                                        <Badge variant={po.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                            {po.paymentStatus === 'paid' ? 'مدفوع' : 'معلق'}
                                        </Badge>
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card title="الإجراءات">
                            <div className={styles.actions}>
                                {po.status === 'draft' && (
                                    <Button onClick={() => handleStatusChange('pending_approval')}>
                                        📤 إرسال للموافقة
                                    </Button>
                                )}
                                {po.status === 'pending_approval' && (
                                    <>
                                        <Button variant="success" onClick={() => handleApproval('approved')}>
                                            ✅ موافقة
                                        </Button>
                                        <Button variant="error" onClick={() => handleApproval('rejected')}>
                                            ❌ رفض
                                        </Button>
                                    </>
                                )}
                                {po.status === 'approved' && (
                                    <Button onClick={() => handleStatusChange('ordered')}>
                                        📦 تأكيد الطلب
                                    </Button>
                                )}
                                {po.status === 'delivered' && (
                                    <Button onClick={() => handleStatusChange('closed')}>
                                        🔒 إغلاق الأمر
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>

                    {po.notes && (
                        <Card title="ملاحظات">
                            <p className={styles.notes}>{po.notes}</p>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'items' && (
                <Card>
                    <div className={styles.itemsList}>
                        {po.items?.map((item, index) => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemNumber}>{index + 1}</div>
                                <div className={styles.itemDetails}>
                                    <h3>{item.productName}</h3>
                                    {item.description && <p>{item.description}</p>}
                                    <div className={styles.itemMeta}>
                                        <span>الكمية: {item.quantity}</span>
                                        <span>السعر: {item.unitPrice.toLocaleString()}</span>
                                        <span>الإجمالي: {item.totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.itemProgress}>
                                        <span>مستلم: {item.quantityReceived}</span>
                                        <span>معلق: {item.quantityPending}</span>
                                        {item.quantityRejected > 0 && (
                                            <span className={styles.rejected}>مرفوض: {item.quantityRejected}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === 'shipments' && (
                <Card>
                    {po.shipments?.length === 0 ? (
                        <div className={styles.empty}>لا توجد شحنات بعد</div>
                    ) : (
                        <div className={styles.shipmentsList}>
                            {po.shipments?.map((shipment) => (
                                <div key={shipment.id} className={styles.shipment}>
                                    <div className={styles.shipmentHeader}>
                                        <h3>{shipment.shipmentNumber}</h3>
                                        <Badge variant={shipment.status === 'delivered' ? 'success' : 'primary'}>
                                            {shipment.status}
                                        </Badge>
                                    </div>
                                    {shipment.trackingNumber && (
                                        <p>رقم التتبع: {shipment.trackingNumber}</p>
                                    )}
                                    {shipment.carrier && (
                                        <p>شركة الشحن: {shipment.carrier}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'approvals' && (
                <Card>
                    {po.approvals?.length === 0 ? (
                        <div className={styles.empty}>لا توجد موافقات بعد</div>
                    ) : (
                        <div className={styles.approvalsList}>
                            {po.approvals?.map((approval) => (
                                <div key={approval.id} className={styles.approval}>
                                    <div className={styles.approvalHeader}>
                                        <span>{approval.approverName}</span>
                                        <Badge variant={approval.status === 'approved' ? 'success' : 'error'}>
                                            {approval.status === 'approved' ? 'موافق' : 'مرفوض'}
                                        </Badge>
                                    </div>
                                    <p className={styles.approvalRole}>{approval.approverRole}</p>
                                    {approval.comments && (
                                        <p className={styles.approvalComments}>{approval.comments}</p>
                                    )}
                                    {approval.approvedAt && (
                                        <p className={styles.approvalDate}>
                                            {new Date(approval.approvedAt).toLocaleString('ar-EG')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'quality' && (
                <Card>
                    {po.qualityChecks?.length === 0 ? (
                        <div className={styles.empty}>لا توجد فحوصات جودة بعد</div>
                    ) : (
                        <div className={styles.qualityList}>
                            {po.qualityChecks?.map((check) => (
                                <div key={check.id} className={styles.qualityCheck}>
                                    <div className={styles.qualityHeader}>
                                        <h3>{check.inspectionNumber}</h3>
                                        <Badge variant={check.status === 'passed' ? 'success' : 'error'}>
                                            {check.status}
                                        </Badge>
                                    </div>
                                    <p>المفتش: {check.inspectorName}</p>
                                    {check.overallScore && (
                                        <p>الدرجة: {check.overallScore}/100</p>
                                    )}
                                    <div className={styles.qualityResults}>
                                        <span>✅ نجح: {check.passedItems}</span>
                                        <span>❌ فشل: {check.failedItems}</span>
                                        {check.partialItems > 0 && (
                                            <span>🟡 جزئي: {check.partialItems}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
