'use client';

import { LayoutGrid, List, Table } from 'lucide-react';
import styles from './ViewToggle.module.css';

export default function ViewToggle({ currentView, onViewChange }) {
    const views = [
        { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
        { id: 'list', label: 'List', icon: List },
        { id: 'table', label: 'Table', icon: Table },
    ];

    return (
        <div className={styles.container}>
            {views.map(view => {
                const Icon = view.icon;
                return (
                    <button
                        key={view.id}
                        className={`${styles.button} ${currentView === view.id ? styles.active : ''}`}
                        onClick={() => onViewChange(view.id)}
                        title={view.label}
                    >
                        <Icon size={18} />
                        <span>{view.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
