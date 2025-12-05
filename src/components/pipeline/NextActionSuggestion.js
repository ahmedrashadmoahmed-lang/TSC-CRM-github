// AI Next Action Component
// Shows AI-powered recommendations for next steps

import { useState, useEffect } from 'react';
import { Sparkles, Phone, Mail, Calendar, FileText, TrendingUp } from 'lucide-react';
import styles from './NextActionSuggestion.module.css';

export default function NextActionSuggestion({ dealId, deal, onActionClick }) {
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuggestion();
    }, [dealId]);

    const fetchSuggestion = async () => {
        try {
            // Use the predictive follow-up engine
            const response = await fetch(`/api/ai/next-action?dealId=${dealId}`);
            const result = await response.json();
            if (result.success) {
                setSuggestion(result.data);
            }
        } catch (error) {
            console.error('Error fetching suggestion:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Sparkles size={16} className={styles.sparkle} />
                <span>Analyzing...</span>
            </div>
        );
    }

    if (!suggestion) return null;

    const getActionIcon = (action) => {
        switch (action) {
            case 'call': return Phone;
            case 'email': return Mail;
            case 'meeting': return Calendar;
            case 'proposal': return FileText;
            default: return TrendingUp;
        }
    };

    const Icon = getActionIcon(suggestion.action);

    return (
        <div className={styles.suggestionCard}>
            <div className={styles.header}>
                <Sparkles size={14} className={styles.aiIcon} />
                <span className={styles.label}>AI Recommendation</span>
            </div>

            <div className={styles.suggestion}>
                <div className={styles.actionIcon}>
                    <Icon size={20} />
                </div>
                <div className={styles.content}>
                    <h4 className={styles.title}>{suggestion.title}</h4>
                    <p className={styles.description}>{suggestion.description}</p>
                    {suggestion.reasoning && (
                        <p className={styles.reasoning}>
                            <strong>Why:</strong> {suggestion.reasoning}
                        </p>
                    )}
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.confidence}>
                    <span className={styles.confidenceLabel}>Confidence:</span>
                    <div className={styles.confidenceBar}>
                        <div
                            className={styles.confidenceFill}
                            style={{ width: `${suggestion.confidence}%` }}
                        />
                    </div>
                    <span className={styles.confidenceValue}>{suggestion.confidence}%</span>
                </div>
                {onActionClick && (
                    <button
                        className={styles.actionButton}
                        onClick={() => onActionClick(suggestion)}
                    >
                        Take Action
                    </button>
                )}
            </div>
        </div>
    );
}
