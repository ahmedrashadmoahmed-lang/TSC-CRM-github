'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SkeletonLoader from './SkeletonLoader';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
export default function ProtectedRoute({
    children,
    requiredRoles = null,
    requiredPermissions = null,
    fallback = null
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Show loading state
    if (status === 'loading') {
        return fallback || <SkeletonLoader count={5} />;
    }

    // Not authenticated
    if (status === 'unauthenticated') {
        return null;
    }

    // Check role requirements
    if (requiredRoles && session?.user) {
        const userRole = session.user.role;
        const hasRole = requiredRoles.includes(userRole);

        if (!hasRole) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>Access Denied</h1>
                    <p>You don&apos;t have permission to access this page.</p>
                    <p>Required roles: {requiredRoles.join(', ')}</p>
                    <p>Your role: {userRole}</p>
                    <button onClick={() => router.push('/')}>Go to Dashboard</button>
                </div>
            );
        }
    }

    // Check permission requirements
    if (requiredPermissions && session?.user) {
        // Import permissions utility
        const { hasAllPermissions } = require('@/utils/permissions');
        const userRole = session.user.role;
        const hasPermissions = hasAllPermissions(userRole, requiredPermissions);

        if (!hasPermissions) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>Access Denied</h1>
                    <p>You don&apos;t have the required permissions to access this page.</p>
                    <button onClick={() => router.push('/')}>Go to Dashboard</button>
                </div>
            );
        }
    }

    // Authenticated and authorized
    return <>{children}</>;
}

/**
 * Admin Only Route
 * Shorthand for admin-only pages
 */
export function AdminRoute({ children, fallback }) {
    return (
        <ProtectedRoute requiredRoles={['admin']} fallback={fallback}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Manager or Admin Route
 * Shorthand for management pages
 */
export function ManagerRoute({ children, fallback }) {
    return (
        <ProtectedRoute requiredRoles={['admin', 'manager']} fallback={fallback}>
            {children}
        </ProtectedRoute>
    );
}
