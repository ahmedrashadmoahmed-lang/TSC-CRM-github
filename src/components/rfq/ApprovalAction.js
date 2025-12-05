'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import styles from './ApprovalAction.module.css';

export default function ApprovalAction({ rfqId, onActionComplete }) {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const handleAction = async (action) => {
        if (action === 'reject' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        if (action === 'reject' && !comments.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/rfq/${rfqId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, comments }),
            });

            if (!response.ok) throw new Error('Action failed');

            if (onActionComplete) onActionComplete();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to process approval action');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Approval Required</h3>
            <p className={styles.description}>
                This RFQ requires internal approval before it can be sent to suppliers.
            </p>

            {showRejectInput && (
                <textarea
                    className={styles.commentInput}
                    placeholder="Reason for rejection..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                />
            )}

            <div className={styles.actions}>
                <button
                    onClick={() => handleAction('approve')}
                    disabled={loading || showRejectInput}
                    className={`${styles.button} ${styles.approve}`}
                >
                    {loading ? <Loader2 className={styles.spinner} /> : <CheckCircle size={18} />}
                    Approve RFQ
                </button>

                <button
                    onClick={() => handleAction('reject')}
                    disabled={loading}
                    className={`${styles.button} ${styles.reject}`}
                >
                    {loading ? <Loader2 className={styles.spinner} /> : <XCircle size={18} />}
                    {showRejectInput ? 'Confirm Rejection' : 'Reject'}
                </button>

                {showRejectInput && (
                    <button
                        onClick={() => setShowRejectInput(false)}
                        className={styles.cancelLink}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
