'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './AIInsightsPanel.module.css';

interface Suggestion {
    id: string;
    title: string;
    customer: string;
    value: number;
    reason: string;
}

interface Client {
    id: string;
    name: string;
    lastActivity: string;
    riskLevel: string;
}

interface Opportunity {
    id: string;
    title: string;
    customer: string;
    value: number;
    probability: number;
    potentialScore: number;
}

interface AIInsightsData {
    followUpSuggestions: {
        high: Suggestion[];
        medium: Suggestion[];
        low: Suggestion[];
    };
    atRiskClients: Client[];
    highPotentialOpportunities: Opportunity[];
    performanceNotes: string[];
}

export function AIInsightsPanel() {
    const [data, setData] = useState<AIInsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'followups' | 'atrisk' | 'opportunities' | 'notes'>('followups');

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/ai-insights');

            if (!response.ok) throw new Error('Failed to fetch insights');

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (err) {
            console.error('Failed to load AI insights:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Generating AI insights...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>Failed to load insights</p>
            </div>
        );
    }

    const renderFollowUps = () => (
        <div className={styles.content}>
            {['high', 'medium', 'low'].map((priority) => {
                const suggestions = data.followUpSuggestions[priority as keyof typeof data.followUpSuggestions];
                if (suggestions.length === 0) return null;

                return (
                    <div key={priority} className={styles.prioritySection}>
                        <h4 className={`${styles.priorityTitle} ${styles[priority]}`}>
                            {priority.toUpperCase()} Priority ({suggestions.length})
                        </h4>
                        <div className={styles.suggestionsList}>
                            {suggestions.map((suggestion) => (
                                <div key={suggestion.id} className={styles.suggestionCard}>
                                    <div className={styles.suggestionHeader}>
                                        <h5>{suggestion.title}</h5>
                                        <span className={styles.value}>${suggestion.value.toLocaleString()}</span>
                                    </div>
                                    <p className={styles.customer}>{suggestion.customer}</p>
                                    <p className={styles.reason}>{suggestion.reason}</p>
                                    <div className={styles.actions}>
                                        <Button size="sm" onClick={() => window.location.href = `/pipeline/${suggestion.id}`}>
                                            View Deal
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderAtRisk = () => (
        <div className={styles.content}>
            {data.atRiskClients.length === 0 ? (
                <p className={styles.empty}>No at-risk clients detected</p>
            ) : (
                <div className={styles.clientsList}>
                    {data.atRiskClients.map((client) => (
                        <div key={client.id} className={styles.clientCard}>
                            <div className={styles.clientHeader}>
                                <h5>{client.name}</h5>
                                <span className={`${styles.badge} ${styles[client.riskLevel]}`}>
                                    {client.riskLevel} risk
                                </span>
                            </div>
                            <p className={styles.lastActivity}>
                                Last activity: {new Date(client.lastActivity).toLocaleDateString()}
                            </p>
                            <Button size="sm" variant="outline" onClick={() => window.location.href = `/customers/${client.id}`}>
                                Contact Client
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderOpportunities = () => (
        <div className={styles.content}>
            {data.highPotentialOpportunities.length === 0 ? (
                <p className={styles.empty}>No high-potential opportunities</p>
            ) : (
                <div className={styles.opportunitiesList}>
                    {data.highPotentialOpportunities.map((opp) => (
                        <div key={opp.id} className={styles.opportunityCard}>
                            <h5>{opp.title}</h5>
                            <p className={styles.customer}>{opp.customer}</p>
                            <div className={styles.oppStats}>
                                <span>Value: ${opp.value.toLocaleString()}</span>
                                <span>Probability: {opp.probability}%</span>
                                <span>Score: {opp.potentialScore}</span>
                            </div>
                            <Button size="sm" onClick={() => window.location.href = `/pipeline/${opp.id}`}>
                                View Details
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderNotes = () => (
        <div className={styles.content}>
            <div className={styles.notesList}>
                {data.performanceNotes.map((note, index) => (
                    <div key={index} className={styles.noteCard}>
                        <FileText size={20} />
                        <p>{note}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'followups' ? styles.active : ''}`}
                    onClick={() => setActiveTab('followups')}
                >
                    <Lightbulb size={16} />
                    Follow-ups
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'atrisk' ? styles.active : ''}`}
                    onClick={() => setActiveTab('atrisk')}
                >
                    <AlertTriangle size={16} />
                    At-Risk
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'opportunities' ? styles.active : ''}`}
                    onClick={() => setActiveTab('opportunities')}
                >
                    <TrendingUp size={16} />
                    Opportunities
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'notes' ? styles.active : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    <FileText size={16} />
                    Notes
                </button>
            </div>

            {activeTab === 'followups' && renderFollowUps()}
            {activeTab === 'atrisk' && renderAtRisk()}
            {activeTab === 'opportunities' && renderOpportunities()}
            {activeTab === 'notes' && renderNotes()}
        </div>
    );
}

export default AIInsightsPanel;
