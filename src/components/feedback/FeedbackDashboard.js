// Feedback Dashboard Component
// NPS and customer feedback tracking

import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import styles from './FeedbackDashboard.module.css';

export default function FeedbackDashboard({ tenantId }) {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, [tenantId]);

    const fetchFeedback = async () => {
        try {
            const response = await fetch(`/api/communication?action=get_feedback&tenantId=${tenantId}`);
            const result = await response.json();
            if (result.success) {
                setFeedback(result.data);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!feedback) return null;

    const npsScore = feedback.npsScore || 0;
    const getNPSColor = (score) => {
        if (score >= 50) return '#10b981';
        if (score >= 0) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <MessageCircle size={20} />
                <h3>Customer Feedback</h3>
            </div>

            <div className={styles.npsSection}>
                <div className={styles.npsScore} style={{ borderColor: getNPSColor(npsScore) }}>
                    <span className={styles.score} style={{ color: getNPSColor(npsScore) }}>
                        {npsScore}
                    </span>
                    <span className={styles.label}>NPS Score</span>
                </div>

                <div className={styles.breakdown}>
                    <div className={styles.category}>
                        <ThumbsUp size={16} className={styles.promoter} />
                        <span>Promoters</span>
                        <span className={styles.value}>{feedback.promoters || 0}%</span>
                    </div>
                    <div className={styles.category}>
                        <MessageCircle size={16} className={styles.passive} />
                        <span>Passives</span>
                        <span className={styles.value}>{feedback.passives || 0}%</span>
                    </div>
                    <div className={styles.category}>
                        <ThumbsDown size={16} className={styles.detractor} />
                        <span>Detractors</span>
                        <span className={styles.value}>{feedback.detractors || 0}%</span>
                    </div>
                </div>
            </div>

            <div className={styles.sentiment}>
                <h4>Sentiment Analysis</h4>
                <div className={styles.sentimentBars}>
                    <div className={styles.sentimentBar}>
                        <span>Positive</span>
                        <div className={styles.bar}>
                            <div
                                className={styles.fill}
                                style={{
                                    width: `${feedback.sentiment?.positive || 0}%`,
                                    background: '#10b981'
                                }}
                            />
                        </div>
                        <span>{feedback.sentiment?.positive || 0}%</span>
                    </div>
                    <div className={styles.sentimentBar}>
                        <span>Neutral</span>
                        <div className={styles.bar}>
                            <div
                                className={styles.fill}
                                style={{
                                    width: `${feedback.sentiment?.neutral || 0}%`,
                                    background: '#6b7280'
                                }}
                            />
                        </div>
                        <span>{feedback.sentiment?.neutral || 0}%</span>
                    </div>
                    <div className={styles.sentimentBar}>
                        <span>Negative</span>
                        <div className={styles.bar}>
                            <div
                                className={styles.fill}
                                style={{
                                    width: `${feedback.sentiment?.negative || 0}%`,
                                    background: '#ef4444'
                                }}
                            />
                        </div>
                        <span>{feedback.sentiment?.negative || 0}%</span>
                    </div>
                </div>
            </div>

            {feedback.recentFeedback && feedback.recentFeedback.length > 0 && (
                <div className={styles.recent}>
                    <h4>Recent Feedback</h4>
                    {feedback.recentFeedback.slice(0, 3).map((item, idx) => (
                        <div key={idx} className={styles.feedbackItem}>
                            <div className={styles.feedbackScore}>
                                {item.score}/10
                            </div>
                            <div className={styles.feedbackContent}>
                                <p>{item.comment}</p>
                                <span className={styles.feedbackDate}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
