'use client';

import { Clock, User, CheckCircle, ArrowDown } from 'lucide-react';
import styles from './DealTimeline.module.css';

export default function DealTimeline({ history = [] }) {
    if (!history || history.length === 0) {
        return <div className={styles.empty}>لا يوجد سجل نشاط لهذه الصفقة</div>;
    }

    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                <Clock size={20} />
                سجل النشاط (Timeline)
            </h3>

            <div className={styles.timeline}>
                {sortedHistory.map((item, index) => (
                    <div key={item.id} className={styles.item}>
                        {/* Line connector */}
                        {index !== sortedHistory.length - 1 && <div className={styles.line}></div>}

                        {/* Dot/Icon */}
                        <div className={styles.iconWrapper}>
                            <div className={styles.icon}>
                                <CheckCircle size={16} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <span className={styles.stage}>{getStageName(item.stage)}</span>
                                <span className={styles.date}>
                                    {new Date(item.changedAt).toLocaleString('ar-EG')}
                                </span>
                            </div>

                            <div className={styles.details}>
                                <div className={styles.user}>
                                    <User size={14} />
                                    <span>{item.changedBy || 'System'}</span>
                                </div>
                                {item.previousStage && (
                                    <div className={styles.change}>
                                        من: {getStageName(item.previousStage)}
                                    </div>
                                )}
                            </div>

                            {item.notes && (
                                <div className={styles.notes}>
                                    {item.notes}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStageName(stage) {
    const stages = {
        'lead': 'عميل محتمل (Lead)',
        'qualified': 'مؤهل (Qualified)',
        'proposal': 'عرض سعر (Proposal)',
        'negotiation': 'تفاوض (Negotiation)',
        'won': 'تم الفوز (Won)',
        'lost': 'خسارة (Lost)'
    };
    return stages[stage] || stage;
}
