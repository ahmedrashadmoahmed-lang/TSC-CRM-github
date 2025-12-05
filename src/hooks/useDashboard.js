'use client';

import { useState, useEffect, useCallback } from 'react';

export function useKPIs(refreshInterval = 60000) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchKPIs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/kpis');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch KPIs');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKPIs();

        if (refreshInterval > 0) {
            const interval = setInterval(fetchKPIs, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchKPIs, refreshInterval]);

    return { data, loading, error, refresh: fetchKPIs };
}

export function useAIInsights() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/dashboard/ai-insights');
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                    setError(null);
                } else {
                    setError(result.error || 'Failed to fetch insights');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    return { data, loading, error };
}

export function useRecentActivity(filters = {}, limit = 10) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const fetchActivity = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ...filters,
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await fetch(`/api/dashboard/recent-activity?${params}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data.activities || []);
                setPagination({
                    page: result.data.page || 1,
                    totalPages: result.data.totalPages || 1
                });
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch activity');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, limit]);

    useEffect(() => {
        fetchActivity(1);
    }, [fetchActivity]);

    return {
        data,
        loading,
        error,
        pagination,
        loadPage: fetchActivity
    };
}

export function useAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ai/alerts');
            const result = await response.json();

            if (result.success) {
                setAlerts(result.data || []);
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch alerts');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const dismissAlert = useCallback(async (alertId) => {
        try {
            await fetch(`/api/ai/alerts/${alertId}`, {
                method: 'DELETE'
            });
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (err) {
            console.error('Failed to dismiss alert:', err);
        }
    }, []);

    const markAsRead = useCallback(async (alertId) => {
        try {
            await fetch(`/api/ai/alerts/${alertId}/read`, {
                method: 'POST'
            });
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, read: true } : a
            ));
        } catch (err) {
            console.error('Failed to mark alert as read:', err);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();

        // Refresh alerts every 2 minutes
        const interval = setInterval(fetchAlerts, 120000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    return {
        alerts,
        loading,
        error,
        dismissAlert,
        markAsRead,
        refresh: fetchAlerts
    };
}

export function useSalesFunnel() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFunnel = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/analytics/sales-funnel');
                const result = await response.json();

                if (result.success) {
                    setData(result.data || []);
                    setError(null);
                } else {
                    setError(result.error || 'Failed to fetch funnel data');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFunnel();
    }, []);

    return { data, loading, error };
}
