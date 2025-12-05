'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './SupplierPortal.module.css';

export default function SupplierRFQPortal() {
    const params = useParams();
    const router = useRouter();
    const rfqId = params.id;

    const [rfq, setRFQ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Quote form state
    const [quoteItems, setQuoteItems] = useState([]);
    const [quoteReference, setQuoteReference] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [validityPeriod, setValidityPeriod] = useState('30');
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState([]);

    // Supplier authentication (in production, use proper auth)
    const [supplierId, setSupplierId] = useState('');
    const [supplierName, setSupplierName] = useState('');

    useEffect(() => {
        fetchRFQDetails();
    }, [rfqId]);

    const fetchRFQDetails = async () => {
        try {
            setLoading(true);
            // In production, add supplier authentication token
            const response = await fetch(`/api/rfq?id=${rfqId}`);
            const data = await response.json();

            if (data.success) {
                setRFQ(data.data);
                initializeQuoteItems(data.data.items);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to load RFQ details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const initializeQuoteItems = (items) => {
        setQuoteItems(items.map(item => ({
            rfqItemId: item.id,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: '',
            total: 0,
            specifications: item.specifications || {},
            notes: ''
        })));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...quoteItems];
        updated[index][field] = value;

        // Calculate total
        if (field === 'unitPrice' || field === 'quantity') {
            const unitPrice = parseFloat(updated[index].unitPrice) || 0;
            const quantity = parseFloat(updated[index].quantity) || 0;
            updated[index].total = unitPrice * quantity;
        }

        setQuoteItems(updated);
    };

    const calculateTotalPrice = () => {
        return quoteItems.reduce((sum, item) => sum + (item.total || 0), 0);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments([...attachments, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const validateQuote = () => {
        if (!quoteReference) {
            alert('Please enter a quote reference number');
            return false;
        }

        if (!deliveryTime) {
            alert('Please enter delivery time');
            return false;
        }

        // Check if all items have prices
        const missingPrices = quoteItems.filter(item => !item.unitPrice || item.unitPrice <= 0);
        if (missingPrices.length > 0) {
            alert('Please enter unit prices for all items');
            return false;
        }

        if (!supplierId || !supplierName) {
            alert('Please enter your supplier information');
            return false;
        }

        return true;
    };

    const handleSubmitQuote = async () => {
        if (!validateQuote()) {
            return;
        }

        try {
            setSubmitting(true);

            const quoteData = {
                rfqId,
                supplierId, // In production, get from auth session
                quoteReference,
                items: quoteItems.map(item => ({
                    rfqItemId: item.rfqItemId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: parseFloat(item.unitPrice),
                    total: item.total,
                    specifications: item.specifications,
                    notes: item.notes
                })),
                totalPrice: calculateTotalPrice(),
                currency: rfq.currency || 'EGP',
                deliveryTime,
                paymentTerms,
                validityPeriod: parseInt(validityPeriod),
                notes,
                submittedAt: new Date()
            };

            // In production, handle file uploads separately
            // For now, just submit quote data
            const response = await fetch('/api/rfq/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quoteData)
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Quote submitted successfully! We will review and contact you soon.');
                router.push('/supplier/dashboard');
            } else {
                alert('❌ Failed to submit quote: ' + result.error);
            }

        } catch (err) {
            console.error('Error submitting quote:', err);
            alert('❌ Error submitting quote. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading RFQ details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>❌ Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!rfq) {
        return (
            <div className={styles.error}>
                <h2>❌ RFQ Not Found</h2>
                <p>The requested RFQ could not be found.</p>
            </div>
        );
    }

    const daysLeft = Math.ceil((new Date(rfq.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <div className={styles.portal}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1>📋 Request for Quotation</h1>
                        <span className={styles.rfqNumber}>{rfq.rfqNumber}</span>
                    </div>
                    <div className={styles.deadline}>
                        <span className={styles.deadlineLabel}>Deadline:</span>
                        <span className={`${styles.deadlineValue} ${daysLeft <= 3 ? styles.urgent : ''}`}>
                            {new Date(rfq.deadline).toLocaleDateString()} ({daysLeft} days left)
                        </span>
                    </div>
                </div>

                {/* RFQ Details */}
                <div className={styles.section}>
                    <h2>📝 RFQ Details</h2>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Title:</span>
                            <span className={styles.value}>{rfq.title}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Description:</span>
                            <span className={styles.value}>{rfq.description || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Priority:</span>
                            <span className={`${styles.badge} ${styles[rfq.priority]}`}>
                                {rfq.priority}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Currency:</span>
                            <span className={styles.value}>{rfq.currency || 'EGP'}</span>
                        </div>
                    </div>
                </div>

                {/* Supplier Information */}
                <div className={styles.section}>
                    <h2>🏢 Your Information</h2>
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Supplier ID / Email *</label>
                            <input
                                type="text"
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                placeholder="Enter your supplier ID or email"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Company Name *</label>
                            <input
                                type="text"
                                value={supplierName}
                                onChange={(e) => setSupplierName(e.target.value)}
                                placeholder="Enter your company name"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Items & Pricing */}
                <div className={styles.section}>
                    <h2>📦 Items & Your Quotation</h2>
                    <div className={styles.itemsTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Unit</th>
                                    <th>Unit Price *</th>
                                    <th>Total</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quoteItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <strong>{item.productName}</strong>
                                            {item.specifications && (
                                                <div className={styles.specs}>
                                                    {JSON.stringify(item.specifications)}
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unit}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </td>
                                        <td>
                                            <strong>{item.total.toFixed(2)}</strong>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                                placeholder="Optional notes"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'right' }}>
                                        <strong>Total Amount:</strong>
                                    </td>
                                    <td>
                                        <strong className={styles.totalPrice}>
                                            {calculateTotalPrice().toFixed(2)} {rfq.currency || 'EGP'}
                                        </strong>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Quote Details */}
                <div className={styles.section}>
                    <h2>📄 Quote Details</h2>
                    <div className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Quote Reference Number *</label>
                                <input
                                    type="text"
                                    value={quoteReference}
                                    onChange={(e) => setQuoteReference(e.target.value)}
                                    placeholder="Your internal quote reference"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Delivery Time *</label>
                                <input
                                    type="text"
                                    value={deliveryTime}
                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                    placeholder="e.g., 2 weeks, 30 days"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Payment Terms</label>
                                <input
                                    type="text"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                    placeholder="e.g., Net 30, 50% advance"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Quote Validity (Days)</label>
                                <input
                                    type="number"
                                    value={validityPeriod}
                                    onChange={(e) => setValidityPeriod(e.target.value)}
                                    placeholder="30"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Additional Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional information, terms, or conditions"
                                rows="4"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Attachments (Optional)</label>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            />
                            {attachments.length > 0 && (
                                <div className={styles.attachmentsList}>
                                    {attachments.map((file, index) => (
                                        <div key={index} className={styles.attachmentItem}>
                                            <span>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className={styles.actions}>
                    <button
                        className={styles.submitButton}
                        onClick={handleSubmitQuote}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : '✅ Submit Quote'}
                    </button>
                    <p className={styles.note}>
                        * Required fields. Please ensure all information is accurate before submitting.
                    </p>
                </div>
            </div>
        </div>
    );
}
