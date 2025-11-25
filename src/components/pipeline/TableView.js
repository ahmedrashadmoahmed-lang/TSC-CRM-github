'use client';

import { Building2, User, DollarSign, Calendar, Eye } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import styles from './TableView.module.css';

export default function TableView({ deals, columns, onDealClick, getPriorityVariant, formatCurrency, filter, searchTerm }) {
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
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Contact</th>
                        <th>Value</th>
                        <th>Stage</th>
                        <th>Priority</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDeals.map(deal => (
                        <tr key={deal.id} className={styles.row}>
                            <td className={styles.companyCell}>
                                <Building2 size={16} />
                                <span className={styles.company}>{deal.company}</span>
                            </td>
                            <td className={styles.contactCell}>
                                <User size={14} />
                                <span>{deal.contact}</span>
                            </td>
                            <td className={styles.valueCell}>
                                {formatCurrency(deal.value)}
                            </td>
                            <td>
                                <Badge variant={getStageColor(deal.stage)} size="sm">
                                    {deal.stage}
                                </Badge>
                            </td>
                            <td>
                                <Badge variant={getPriorityVariant(deal.priority)} size="sm">
                                    {deal.priority}
                                </Badge>
                            </td>
                            <td className={styles.dateCell}>
                                <Calendar size={14} />
                                <span>{deal.date}</span>
                            </td>
                            <td>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => onDealClick(deal)}
                                >
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {filteredDeals.length === 0 && (
                <div className={styles.empty}>
                    <p>No deals found</p>
                </div>
            )}
        </div>
    );
}
