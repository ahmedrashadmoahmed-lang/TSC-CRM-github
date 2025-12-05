'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Shield,
    DollarSign,
    Truck,
    Award,
    FileCheck,
    TrendingDown,
    Info
} from 'lucide-react';
import styles from './RiskAssessment.module.css';
import RiskAnalysisEngine from '@/lib/riskAnalysisEngine';

export default function RiskAssessment({ rfq, suppliers = [], quotes = [], historicalData = [] }) {
    const [riskAnalysis, setRiskAnalysis] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (rfq) {
            const analysis = RiskAnalysisEngine.analyzeRFQRisk(rfq, suppliers, quotes, historicalData);
            setRiskAnalysis(analysis);
        }
    }, [rfq, suppliers, quotes, historicalData]);

    if (!riskAnalysis) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Analyzing risks...</p>
            </div>
        );
    }

    const getCategoryIcon = (category) => {
        const icons = {
            supplier: <Users size={20} />,
            financial: <DollarSign size={20} />,
            delivery: <Truck size={20} />,
            quality: <Award size={20} />,
            compliance: <FileCheck size={20} />,
            market: <TrendingUp size={20} />
        };
        return icons[category] || <Info size={20} />;
    };

    const getRiskLevelClass = (level) => {
        return styles[`risk${level.label}`];
    };

    const getRiskIcon = (level) => {
        switch (level.label) {
            case 'Low':
                return <CheckCircle size={24} />;
            case 'Medium':
                return <Info size={24} />;
            case 'High':
                return <AlertCircle size={24} />;
            case 'Critical':
                return <AlertTriangle size={24} />;
            default:
                return <Info size={24} />;
        }
    };

    return (
        <div className={styles.riskAssessment}>
            {/* Overall Risk Card */}
            <div className={`${styles.overallCard} ${getRiskLevelClass(riskAnalysis.overallRisk.level)}`}>
                <div className={styles.overallHeader}>
                    <div className={styles.overallIcon}>
                        {getRiskIcon(riskAnalysis.overallRisk.level)}
                    </div>
                    <div>
                        <h2>Overall Risk Assessment</h2>
                        <p className={styles.overallLevel}>{riskAnalysis.overallRisk.level.label} Risk</p>
                    </div>
                </div>

                <div className={styles.overallScore}>
                    <div className={styles.scoreCircle}>
                        <svg width="120" height="120">
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke={riskAnalysis.overallRisk.level.color}
                                strokeWidth="10"
                                strokeDasharray={`${(riskAnalysis.overallRisk.score / 100) * 314} 314`}
                                strokeLinecap="round"
                                transform="rotate(-90 60 60)"
                            />
                            <text x="60" y="60" textAnchor="middle" dy="10" fontSize="32" fontWeight="bold">
                                {riskAnalysis.overallRisk.score}
                            </text>
                        </svg>
                    </div>
                    <p className={styles.scoreLabel}>Risk Score (0-100)</p>
                </div>
            </div>

            {/* Risk Categories */}
            <div className={styles.categoriesSection}>
                <h3>Risk Categories</h3>
                <div className={styles.categoriesGrid}>
                    {Object.entries(riskAnalysis.risks).map(([category, risk]) => (
                        <div
                            key={category}
                            className={`${styles.categoryCard} ${selectedCategory === category ? styles.selected : ''} ${getRiskLevelClass(risk.level)}`}
                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                        >
                            <div className={styles.categoryHeader}>
                                <div className={styles.categoryIcon}>
                                    {getCategoryIcon(category)}
                                </div>
                                <div>
                                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                                    <p className={styles.categoryLevel}>{risk.level.label}</p>
                                </div>
                            </div>

                            <div className={styles.categoryScore}>
                                <div className={styles.scoreBar}>
                                    <div
                                        className={styles.scoreBarFill}
                                        style={{
                                            width: `${risk.score}%`,
                                            background: risk.level.color
                                        }}
                                    />
                                </div>
                                <span className={styles.scoreValue}>{risk.score}/100</span>
                            </div>

                            <p className={styles.categoryMessage}>{risk.message}</p>

                            {/* Factors */}
                            {selectedCategory === category && risk.factors.length > 0 && (
                                <div className={styles.factors}>
                                    <strong>Risk Factors:</strong>
                                    <ul>
                                        {risk.factors.map((factor, idx) => (
                                            <li key={idx} className={styles[`severity${factor.severity.charAt(0).toUpperCase() + factor.severity.slice(1)}`]}>
                                                <span className={styles.factorName}>{factor.name}</span>
                                                <span className={styles.factorImpact}>{factor.impact}% impact</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {riskAnalysis.recommendations.length > 0 && (
                <div className={styles.recommendationsSection}>
                    <h3>
                        <AlertCircle size={20} />
                        Recommended Actions
                    </h3>
                    <div className={styles.recommendationsList}>
                        {riskAnalysis.recommendations.map((rec, idx) => (
                            <div key={idx} className={`${styles.recommendationCard} ${styles[`priority${rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}`]}`}>
                                <div className={styles.recHeader}>
                                    <span className={styles.recPriority}>{rec.priority}</span>
                                    <span className={styles.recCategory}>{rec.category}</span>
                                </div>
                                <p className={styles.recIssue}>{rec.issue}</p>
                                <p className={styles.recAction}>
                                    <strong>Recommended Action:</strong> {rec.action}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mitigation Strategies */}
            {riskAnalysis.mitigation.length > 0 && (
                <div className={styles.mitigationSection}>
                    <h3>
                        <Shield size={20} />
                        Mitigation Strategies
                    </h3>
                    <div className={styles.mitigationList}>
                        {riskAnalysis.mitigation.map((mitigation, idx) => (
                            <div key={idx} className={styles.mitigationCard}>
                                <h4>{mitigation.risk}</h4>
                                <ul>
                                    {mitigation.strategies.map((strategy, i) => (
                                        <li key={i}>
                                            <CheckCircle size={14} />
                                            {strategy}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Summary */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                    <Info size={20} />
                    <span>Risk Assessment Summary</span>
                </div>
                <div className={styles.summaryContent}>
                    <p>
                        This RFQ has been assessed with a <strong className={getRiskLevelClass(riskAnalysis.overallRisk.level)}>
                            {riskAnalysis.overallRisk.level.label}
                        </strong> overall risk level.
                    </p>
                    {riskAnalysis.recommendations.length > 0 && (
                        <p>
                            There are <strong>{riskAnalysis.recommendations.length}</strong> recommended actions to reduce risk.
                        </p>
                    )}
                    <p className={styles.timestamp}>
                        Assessed on {new Date(riskAnalysis.assessedAt).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
