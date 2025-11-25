'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableDealCard from './DraggableDealCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './DragDropKanban.module.css';

export default function DragDropKanban({ columns, deals, onDealMove, onDealClick, filter, searchTerm, formatCurrency, getPriorityVariant }) {
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const dealId = active.id;
        const targetColumn = over.id;

        // Find which column the deal is currently in
        let sourceColumn = null;
        for (const column of columns) {
            if (deals[column.id].find(d => d.id === dealId)) {
                sourceColumn = column.id;
                break;
            }
        }

        if (sourceColumn && targetColumn && sourceColumn !== targetColumn) {
            onDealMove(dealId, sourceColumn, targetColumn);
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const getActiveDeal = () => {
        if (!activeId) return null;
        for (const column of columns) {
            const deal = deals[column.id].find(d => d.id === activeId);
            if (deal) return deal;
        }
        return null;
    };

    const activeDeal = getActiveDeal();

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className={styles.kanban}>
                {columns.map(column => {
                    const Icon = column.icon;
                    const stageDeals = deals[column.id].filter(deal =>
                        (filter === 'all' || deal.priority === filter) &&
                        (searchTerm === '' ||
                            deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            deal.contact.toLowerCase().includes(searchTerm.toLowerCase()))
                    );

                    const stageValue = deals[column.id].reduce((sum, d) => sum + d.value, 0);

                    return (
                        <SortableContext
                            key={column.id}
                            id={column.id}
                            items={stageDeals.map(d => d.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className={styles.column}>
                                <div className={styles.columnHeader}>
                                    <div className={styles.columnTitle}>
                                        <Icon size={20} />
                                        <h3>{column.title}</h3>
                                        <Badge variant={column.color} size="sm">
                                            {stageDeals.length}
                                        </Badge>
                                    </div>
                                    <p className={styles.columnValue}>{formatCurrency(stageValue)}</p>
                                </div>

                                <div className={styles.columnContent}>
                                    {stageDeals.map(deal => (
                                        <DraggableDealCard
                                            key={deal.id}
                                            deal={deal}
                                            onClick={() => onDealClick(deal)}
                                            getPriorityVariant={getPriorityVariant}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                                </div>
                            </div>
                        </SortableContext>
                    );
                })}
            </div>

            <DragOverlay>
                {activeDeal && (
                    <Card className={styles.dragOverlay}>
                        <div className={styles.dealCompany}>{activeDeal.company}</div>
                        <div className={styles.dealValue}>{formatCurrency(activeDeal.value)}</div>
                    </Card>
                )}
            </DragOverlay>
        </DndContext>
    );
}
