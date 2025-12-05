import { useState, useEffect } from 'react';
import styles from './LeadScoreCard.module.css';
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, Zap } from 'lucide-react';

export default function LeadScoreCard({ leadId, leadData, compact = false }) {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (leadData) {
            fetchScore();
        }
    }, [leadId, leadData]);

    const fetchScore = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ai/lead-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadData })
            });

            const result = await response.json();
            if (result.success) {
                setScore(result.data);
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>جاري حساب النقاط...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.card} ${styles.error}`}>
                <AlertCircle size={20} />
                <span>خطأ في حساب النقاط</span>
            </div>
        );
    }

    if (!score) return null;

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return '#28a745';
        if (grade.startsWith('B')) return '#17a2b8';
        if (grade.startsWith('C')) return '#ffc107';
        return '#dc3545';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#17a2b8';
        if (score >= 40) return '#ffc107';
        return '#dc3545';
    };

    if (compact) {
        return (
            <div className={`${styles.card} ${styles.compact}`}>
                <div className={styles.compactScore}>
                    <div
                        className={styles.scoreCircle}
                        style={{ borderColor: getScoreColor(score.totalScore) }}
                    >
                        <span className={styles.scoreValue}>{score.totalScore}</span>
                    </div>
                    <div className={styles.compactInfo}>
                        <span
                            className={styles.grade}
                            style={{ color: getGradeColor(score.grade) }}
                        >
                            {score.grade}
                        </span>
                        <span className={styles.probability}>
                            {score.conversionProbability}% احتمالية
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <Target size={24} />
                    <h3>تقييم العميل المحتمل</h3>
                </div>
                <div
                    className={styles.gradeBadge}
                    style={{ backgroundColor: getGradeColor(score.grade) }}
                >
                    {score.grade}
                </div>
            </div>

            {/* Main Score */}
            <div className={styles.mainScore}>
                <div className={styles.scoreDisplay}>
                    <div
                        className={styles.scoreRing}
                        style={{
                            background: `conic-gradient(${getScoreColor(score.totalScore)} ${score.totalScore * 3.6}deg, #e9ecef 0deg)`
                        }}
                    >
                        <div className={styles.scoreInner}>
                            <span className={styles.scoreNumber}>{score.totalScore}</span>
                            <span className={styles.scoreLabel}>من 100</span>
                        </div>
                    </div>
                </div>

                <div className={styles.conversionProb}>
                    <Zap size={20} />
                    <div>
                        <div className={styles.probValue}>{score.conversionProbability}%</div>
                        <div className={styles.probLabel}>احتمالية التحويل</div>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className={styles.breakdown}>
                <h4 className={styles.breakdownTitle}>تفصيل النقاط</h4>
                <div className={styles.breakdownGrid}>
                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownHeader}>
                            <span>ديموغرافي</span>
                            <span className={styles.breakdownScore}>{score.breakdown.demographic}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${score.breakdown.demographic}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownHeader}>
                            <span>سلوكي</span>
                            <span className={styles.breakdownScore}>{score.breakdown.behavioral}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${score.breakdown.behavioral}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownHeader}>
                            <span>التفاعل</span>
                            <span className={styles.breakdownScore}>{score.breakdown.engagement}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${score.breakdown.engagement}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownHeader}>
                            <span>الشركة</span>
                            <span className={styles.breakdownScore}>{score.breakdown.firmographic}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${score.breakdown.firmographic}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {score.recommendations && score.recommendations.length > 0 && (
                <div className={styles.recommendations}>
                    <h4 className={styles.recommendationsTitle}>
                        <CheckCircle size={18} />
                        التوصيات
                    </h4>
                    <div className={styles.recommendationsList}>
                        {score.recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`${styles.recommendation} ${styles[rec.priority]}`}
                            >
                                <div className={styles.recHeader}>
                                    <span className={styles.recAction}>{rec.action}</span>
                                    <span className={styles.recPriority}>{rec.priority}</span>
                                </div>
                                <p className={styles.recReason}>{rec.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <button
                onClick={fetchScore}
                className={styles.refreshButton}
                disabled={loading}
            >
                إعادة الحساب
            </button>
        </div>
    );
}
