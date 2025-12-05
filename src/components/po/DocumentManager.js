'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './DocumentManager.module.css';

export default function DocumentManager({ poId, documents: initialDocs = [] }) {
    const [documents, setDocuments] = useState(initialDocs);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file, type, title) => {
        setUploading(true);
        try {
            // In real implementation, upload file to storage first
            // For now, we'll simulate with local data
            const formData = {
                poId,
                type,
                title: title || file.name,
                filename: file.name,
                filepath: `/uploads/po/${poId}/${file.name}`,
                filesize: file.size,
                mimeType: file.type,
                description: ''
            };

            const res = await fetch('/api/po/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                setDocuments([data.data, ...documents]);
                alert('✅ تم رفع المستند بنجاح');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('❌ فشل رفع المستند');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

        try {
            const res = await fetch(`/api/po/documents?id=${docId}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (data.success) {
                setDocuments(documents.filter(doc => doc.id !== docId));
                alert('✅ تم حذف المستند');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ فشل حذف المستند');
        }
    };

    const getDocumentIcon = (type) => {
        const icons = {
            contract: '📄',
            invoice: '🧾',
            specs: '📋',
            certificate: '🏆',
            quality_report: '✅',
            shipping_doc: '🚚'
        };
        return icons[type] || '📎';
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            contract: 'عقد',
            invoice: 'فاتورة',
            specs: 'مواصفات',
            certificate: 'شهادة',
            quality_report: 'تقرير جودة',
            shipping_doc: 'مستند شحن'
        };
        return labels[type] || type;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={styles.container}>
            <Card title="📁 إدارة المستندات">
                <div className={styles.uploadSection}>
                    <input
                        type="file"
                        id="fileUpload"
                        className={styles.fileInput}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const type = prompt('نوع المستند:\n1. عقد (contract)\n2. فاتورة (invoice)\n3. مواصفات (specs)\n4. شهادة (certificate)\n5. تقرير جودة (quality_report)\n6. مستند شحن (shipping_doc)');
                                const title = prompt('عنوان المستند (اختياري):');
                                handleUpload(file, type || 'contract', title);
                            }
                        }}
                        disabled={uploading}
                    />
                    <label htmlFor="fileUpload" className={styles.uploadBtn}>
                        <Button variant="primary" disabled={uploading}>
                            {uploading ? '⏳ جاري الرفع...' : '📤 رفع مستند'}
                        </Button>
                    </label>
                </div>

                {documents.length === 0 ? (
                    <div className={styles.empty}>
                        <p>لا توجد مستندات مرفقة</p>
                    </div>
                ) : (
                    <div className={styles.documentsList}>
                        {documents.map((doc) => (
                            <div key={doc.id} className={styles.document}>
                                <div className={styles.docIcon}>
                                    {getDocumentIcon(doc.type)}
                                </div>
                                <div className={styles.docInfo}>
                                    <h4>{doc.title}</h4>
                                    <div className={styles.docMeta}>
                                        <Badge variant="info" size="sm">
                                            {getDocumentTypeLabel(doc.type)}
                                        </Badge>
                                        <span>{doc.filename}</span>
                                        <span>{formatFileSize(doc.filesize)}</span>
                                        <span>{new Date(doc.createdAt).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    {doc.description && (
                                        <p className={styles.docDescription}>{doc.description}</p>
                                    )}
                                </div>
                                <div className={styles.docActions}>
                                    <Button variant="outline" size="sm">
                                        👁️ عرض
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        ⬇️ تحميل
                                    </Button>
                                    <Button
                                        variant="error"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        🗑️ حذف
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
