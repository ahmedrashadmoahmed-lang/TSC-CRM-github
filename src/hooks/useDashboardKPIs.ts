'use client';

import { useState, useEffect, useCallback } from 'react';

interface KPIData {
    totalClients: { value: number; trend: number };
    newLeads: { value: number; trend: number };
    openDeals: { value: number; totalValue: number; trend: number };
    conversionRate: { value: number; trend: number };
    pendingTasks: { value: number; overdue: number };
}

export function useDashboardKPIs() {
    const [data, setData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKPIs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/kpis');

            if (!response.ok) {
                throw new Error('Failed to fetch KPIs');
            }

            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setError(null);
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (err) {
            console.error('KPIs fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKPIs();
    }, [fetchKPIs]);

    return { data, loading, error, refresh: fetchKPIs };
}
