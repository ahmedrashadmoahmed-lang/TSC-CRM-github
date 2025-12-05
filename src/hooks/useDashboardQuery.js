'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchDashboardData() {
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

  if (!result.success) {
    throw new Error(result.error || 'خطأ غير معروف');
  }

  return result.data;
}

export function useDashboardQuery() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    // Refetch every 60 seconds
    refetchInterval: 60000,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Provide default empty data structure
    initialData: {
      kpis: {},
      topCustomers: [],
      topDeals: [],
      activities: [],
    },
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error?.message || null,
    refresh: query.refetch,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}

export default useDashboardQuery;
