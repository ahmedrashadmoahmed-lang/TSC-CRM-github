// Real Dashboard Data Hook
// Connects to real database API with React Query

import { useQuery } from '@tanstack/react-query';

export function useRealDashboard(tenantId = 'default') {
    return useQuery({
        queryKey: ['dashboard-real', tenantId],
        queryFn: async () => {
            const response = await fetch(`/api/dashboard/real?tenantId=${tenantId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Unknown error');
            }
            return result.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    });
}

// Hook for specific KPIs
export function useDashboardKPIs(tenantId = 'default') {
    const { data, ...rest } = useRealDashboard(tenantId);
    return {
        kpis: data?.kpis || {},
        ...rest
    };
}

// Hook for opportunities with health scores
export function useDashboardOpportunities(tenantId = 'default') {
    const { data, ...rest } = useRealDashboard(tenantId);
    return {
        opportunities: data?.opportunities || [],
        ...rest
    };
}

// Hook for dashboard stats
export function useDashboardStats(tenantId = 'default') {
    const { data, ...rest } = useRealDashboard(tenantId);
    return {
        stats: data?.stats || {},
        ...rest
    };
}
