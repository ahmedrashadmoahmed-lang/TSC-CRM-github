// React Query Configuration for Data Caching
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Stale time: 5 minutes
                staleTime: 5 * 60 * 1000,
                // Cache time: 10 minutes
                cacheTime: 10 * 60 * 1000,
                // Retry failed requests
                retry: 2,
                // Refetch on window focus
                refetchOnWindowFocus: false,
                // Refetch on reconnect
                refetchOnReconnect: true,
                // Refetch on mount
                refetchOnMount: true,
            },
            mutations: {
                // Retry failed mutations
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

// Custom hooks for common queries
export function useKPIsQuery(refreshInterval = 60000) {
    return useQuery({
        queryKey: ['kpis'],
        queryFn: async () => {
            const response = await fetch('/api/dashboard/kpis');
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        refetchInterval: refreshInterval,
    });
}

export function useSalesCycleQuery(days = 30) {
    return useQuery({
        queryKey: ['sales-cycle', days],
        queryFn: async () => {
            const response = await fetch(`/api/analytics/sales-cycle?days=${days}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
}

export function useLeadScoreMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leadData) => {
            const response = await fetch('/api/ai/lead-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadData }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries(['leads']);
        },
    });
}
