'use client';

import { useCallback, useEffect, useState } from 'react';

export function useDashboardData(refreshInterval = 60000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mounted, setMounted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');

      // Check if response is HTML (redirect to login)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('غير مصرح - يرجى تسجيل الدخول');
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('غير مصرح - يرجى تسجيل الدخول');
        }
        throw new Error(`خطأ في الخادم: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || 'خطأ غير معروف');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      // Only set error if component is mounted to prevent hydration mismatch
      if (mounted) {
        setError(err.message);
      }
      // Set empty data to prevent undefined errors
      setData({
        kpis: {},
        topCustomers: [],
        topDeals: [],
        activities: [],
      });
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
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
