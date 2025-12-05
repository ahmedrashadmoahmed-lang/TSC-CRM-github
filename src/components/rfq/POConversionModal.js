'use client';

import { useState } from 'react';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';
import styles from './POConversionModal.module.css';

export default function POConversionModal({ rfq, isOpen, onClose, onConvert }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedQuoteId, setSelectedQuoteId] = useState(rfq.quotes?.[0]?.id || '');

    if (!isOpen) return null;

    const handleConvert = async () => {
        if (!selectedQuoteId) {
            setError('Please select a winning quote to convert');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/rfq/${rfq.id}/convert-to-po`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: rfq.quotes.find(q => q.id === selectedQuoteId)?.supplierId,
                    quoteId: selectedQuoteId
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to convert to PO');
            }

            if (onConvert) onConvert(result.data);
            onClose();
        } catch (err) {
            console.error('PO Conversion Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedQuote = rfq.quotes?.find(q => q.id === selectedQuoteId);

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <FileText size={24} className={styles.icon} />
                        <h2>Convert to Purchase Order</h2>
                    </div>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        This will create a new Purchase Order based on the selected quote for <strong>{rfq.title}</strong>.
                    </p>

                    {error && (
                        <div className={styles.error}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.section}>
                        <label className={styles.label}>Select Winning Quote</label>
                        <div className={styles.quoteList}>
                            {rfq.quotes?.map(quote => (
                                <div
                                    key={quote.id}
                                    className={`${styles.quoteItem} ${selectedQuoteId === quote.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedQuoteId(quote.id)}
                                >
                                    <div className={styles.quoteHeader}>
                                        <span className={styles.supplierName}>{quote.supplierName || 'Unknown Supplier'}</span>
                                        <span className={styles.price}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency || 'USD' }).format(quote.totalPrice)}
                                        </span>
                                    </div>
                                    <div className={styles.quoteDetails}>
                                        <span>Delivery: {new Date(quote.deliveryDate).toLocaleDateString()}</span>
                                        <span>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedQuote && (
                        <div className={styles.summary}>
                            <h3>PO Summary</h3>
                            <div className={styles.summaryRow}>
                                <span>Total Amount:</span>
                                <strong>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedQuote.currency || 'USD' }).format(selectedQuote.totalPrice)}
                                </strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Items:</span>
                                <span>{rfq.items?.length || 0} items</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.cancelButton} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        onClick={handleConvert}
                        className={styles.convertButton}
                        disabled={loading || !selectedQuoteId}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className={styles.spinner} />
                                Creating PO...
                            </>
                        ) : (
                            'Create Purchase Order'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
