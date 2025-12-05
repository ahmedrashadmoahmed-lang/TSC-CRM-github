'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import styles from './vendor.module.css';

export default function VendorPortalPage() {
    const [orders, setOrders] = useState([]);
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        loadOrders();
    }, [filter]);

    const loadOrders = async () => {
        try {
            const url = filter === 'all'
                ? '/api/vendor/orders'
                : `/api/vendor/orders?status=${filter}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setOrders(data.data);
                setSupplier(data.supplier);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateShipment = async (shipmentId, status) => {
        const location = prompt('الموقع الحالي (اختياري):');
        const notes = prompt('ملاحظات (اختياري):');

        try {
            const res = await fetch('/api/vendor/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shipmentId,
                    status,
                    currentLocation: location,
                    notes
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ تم تحديث الشحنة');
                loadOrders();
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('❌ فشل التحديث');
        }
    };

    const handleUploadDocument = async (orderId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.jpg,.png';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const type = prompt('نوع المستند:\n1. invoice\n2. certificate\n3. shipping_doc\n4. quality_report');
            const title = prompt('عنوان المستند:') || file.name;

            try {
                const res = await fetch('/api/po/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        poId: orderId,
                        type: type || 'invoice',
                        title,
                        filename: file.name,
                        filepath: `/uploads/vendor/${orderId}/${file.name}`,
                        filesize: file.size,
                        mimeType: file.type,
                        accessLevel: 'supplier'
                    })
                });

                const data = await res.json();
                if (data.success) {
                    alert('✅ تم رفع المستند');
                    loadOrders();
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('❌ فشل رفع المستند');
            }
        };

        fileInput.click();
    };

    const getStatusBadge = (status) => {
        const variants = {
            draft: 'default',
            pending_approval: 'warning',
            approved: 'success',
            ordered: 'primary',
            shipped: 'info',
            delivered: 'success',
            closed: 'default'
        };
        const labels = {
            draft: 'مسودة',
            pending_approval: 'انتظار الموافقة',
            approved: 'مُعتمد',
            ordered: 'تم الطلب',
            shipped: 'تم الشحن',
            delivered: 'تم التسليم',
            closed: 'مغلق'
        };
        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    };

    const columns = [
        {
            key: 'poNumber',
            label: 'رقم الأمر',
            render: (row) => (
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setSelectedOrder(row);
                    }}
                    className={styles.orderLink}
                >
                    {row.poNumber}
                </a>
            )
        },
        {
            key: 'totalAmount',
            label: 'المبلغ',
            render: (row) => `${row.totalAmount.toLocaleString()} ${row.currency}`
        },
        {
            key: 'status',
            label: 'الحالة',
            render: (row) => getStatusBadge(row.status)
        },
        {
            key: 'expectedDelivery',
            label: 'التسليم المتوقع',
            render: (row) => row.expectedDelivery
                ? new Date(row.expectedDelivery).toLocaleDateString('ar-EG')
                : '-'
        },
        {
            key: 'items',
            label: 'البنود',
            render: (row) => row.items?.length || 0
        },
        {
            key: 'actions',
            label: 'الإجراءات',
            render: (row) => (
                <div className={styles.actions}>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUploadDocument(row.id)}
                    >
                        📤 رفع مستند
                    </Button>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>🏢 بوابة الموردين</h1>
                    <p>مرحباً {supplier?.name}</p>
                </div>
            </div>

            <div className={styles.stats}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>📦</div>
                    <div>
                        <h3>{orders.length}</h3>
                        <p>إجمالي الأوامر</p>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>⏳</div>
                    <div>
                        <h3>{orders.filter(o => o.status === 'ordered').length}</h3>
                        <p>قيد التنفيذ</p>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>🚚</div>
                    <div>
                        <h3>{orders.filter(o => o.status === 'shipped').length}</h3>
                        <p>تم الشحن</p>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <div>
                        <h3>{orders.filter(o => o.status === 'delivered').length}</h3>
                        <p>تم التسليم</p>
                    </div>
                </Card>
            </div>

            <div className={styles.filters}>
                <button
                    className={filter === 'all' ? styles.active : ''}
                    onClick={() => setFilter('all')}
                >
                    الكل
                </button>
                <button
                    className={filter === 'ordered' ? styles.active : ''}
                    onClick={() => setFilter('ordered')}
                >
                    قيد التنفيذ
                </button>
                <button
                    className={filter === 'shipped' ? styles.active : ''}
                    onClick={() => setFilter('shipped')}
                >
                    تم الشحن
                </button>
                <button
                    className={filter === 'delivered' ? styles.active : ''}
                    onClick={() => setFilter('delivered')}
                >
                    تم التسليم
                </button>
            </div>

            <Card>
                {orders.length === 0 ? (
                    <div className={styles.empty}>
                        <p>لا توجد أوامر</p>
                    </div>
                ) : (
                    <Table columns={columns} data={orders} />
                )}
            </Card>

            {selectedOrder && (
                <div className={styles.modal} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedOrder.poNumber}</h2>
                            <button onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <h3>الشحنات</h3>
                            {selectedOrder.shipments?.length === 0 ? (
                                <p>لا توجد شحنات</p>
                            ) : (
                                <div className={styles.shipments}>
                                    {selectedOrder.shipments?.map((shipment) => (
                                        <div key={shipment.id} className={styles.shipment}>
                                            <div>
                                                <h4>{shipment.shipmentNumber}</h4>
                                                <p>الحالة: {shipment.status}</p>
                                                {shipment.trackingNumber && (
                                                    <p>رقم التتبع: {shipment.trackingNumber}</p>
                                                )}
                                            </div>
                                            <div className={styles.shipmentActions}>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateShipment(shipment.id, 'in_transit')}
                                                >
                                                    🚚 قيد النقل
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateShipment(shipment.id, 'delivered')}
                                                >
                                                    ✅ تم التسليم
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
