// Dashboard TypeScript Interfaces

export interface KPI {
    value: number;
    trend: number;
    sparkline: number[];
    label: string;
    unit?: string;
    action?: string;
    status?: 'success' | 'warning' | 'danger' | 'normal';
    count?: number;
    total?: number;
}

export interface DashboardKPIs {
    totalClients: KPI;
    newLeads: KPI;
    openDeals: KPI & { totalValue: number };
    conversionRate: KPI;
    pendingTasks: KPI & { overdue: number };
    overdueInvoices?: KPI;
    lowStock?: KPI;
    cashCollections?: KPI;
    pendingRFQs?: KPI;
}

export interface Suggestion {
    id: string;
    title: string;
    customer: string;
    value: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
}

export interface Client {
    id: string;
    name: string;
    lastActivity: string;
    riskLevel: 'high' | 'medium' | 'low';
}

export interface Opportunity {
    id: string;
    title: string;
    customer: string;
    value: number;
    probability: number;
    potentialScore: number;
}

export interface AIInsightsData {
    followUpSuggestions: {
        high: Suggestion[];
        medium: Suggestion[];
        low: Suggestion[];
    };
    atRiskClients: Client[];
    highPotentialOpportunities: Opportunity[];
    performanceNotes: string[];
}

export interface Activity {
    id: string;
    type: 'invoice' | 'opportunity' | 'purchase_order' | 'task' | 'call' | 'email';
    description: string;
    timestamp: Date | string;
    employee?: string;
    team?: string;
    stage?: string;
    amount?: number;
}

export interface ActivityFilters {
    employee?: string;
    team?: string;
    stage?: string;
    type?: string;
    page?: number;
    limit?: number;
}

export interface ActivityResponse {
    activities: Activity[];
    total: number;
    page: number;
    totalPages: number;
}

export interface SearchResult {
    id: string;
    type: 'client' | 'deal' | 'task' | 'ticket' | 'contact';
    title: string;
    description: string;
    relevance: number;
    metadata?: Record<string, any>;
}

export interface AIActionSuggestion {
    action: string;
    confidence: number;
    reason: string;
    icon?: string;
}

export interface SearchRequest {
    query: string;
    filters?: {
        type?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
    };
}

export interface SearchResponse {
    results: SearchResult[];
    suggestions: AIActionSuggestion[];
    total: number;
}

export interface Alert {
    id: string;
    type: 'overdue_task' | 'at_risk_deal' | 'new_deal' | 'low_stock' | 'overdue_invoice';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}

export interface NotificationSettings {
    email: boolean;
    slack: boolean;
    onScreen: boolean;
    types: string[];
}

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface SalesFunnelData {
    stage: string;
    count: number;
    value: number;
    conversionRate?: number;
}

export interface TeamPerformanceData {
    teamMember: string;
    deals: number;
    revenue: number;
    conversionRate: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    target?: number;
}

export interface HeatmapData {
    day: string;
    hour: number;
    activity: number;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    action: () => void;
    color?: string;
}

export interface BulkAction {
    id: string;
    label: string;
    action: (selectedIds: string[]) => Promise<void>;
    requiresConfirmation?: boolean;
}
