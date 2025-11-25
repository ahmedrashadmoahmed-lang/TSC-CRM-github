'use client';

import { Building2, User, DollarSign, Calendar, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './ListView.module.css';

export default function ListView({ deals, columns, onDealClick, getPriorityVariant, formatCurrency, filter, searchTerm }) {
    const allDeals = Object.entries(deals).flatMap(([stage, stageDeals]) =>
        stageDeals.map(deal => ({ ...deal, stage }))
    );

    const filteredDeals = allDeals.filter(deal =>
        (filter === 'all' || deal.priority === filter) &&
        (searchTerm === '' ||
            deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStageColor = (stage) => {
        const column = columns.find(c => c.id === stage);
        return column ? column.color : 'default';
    };

    return (
        <div className={styles.container}>
            {filteredDeals.map(deal => (
                <Card
                    key={deal.id}
                    className={styles.dealCard}
                    hover
                    onClick={() => onDealClick(deal)}
                >
                    <div className={styles.dealHeader}>
                        <div className={styles.dealMain}>
                            <div className={styles.companySection}>
                                <Building2 size={20} />
                                <h3 className={styles.company}>{deal.company}</h3>
                            </div>
                            <div className={styles.badges}>
                                <Badge variant={getStageColor(deal.stage)} size="sm">
                                    {deal.stage}
                                </Badge>
                                <Badge variant={getPriorityVariant(deal.priority)} size="sm">
                                    {deal.priority}
                                </Badge>
                            </div>
                        </div>
                        <div className={styles.value}>
                            {formatCurrency(deal.value)}
                        </div>
                    </div>

                    <div className={styles.dealInfo}>
                        <div className={styles.infoItem}>
                            <User size={16} />
                            <span>{deal.contact}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <Calendar size={16} />
                            <span>{deal.date}</span>
                        </div>
                        {deal.email && (
                            <div className={styles.infoItem}>
                                <span className={styles.email}>{deal.email}</span>
                            </div>
                        )}
                    </div>

                    <button className={styles.viewButton}>
                        <Eye size={16} />
                        View Details
                    </button>
                </Card>
            ))}

            {filteredDeals.length === 0 && (
                <div className={styles.empty}>
                    <p>No deals found</p>
                </div>
            )}
        </div>
    );
}
