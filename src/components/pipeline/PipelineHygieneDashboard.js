'use client';

import { useState, useEffect } from 'react';
import styles from './PipelineHygieneDashboard.module.css';

export default function PipelineHygieneDashboard({ tenantId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDeals, setSelectedDeals] = useState([]);

    useEffect(() => {
        fetchHygieneData();
    }, [tenantId]);

    const fetchHygieneData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/pipeline/cleanup?tenantId=${tenantId}`);
            const result = await response.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (selectedDeals.length === 0) return;

        try {
            await fetch('/api/pipeline/cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    action: 'archive',
                    opportunityIds: selectedDeals,
                    reason: 'Manually archived from hygiene dashboard'
                })
            });
            setSelectedDeals([]);
            fetchHygieneData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!data) return null;

    const { report, stale, needsArchive } = data;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Pipeline Hygiene</h2>
                <div className={styles.score}>
                    <div className={styles.scoreValue}>{report.score}</div>
                    <div className={styles.scoreGrade}>Grade: {report.grade}</div>
                </div>
            </div>

            <div className={styles.summary}>
                <div className={styles.stat}>
                    <span>{report.summary.healthy}</span>
                    <label>Healthy</label>
                </div>
                <div className={styles.stat}>
                    <span>{report.summary.stale}</span>
                    <label>Stale</label>
                </div>
                <div className={styles.stat}>
                    <span>{report.summary.needsArchive}</span>
                    <label>Needs Archive</label>
                </div>
            </div>

            {needsArchive.length > 0 && (
                <div className={styles.section}>
                    <h3>Needs Archiving ({needsArchive.length})</h3>
                    <div className={styles.dealsList}>
                        {needsArchive.map(deal => (
                            <div key={deal.id} className={styles.dealItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedDeals.includes(deal.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedDeals([...selectedDeals, deal.id]);
                                        } else {
                                            setSelectedDeals(selectedDeals.filter(id => id !== deal.id));
                                        }
                                    }}
                                />
                                <div className={styles.dealInfo}>
                                    <div className={styles.dealTitle}>{deal.title}</div>
                                    <div className={styles.dealMeta}>
                                        {deal.daysSinceActivity} days inactive
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedDeals.length > 0 && (
                        <button onClick={handleArchive} className={styles.archiveBtn}>
                            Archive Selected ({selectedDeals.length})
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
