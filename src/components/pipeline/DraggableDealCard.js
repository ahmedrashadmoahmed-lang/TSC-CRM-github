'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building2, User, DollarSign, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './DraggableDealCard.module.css';

export default function DraggableDealCard({ deal, onClick, getPriorityVariant, formatCurrency }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
                className={`${styles.dealCard} ${isDragging ? styles.dragging : ''}`}
                hover
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <div className={styles.dealHeader}>
                    <div className={styles.dealCompanySection}>
                        <Building2 size={16} />
                        <h4 className={styles.dealCompany}>{deal.company}</h4>
                    </div>
                    <Badge variant={getPriorityVariant(deal.priority)} size="sm">
                        {deal.priority}
                    </Badge>
                </div>

                <div className={styles.dealInfo}>
                    <div className={styles.dealInfoItem}>
                        <User size={14} />
                        <span>{deal.contact}</span>
                    </div>
                    <div className={styles.dealInfoItem}>
                        <DollarSign size={14} />
                        <span className={styles.dealValue}>{formatCurrency(deal.value)}</span>
                    </div>
                    <div className={styles.dealInfoItem}>
                        <Calendar size={14} />
                        <span>{deal.date}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
