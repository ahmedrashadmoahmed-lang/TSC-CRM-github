'use client';

import { useSession } from 'next-auth/react';

/**
 * Custom hook for authentication
 * Provides easy access to session and auth utilities
 */
export function useAuth() {
    const { data: session, status } = useSession();

    return {
        user: session?.user || null,
        session,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        status,
    };
}

/**
 * Custom hook for role checking
 */
export function useRole() {
    const { user } = useAuth();

    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return rolesArray.includes(user.role);
    };

    const isAdmin = () => hasRole('admin');
    const isManager = () => hasRole(['admin', 'manager']);
    const isAccountant = () => hasRole(['admin', 'accountant']);

    return {
        role: user?.role || null,
        hasRole,
        isAdmin,
        isManager,
        isAccountant,
    };
}

/**
 * Custom hook for permission checking
 */
export function usePermissions() {
    const { user } = useAuth();

    const hasPermission = (permission) => {
        if (!user || !user.role) return false;

        // Import permissions utility
        const { hasPermission: checkPermission } = require('@/utils/permissions');
        return checkPermission(user.role, permission);
    };

    const hasAnyPermission = (permissions) => {
        if (!user || !user.role) return false;

        const { hasAnyPermission: checkAny } = require('@/utils/permissions');
        return checkAny(user.role, permissions);
    };

    const hasAllPermissions = (permissions) => {
        if (!user || !user.role) return false;

        const { hasAllPermissions: checkAll } = require('@/utils/permissions');
        return checkAll(user.role, permissions);
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
