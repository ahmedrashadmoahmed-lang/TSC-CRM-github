'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import styles from './RoleFilter.module.css';

const ROLES = [
    { id: 'all', label: 'All Users', description: 'View all data' },
    { id: 'sales_rep', label: 'Sales Rep', description: 'Individual performance' },
    { id: 'manager', label: 'Manager', description: 'Team overview' },
    { id: 'executive', label: 'Executive', description: 'Company-wide metrics' },
];

export default function RoleFilter({ currentRole = 'all', onRoleChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleRoleSelect = (roleId) => {
        onRoleChange(roleId);
        setIsOpen(false);
    };

    const currentRoleData = ROLES.find(r => r.id === currentRole) || ROLES[0];

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Filter size={16} />
                <span>{currentRoleData.label}</span>
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.dropdown}>
                        <div className={styles.header}>
                            <h4>Filter by Role</h4>
                            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className={styles.rolesList}>
                            {ROLES.map(role => (
                                <button
                                    key={role.id}
                                    className={`${styles.roleOption} ${currentRole === role.id ? styles.active : ''}`}
                                    onClick={() => handleRoleSelect(role.id)}
                                >
                                    <div className={styles.roleInfo}>
                                        <span className={styles.roleLabel}>{role.label}</span>
                                        <span className={styles.roleDescription}>{role.description}</span>
                                    </div>
                                    {currentRole === role.id && (
                                        <div className={styles.checkmark}>✓</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
