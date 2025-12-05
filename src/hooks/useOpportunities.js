import { useState, useEffect, useCallback } from 'react';

export function useOpportunities() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOpportunities = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/opportunities');

            if (!response.ok) {
                throw new Error('Failed to fetch opportunities');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Error fetching opportunities:', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOpportunities();
    }, [fetchOpportunities]);

    const refresh = useCallback(() => {
        fetchOpportunities();
    }, [fetchOpportunities]);

    const createOpportunity = useCallback(async (opportunityData) => {
        try {
            const response = await fetch('/api/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(opportunityData),
            });

            if (!response.ok) {
                throw new Error('Failed to create opportunity');
            }

            const result = await response.json();
            await refresh();
            return result;
        } catch (err) {
            console.error('Error creating opportunity:', err);
            throw err;
        }
    }, [refresh]);

    const updateOpportunity = useCallback(async (id, updates) => {
        try {
            const response = await fetch(`/api/opportunities/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update opportunity');
            }

            const result = await response.json();
            await refresh();
            return result;
        } catch (err) {
            console.error('Error updating opportunity:', err);
            throw err;
        }
    }, [refresh]);

    const deleteOpportunity = useCallback(async (id) => {
        try {
            const response = await fetch(`/api/opportunities/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete opportunity');
            }

            await refresh();
        } catch (err) {
            console.error('Error deleting opportunity:', err);
            throw err;
        }
    }, [refresh]);

    return {
        data,
        loading,
        error,
        refresh,
        createOpportunity,
        updateOpportunity,
        deleteOpportunity,
    };
}

export default useOpportunities;
