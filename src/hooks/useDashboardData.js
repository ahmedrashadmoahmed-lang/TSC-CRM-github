import { useState, useEffect, useCallback } from 'react';

export function useDashboardData(refreshInterval = 60000) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard');

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setLastUpdated(new Date());
                setError(null);
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Auto-refresh
        if (refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval]);

    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        refresh,
    };
}

export default useDashboardData;
