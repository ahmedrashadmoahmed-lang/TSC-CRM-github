'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FormBuilder from '@/components/FormBuilder';
import Badge from '@/components/Badge';
import Alert from '@/components/Alert';
import { ROLES, getAllRoles } from '@/utils/permissions';
import styles from './roles.module.css';

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = () => {
        // Load roles from permissions utility
        const allRoles = getAllRoles();
        setRoles(allRoles);
    };

    const columns = [
        { key: 'name', label: 'Role Name' },
        { key: 'displayName', label: 'Display Name' },
        { key: 'description', label: 'Description' },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (value) => (
                <Badge variant="info">{value.length} permissions</Badge>
            ),
        },
    ];

    const handleViewPermissions = (role) => {
        setSelectedRole(role);
        setShowModal(true);
    };

    const actions = [
        {
            label: 'View Permissions',
            onClick: handleViewPermissions,
            variant: 'primary',
        },
    ];

    return (
        <ProtectedRoute requiredRoles={['admin']}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1>Role Management</h1>
                        <p>Manage system roles and permissions</p>
                    </div>
                </div>

                {message && (
                    <Alert type={message.type} onClose={() => setMessage(null)}>
                        {message.text}
                    </Alert>
                )}

                <Card>
                    <DataTable
                        columns={columns}
                        data={roles}
                        actions={actions}
                        loading={loading}
                    />
                </Card>

                {/* Permissions Modal */}
                {showModal && selectedRole && (
                    <Modal
                        title={`${selectedRole.displayName} Permissions`}
                        onClose={() => setShowModal(false)}
                    >
                        <div className={styles.permissionsModal}>
                            <p className={styles.description}>{selectedRole.description}</p>

                            <h3>Permissions ({selectedRole.permissions.length})</h3>
                            <div className={styles.permissionsList}>
                                {selectedRole.permissions.map((permission) => (
                                    <div key={permission} className={styles.permissionItem}>
                                        <Badge variant="success">✓</Badge>
                                        <span>{permission}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </ProtectedRoute>
    );
}
