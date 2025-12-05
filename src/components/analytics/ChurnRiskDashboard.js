// Churn Risk Dashboard
// Shows customers at risk of churning

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Users } from 'lucide-react';
import styles from './ChurnRiskDashboard.module.css';

export default function ChurnRiskDashboard({ tenantId }) {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChurnRisks();
    }, [tenantId]);

    const fetchChurnRisks = async () => {
        try {
            const response = await fetch(`/api/analytics/churn-risk?tenantId=${tenantId}`);
            const result = await response.json();
            if (result.success) {
                setRisks(result.data);
            }
        } catch (error) {
            console.error('Error fetching churn risks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    const highRisk = risks.filter(r => r.level === 'high');
    const mediumRisk = risks.filter(r => r.level === 'medium');

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <AlertTriangle size={20} className={styles.icon} />
                    <h3>Churn Risk Analysis</h3>
                </div>
                <div className={styles.stats}>
                    <span className={styles.stat}>
                        <span className={styles.high}>{highRisk.length}</span> High Risk
                    </span>
                    <span className={styles.stat}>
                        <span className={styles.medium}>{mediumRisk.length}</span> Medium Risk
                    </span>
                </div>
            </div>

            <div className={styles.riskList}>
                {highRisk.slice(0, 5).map(customer => (
                    <div key={customer.id} className={styles.riskCard}>
                        <div className={styles.customerInfo}>
                            <Users size={16} />
                            <span className={styles.name}>{customer.name}</span>
                        </div>
                        <div className={styles.riskScore}>
                            <div className={styles.scoreBar}>
                                <div
                                    className={styles.scoreFill}
                                    style={{
                                        width: `${customer.riskScore}%`,
                                        background: customer.level === 'high' ? '#ef4444' : '#f59e0b'
                                    }}
                                />
                            </div>
                            <span className={styles.scoreValue}>{customer.riskScore}%</span>
                        </div>
                        <div className={styles.strategies}>
                            {customer.strategies?.slice(0, 2).map((strategy, idx) => (
                                <span key={idx} className={styles.strategy}>
                                    {strategy}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
