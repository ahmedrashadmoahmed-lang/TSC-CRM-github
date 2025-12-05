// Deal Score Card Component
// Shows multi-dimensional deal scoring

import { useState, useEffect } from 'react';
import { Award, TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import styles from './DealScoreCard.module.css';

export default function DealScoreCard({ dealId, deal }) {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (deal?.dealScore) {
            setScore({
                totalScore: deal.dealScore,
                grade: deal.grade,
                factors: deal.scoreFactors
            });
            setLoading(false);
        } else if (dealId) {
            fetchScore();
        }
    }, [dealId, deal]);

    const fetchScore = async () => {
        try {
            const response = await fetch(`/api/deals/${dealId}/score`);
            const result = await response.json();
            if (result.success) {
                setScore(result.data);
            }
        } catch (error) {
            console.error('Error fetching score:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Calculating...</div>;
    if (!score) return null;

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return '#10b981';
        if (grade.startsWith('B')) return '#3b82f6';
        if (grade.startsWith('C')) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className={styles.scoreCard}>
            <div className={styles.header}>
                <Award size={20} />
                <h3>Deal Score</h3>
            </div>

            <div className={styles.mainScore}>
                <div className={styles.scoreCircle} style={{ borderColor: getGradeColor(score.grade) }}>
                    <span className={styles.score}>{score.totalScore}</span>
                    <span className={styles.grade} style={{ color: getGradeColor(score.grade) }}>
                        {score.grade}
                    </span>
                </div>
            </div>

            <div className={styles.factors}>
                <div className={styles.factor}>
                    <DollarSign size={16} />
                    <span>Value</span>
                    <div className={styles.bar}>
                        <div className={styles.fill} style={{ width: `${score.factors?.value || 0}%` }} />
                    </div>
                    <span>{score.factors?.value || 0}%</span>
                </div>

                <div className={styles.factor}>
                    <AlertTriangle size={16} />
                    <span>Risk</span>
                    <div className={styles.bar}>
                        <div className={styles.fill} style={{ width: `${score.factors?.risk || 0}%` }} />
                    </div>
                    <span>{score.factors?.risk || 0}%</span>
                </div>

                <div className={styles.factor}>
                    <Clock size={16} />
                    <span>Duration</span>
                    <div className={styles.bar}>
                        <div className={styles.fill} style={{ width: `${score.factors?.duration || 0}%` }} />
                    </div>
                    <span>{score.factors?.duration || 0}%</span>
                </div>

                <div className={styles.factor}>
                    <TrendingUp size={16} />
                    <span>Probability</span>
                    <div className={styles.bar}>
                        <div className={styles.fill} style={{ width: `${score.factors?.probability || 0}%` }} />
                    </div>
                    <span>{score.factors?.probability || 0}%</span>
                </div>
            </div>
        </div>
    );
}
