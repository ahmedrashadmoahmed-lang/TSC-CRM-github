// Quote Comparison Component
// Side-by-side comparison of supplier quotes

'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingDown, TrendingUp, Download } from 'lucide-react';
import styles from './QuoteComparison.module.css';
import QuoteComparisonEngine from '@/lib/quoteComparisonEngine';

export default function QuoteComparison({ rfqId, quotes: initialQuotes }) {
    const [quotes, setQuotes] = useState([]);
    const [summary, setSummary] = useState(null);
    const [sortBy, setSortBy] = useState('rank');

    useEffect(() => {
        if (initialQuotes && initialQuotes.length > 0) {
            const compared = QuoteComparisonEngine.compareQuotes(initialQuotes, {});
            setQuotes(compared);
            setSummary(QuoteComparisonEngine.getComparisonSummary(compared));
        }
    }, [initialQuotes]);

    const handleSort = (field) => {
        const sorted = [...quotes].sort((a, b) => {
            if (field === 'rank') return a.rank - b.rank;
            if (field === 'price') return a.totalPrice - b.totalPrice;
            if (field === 'delivery') return a.deliveryTime - b.deliveryTime;
            if (field === 'score') return b.totalScore - a.totalScore;
            return 0;
        });
        setQuotes(sorted);
        setSortBy(field);
    };

    const handleExport = () => {
        const csv = QuoteComparisonEngine.exportToCSV(quotes);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-comparison-${rfqId}.csv`;
        a.click();
    };

    if (!quotes || quotes.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No quotes to compare yet</p>
            </div>
        );
    }

    return (
        <div className={styles.comparison}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>Quote Comparison</h2>
                    <p>{quotes.length} quotes received</p>
                </div>
                <button className={styles.exportBtn} onClick={handleExport}>
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* Summary */}
            {summary && (
                <div className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <span className={styles.label}>Lowest Price</span>
                        <span className={styles.value}>
                            EGP {summary.lowestPrice.toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.label}>Average Price</span>
                        <span className={styles.value}>
                            EGP {Math.round(summary.avgPrice).toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.label}>Fastest Delivery</span>
                        <span className={styles.value}>
                            {summary.fastestDelivery} days
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.label}>Best Score</span>
                        <span className={styles.value}>
                            {summary.bestScore.toFixed(1)}/100
                        </span>
                    </div>
                </div>
            )}

            {/* Comparison Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('rank')}>Rank</th>
                            <th>Supplier</th>
                            <th onClick={() => handleSort('price')}>Price</th>
                            <th onClick={() => handleSort('delivery')}>Delivery</th>
                            <th>Payment Terms</th>
                            <th onClick={() => handleSort('score')}>Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map(quote => {
                            const isWinner = quote.rank === 1;
                            const priceDiff = QuoteComparisonEngine.getPriceDifference(
                                quote,
                                summary.lowestPrice
                            );
                            const recommendations = QuoteComparisonEngine.getRecommendation(
                                quote,
                                summary
                            );

                            return (
                                <tr
                                    key={quote.id}
                                    className={isWinner ? styles.winner : ''}
                                >
                                    <td>
                                        <div className={styles.rank}>
                                            {isWinner && <Trophy size={16} />}
                                            #{quote.rank}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.supplier}>
                                            <span className={styles.name}>
                                                {quote.supplier?.name || 'Unknown'}
                                            </span>
                                            {quote.supplier?.rating && (
                                                <span className={styles.rating}>
                                                    ⭐ {quote.supplier.rating}/5
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.price}>
                                            <span className={styles.amount}>
                                                EGP {quote.totalPrice.toLocaleString()}
                                            </span>
                                            {priceDiff.amount > 0 && (
                                                <span className={styles.diff}>
                                                    <TrendingUp size={12} />
                                                    +{priceDiff.percentage}%
                                                </span>
                                            )}
                                            {priceDiff.amount === 0 && (
                                                <span className={styles.lowest}>Lowest</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.delivery}>
                                            {quote.deliveryTime} days
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.terms}>
                                            {quote.paymentTerms || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.scoreCell}>
                                            <div className={styles.scoreBar}>
                                                <div
                                                    className={styles.scoreFill}
                                                    style={{ width: `${quote.totalScore}%` }}
                                                />
                                            </div>
                                            <span className={styles.scoreValue}>
                                                {quote.totalScore.toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className={styles.selectBtn}>
                                            Select
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
