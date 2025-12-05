// Lazy Loading Wrapper for Heavy Components
'use client';

import { lazy, Suspense } from 'react';
import { ChartSkeleton, CardSkeleton } from '@/components/common/LoadingSkeleton';

// Lazy load heavy chart components
export const LazyRechartsComponents = {
    AreaChart: lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart }))),
    BarChart: lazy(() => import('recharts').then(mod => ({ default: mod.BarChart }))),
    LineChart: lazy(() => import('recharts').then(mod => ({ default: mod.LineChart }))),
    PieChart: lazy(() => import('recharts').then(mod => ({ default: mod.PieChart }))),
};

// Lazy load dashboard components
export const LazySalesCycleChart = lazy(() => import('@/components/dashboard/SalesCycleChart'));
export const LazyLeadScoreCard = lazy(() => import('@/components/dashboard/LeadScoreCard'));
export const LazyAIInsightsPanel = lazy(() => import('@/components/dashboard/AIInsightsPanel'));
export const LazyConversionFunnel = lazy(() => import('@/components/dashboard/ConversionFunnel'));

// Wrapper component with suspense
export function LazyChart({ component: Component, fallback, ...props }) {
    return (
        <Suspense fallback={fallback || <ChartSkeleton />}>
            <Component {...props} />
        </Suspense>
    );
}

// Wrapper for card components
export function LazyCard({ component: Component, fallback, ...props }) {
    return (
        <Suspense fallback={fallback || <CardSkeleton />}>
            <Component {...props} />
        </Suspense>
    );
}

// Usage example:
// <LazyChart component={LazySalesCycleChart} />
// <LazyCard component={LazyLeadScoreCard} leadData={data} />
