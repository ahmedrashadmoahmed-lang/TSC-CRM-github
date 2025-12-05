// Real Pipeline Data Hook
// Connects to real database API with advanced features

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useRealPipeline(tenantId = 'default', stage = null) {
    return useQuery({
        queryKey: ['pipeline-real', tenantId, stage],
        queryFn: async () => {
            const url = `/api/pipeline/real?tenantId=${tenantId}${stage ? `&stage=${stage}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch pipeline data');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Unknown error');
            }
            return result.data;
        },
        refetchInterval: 30000,
        staleTime: 10000,
        retry: 3
    });
}

// Hook for creating new opportunity
export function useCreateOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (opportunityData) => {
            const response = await fetch('/api/pipeline/real', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(opportunityData)
            });
            if (!response.ok) {
                throw new Error('Failed to create opportunity');
            }
            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch pipeline data
            queryClient.invalidateQueries({ queryKey: ['pipeline-real'] });
        }
    });
}

// Hook for updating opportunity
export function useUpdateOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(`/api/opportunities/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to update opportunity');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipeline-real'] });
        }
    });
}

// Hook for pipeline metrics
export function usePipelineMetrics(tenantId = 'default') {
    const { data, ...rest } = useRealPipeline(tenantId);
    return {
        metrics: data?.metrics || {},
        ...rest
    };
}

// Hook for deals by stage
export function useDealsByStage(tenantId = 'default') {
    const { data, ...rest } = useRealPipeline(tenantId);
    return {
        deals: data?.deals || {},
        ...rest
    };
}
