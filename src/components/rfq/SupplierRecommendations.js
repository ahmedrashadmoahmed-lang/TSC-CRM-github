// Supplier Recommendations Component
// AI-powered supplier suggestions for RFQs

'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from './SupplierRecommendations.module.css';
import SupplierRecommendationEngine from '@/lib/supplierRecommendationEngine';

export default function SupplierRecommendations({
    rfq,
    suppliers = [],
    historicalData = [],
    onSelectSuppliers
}) {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [filterCriteria, setFilterCriteria] = useState({
        minRating: 0,
        minScore: 0,
        verifiedOnly: false
    });

    useEffect(() => {
        if (suppliers.length > 0) {
            const recommended = SupplierRecommendationEngine.recommendSuppliers(
                rfq,
                suppliers,
                historicalData
            );
            setRecommendations(recommended);
        }
    }, [rfq, suppliers, historicalData]);

    const toggleSupplier = (supplierId) => {
        setSelectedSuppliers(prev =>
            prev.includes(supplierId)
                ? prev.filter(id => id !== supplierId)
                : [...prev, supplierId]
        );
    };

    const handleConfirmSelection = () => {
        if (onSelectSuppliers) {
            onSelectSuppliers(selectedSuppliers);
        }
    };

    const filteredRecommendations = SupplierRecommendationEngine.filterSuppliers(
        recommendations,
        filterCriteria
    );

    const getScoreBadgeClass = (score) => {
        if (score >= 80) return styles.scoreExcellent;
        if (score >= 60) return styles.scoreGood;
        if (score >= 40) return styles.scoreFair;
        return styles.scorePoor;
    };

    const getConfidenceBadge = (confidence) => {
        if (confidence >= 80) return { text: 'High Confidence', class: styles.confidenceHigh };
        if (confidence >= 60) return { text: 'Medium Confidence', class: styles.confidenceMedium };
        return { text: 'Low Confidence', class: styles.confidenceLow };
    };

    return (
        <div className={styles.recommendations}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>AI Supplier Recommendations</h2>
                    <p>
                        {recommendations.length} suppliers analyzed • {selectedSuppliers.length} selected
                    </p>
                </div>
                {selectedSuppliers.length > 0 && (
                    <button className={styles.confirmBtn} onClick={handleConfirmSelection}>
                        <CheckCircle size={16} />
                        Invite {selectedSuppliers.length} Supplier{selectedSuppliers.length > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filter}>
                    <label>Min. Rating</label>
                    <select
                        value={filterCriteria.minRating}
                        onChange={(e) => setFilterCriteria({
                            ...filterCriteria,
                            minRating: parseFloat(e.target.value)
                        })}
                    >
                        <option value={0}>Any</option>
                        <option value={3}>3+ Stars</option>
                        <option value={4}>4+ Stars</option>
                        <option value={4.5}>4.5+ Stars</option>
                    </select>
                </div>

                <div className={styles.filter}>
                    <label>Min. Score</label>
                    <select
                        value={filterCriteria.minScore}
                        onChange={(e) => setFilterCriteria({
                            ...filterCriteria,
                            minScore: parseFloat(e.target.value)
                        })}
                    >
                        <option value={0}>Any</option>
                        <option value={40}>40+</option>
                        <option value={60}>60+</option>
                        <option value={80}>80+</option>
                    </select>
                </div>

                <div className={styles.filter}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={filterCriteria.verifiedOnly}
                            onChange={(e) => setFilterCriteria({
                                ...filterCriteria,
                                verifiedOnly: e.target.checked
                            })}
                        />
                        Verified Only
                    </label>
                </div>
            </div>

            {/* Recommendations List */}
            {filteredRecommendations.length === 0 ? (
                <div className={styles.empty}>
                    <AlertCircle size={48} />
                    <p>No suppliers match the selected criteria</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {filteredRecommendations.map((rec, index) => {
                        const supplier = rec.supplier;
                        const isSelected = selectedSuppliers.includes(supplier.id);
                        const confidenceBadge = getConfidenceBadge(rec.confidence);

                        return (
                            <div
                                key={supplier.id}
                                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                                onClick={() => toggleSupplier(supplier.id)}
                            >
                                {/* Rank Badge */}
                                {index < 3 && (
                                    <div className={`${styles.rankBadge} ${styles[`rank${index + 1}`]}`}>
                                        #{index + 1}
                                    </div>
                                )}

                                {/* Supplier Info */}
                                <div className={styles.supplierInfo}>
                                    <div className={styles.supplierHeader}>
                                        <h3>{supplier.name}</h3>
                                        {supplier.verified && (
                                            <CheckCircle size={16} className={styles.verified} />
                                        )}
                                    </div>

                                    <div className={styles.supplierMeta}>
                                        {supplier.rating && (
                                            <div className={styles.rating}>
                                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                <span>{supplier.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <span className={styles.email}>{supplier.email}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Scores */}
                                <div className={styles.scores}>
                                    <div className={styles.mainScore}>
                                        <div className={`${styles.scoreBadge} ${getScoreBadgeClass(rec.score)}`}>
                                            {Math.round(rec.score)}
                                        </div>
                                        <span className={styles.scoreLabel}>Overall Score</span>
                                    </div>

                                    <div className={styles.confidenceBadge}>
                                        <span className={confidenceBadge.class}>
                                            {confidenceBadge.text}
                                        </span>
                                    </div>
                                </div>

                                {/* Price Prediction */}
                                {rec.prediction && rec.prediction.estimatedPrice && (
                                    <div className={styles.prediction}>
                                        <div className={styles.predictionHeader}>
                                            <TrendingUp size={14} />
                                            <span>Estimated Quote</span>
                                        </div>
                                        <div className={styles.predictionValue}>
                                            EGP {rec.prediction.estimatedPrice.toLocaleString()}
                                        </div>
                                        {rec.prediction.priceRange && (
                                            <div className={styles.predictionRange}>
                                                Range: EGP {rec.prediction.priceRange.min.toLocaleString()} -
                                                EGP {rec.prediction.priceRange.max.toLocaleString()}
                                            </div>
                                        )}
                                        <div className={styles.predictionBasis}>
                                            {rec.prediction.basedOn}
                                        </div>
                                    </div>
                                )}

                                {/* Reasons */}
                                {rec.reasons && rec.reasons.length > 0 && (
                                    <div className={styles.reasons}>
                                        {rec.reasons.map((reason, i) => (
                                            <div
                                                key={i}
                                                className={`${styles.reason} ${styles[`reason${reason.type.charAt(0).toUpperCase() + reason.type.slice(1)}`]}`}
                                            >
                                                {reason.type === 'success' && <CheckCircle size={12} />}
                                                {reason.type === 'warning' && <AlertCircle size={12} />}
                                                {reason.type === 'info' && <Info size={12} />}
                                                <span>{reason.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className={styles.selectedIndicator}>
                                        <CheckCircle size={20} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            {selectedSuppliers.length > 0 && (
                <div className={styles.summary}>
                    <div className={styles.summaryContent}>
                        <h4>Selection Summary</h4>
                        <p>
                            You've selected {selectedSuppliers.length} supplier{selectedSuppliers.length > 1 ? 's' : ''} to
                            receive this RFQ. Click "Invite" to send the request.
                        </p>
                    </div>
                    <button className={styles.confirmBtnLarge} onClick={handleConfirmSelection}>
                        <CheckCircle size={18} />
                        Invite Selected Suppliers
                    </button>
                </div>
            )}
        </div>
    );
}
