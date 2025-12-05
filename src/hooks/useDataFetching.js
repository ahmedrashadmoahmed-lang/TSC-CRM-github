import { useState, useEffect } from 'react';

export function usePipelineData() {
    const [deals, setDeals] = useState({ leads: [], quotes: [], negotiations: [], won: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/opportunities');

                if (!res.ok) {
                    throw new Error('Failed to fetch opportunities');
                }

                const data = await res.json();

                // Group opportunities by stage
                const grouped = {
                    leads: data.filter(d => d.stage === 'lead'),
                    quotes: data.filter(d => d.stage === 'quote'),
                    negotiations: data.filter(d => d.stage === 'negotiation'),
                    won: data.filter(d => d.stage === 'won')
                };

                setDeals(grouped);
                setError(null);
            } catch (err) {
                console.error('Error fetching opportunities:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
    }, []);

    const refetch = () => {
        setLoading(true);
        fetchOpportunities();
    };

    return { deals, loading, error, refetch };
}

export function usePOData() {
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPOs = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/po');

                if (!res.ok) {
                    throw new Error('Failed to fetch purchase orders');
                }

                const data = await res.json();
                setPOs(data.data || data); // Handle both {success, data} and direct array responses
                setError(null);
            } catch (err) {
                console.error('Error fetching POs:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPOs();
    }, []);

    const refetch = () => {
        setLoading(true);
        fetchPOs();
    };

    return { pos, loading, error, refetch };
}
