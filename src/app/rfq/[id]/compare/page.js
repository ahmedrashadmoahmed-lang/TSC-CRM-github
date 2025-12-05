'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import styles from './compare.module.css';

export default function QuoteComparison() {
    const params = useParams();
    const router = useRouter();
    const [rfq, setRFQ] = useState(null);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [rfqRes, quotesRes] = await Promise.all([
                fetch(`/api/rfq/${params.id}`),
                fetch(`/api/rfq/${params.id}/quotes`)
            ]);

            if (rfqRes.ok && quotesRes.ok) {
                setRFQ(await rfqRes.json());
                setQuotes(await quotesRes.json());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectQuote = async (quoteId, autoConvert = false) => {
        try {
            setSelecting(true);
            const res = await fetch(`/api/rfq/${params.id}/select-quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId, autoConvertToPO: autoConvert })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.po) {
                    router.push(`/po/${data.po.id}`);
                } else {
                    router.push(`/rfq/${params.id}`);
                }
            }
        } catch (error) {
            console.error('Error selecting quote:', error);
        } finally {
            setSelecting(false);
        }
    };

    const getBestPrice = () => {
        if (quotes.length === 0) return null;
        return Math.min(...quotes.map(q => q.totalPrice));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getPriceDifference = (price) => {
        const bestPrice = getBestPrice();
        if (!bestPrice || price === bestPrice) return null;
        const diff = ((price - bestPrice) / bestPrice) * 100;
        return diff.toFixed(1);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className={styles.loading}>Loading comparison...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Header
                title="Quote Comparison"
                subtitle={rfq ? `RFQ ${rfq.rfqNumber}` : ''}
                actions={
                    <Button variant="ghost" onClick={() => router.push(`/rfq/${params.id}`)}>
                        <ArrowLeft size={18} />
                        Back to RFQ
                    </Button>
                }
            />

            <div className={styles.container}>
                {quotes.length === 0 ? (
                    <Card className={styles.empty}>
                        <p>No quotes received yet</p>
                    </Card>
                ) : (
                    <div className={styles.comparisonGrid}>
                        {quotes.map((quote) => {
                            const isBest = quote.totalPrice === getBestPrice();
                            const priceDiff = getPriceDifference(quote.totalPrice);

                            return (
                                <Card key={quote.id} className={`${styles.quoteCard} ${isBest ? styles.bestQuote : ''}`}>
                                    {isBest && (
                                        <div className={styles.bestBadge}>
                                            <CheckCircle2 size={16} />
                                            Best Price
                                        </div>
                                    )}

                                    <div className={styles.supplierHeader}>
                                        <h3 className={styles.supplierName}>{quote.supplier.name}</h3>
                                        <Badge variant={quote.status === 'selected' ? 'success' : 'default'}>
                                            {quote.status}
                                        </Badge>
                                    </div>

                                    <div className={styles.priceSection}>
                                        <div className={styles.totalPrice}>
                                            {formatCurrency(quote.totalPrice)}
                                        </div>
                                        {priceDiff && (
                                            <div className={styles.priceDiff}>
                                                <TrendingUp size={16} />
                                                +{priceDiff}% vs best
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.details}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Delivery Time:</span>
                                            <span className={styles.value}>{quote.deliveryTime} days</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Payment Terms:</span>
                                            <span className={styles.value}>{quote.paymentTerms || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Valid Until:</span>
                                            <span className={styles.value}>
                                                {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        {quote.score && (
                                            <div className={styles.detailRow}>
                                                <span className={styles.label}>Score:</span>
                                                <span className={styles.value}>{quote.score}/100</span>
                                            </div>
                                        )}
                                    </div>

                                    {quote.notes && (
                                        <div className={styles.notes}>
                                            <p className={styles.notesLabel}>Notes:</p>
                                            <p className={styles.notesText}>{quote.notes}</p>
                                        </div>
                                    )}

                                    <div className={styles.actions}>
                                        {quote.status !== 'selected' && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => selectQuote(quote.id, false)}
                                                    disabled={selecting}
                                                    fullWidth
                                                >
                                                    Select Quote
                                                </Button>
                                                <Button
                                                    variant="success"
                                                    onClick={() => selectQuote(quote.id, true)}
                                                    disabled={selecting}
                                                    fullWidth
                                                >
                                                    Select & Create PO
                                                </Button>
                                            </>
                                        )}
                                        {quote.status === 'selected' && (
                                            <Badge variant="success" className={styles.selectedBadge}>
                                                <CheckCircle2 size={16} />
                                                Selected Quote
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
