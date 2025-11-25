# Dashboard Components Documentation

## Overview

Dashboard components for displaying analytics, statistics, and charts in the Enterprise ERP system.

## Components

### 1. StatCard

Display key statistics with optional trends.

**Props:**
- `title` - Card title
- `value` - Main value to display
- `icon` - Icon emoji or component
- `trend` - Percentage change (optional)
- `trendLabel` - Label for trend (optional)
- `color` - Color variant: 'primary', 'success', 'warning', 'error', 'info'
- `loading` - Loading state

**Usage:**
```jsx
<StatCard
  title="إجمالي الإيرادات"
  value={formatCurrency(totalRevenue)}
  icon="💰"
  trend={12.5}
  trendLabel="من الشهر الماضي"
  color="success"
/>
```

---

### 2. ChartCard

Wrapper for charts with title, subtitle, and actions.

**Props:**
- `title` - Chart title
- `subtitle` - Chart subtitle (optional)
- `children` - Chart content
- `actions` - Action buttons (optional)
- `loading` - Loading state

**Usage:**
```jsx
<ChartCard
  title="الإيرادات الشهرية"
  subtitle="آخر 12 شهر"
  actions={<button>تصدير</button>}
>
  <SimpleBarChart data={data} />
</ChartCard>
```

---

### 3. SimpleBarChart

Simple bar chart with tooltips and hover effects.

**Props:**
- `data` - Array of data objects
- `xKey` - Key for x-axis labels (default: 'label')
- `yKey` - Key for y-axis values (default: 'value')
- `color` - Bar color (default: primary color)
- `height` - Chart height in pixels (default: 300)
- `showValues` - Show values on bars (default: false)
- `formatValue` - Value formatter function

**Usage:**
```jsx
<SimpleBarChart
  data={[
    { month: '2024-01', revenue: 50000 },
    { month: '2024-02', revenue: 65000 },
  ]}
  xKey="month"
  yKey="revenue"
  formatValue={formatCurrency}
  height={300}
/>
```

---

## Complete Dashboard Example

```jsx
'use client';

import { useFetch } from '@/hooks';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import SimpleBarChart from '@/components/dashboard/SimpleBarChart';
import { formatCurrency, formatNumber } from '@/utils/helpers';

export default function Dashboard() {
  const { data, loading } = useFetch('/api/analytics/dashboard');

  return (
    <div className="dashboard">
      {/* Statistics */}
      <div className="stats-grid">
        <StatCard
          title="إجمالي العملاء"
          value={formatNumber(data?.totalCustomers)}
          icon="👥"
          color="primary"
          loading={loading}
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(data?.totalRevenue)}
          icon="💰"
          trend={12.5}
          trendLabel="من الشهر الماضي"
          color="success"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <ChartCard
        title="الإيرادات الشهرية"
        loading={loading}
      >
        <SimpleBarChart
          data={data?.monthlyRevenue || []}
          xKey="month"
          yKey="revenue"
          formatValue={formatCurrency}
        />
      </ChartCard>
    </div>
  );
}
```

---

## Analytics Service

### Available Endpoints

**Dashboard Stats:**
```javascript
GET /api/analytics/dashboard
```

**Sales Analytics:**
```javascript
GET /api/analytics/sales?startDate=2024-01-01&endDate=2024-12-31
```

**Customer Analytics:**
```javascript
GET /api/analytics/customers
```

**Financial Summary:**
```javascript
GET /api/analytics/financial?startDate=2024-01-01&endDate=2024-12-31
```

---

## Service Methods

### AnalyticsService

```javascript
import { AnalyticsService } from '@/services/AnalyticsService';

const service = new AnalyticsService(
  tenantId,
  tenantSettings,
  userId,
  userName,
  userEmail
);

// Dashboard statistics
const stats = await service.getDashboardStats();

// Sales analytics
const sales = await service.getSalesAnalytics(startDate, endDate);

// Customer analytics
const customers = await service.getCustomerAnalytics();

// Inventory analytics
const inventory = await service.getInventoryAnalytics();

// Financial summary
const financial = await service.getFinancialSummary(startDate, endDate);

// Performance metrics
const performance = await service.getPerformanceMetrics();
```

---

## Styling

All dashboard components use CSS variables for theming:

```css
--primary-color
--primary-light
--bg-primary
--bg-secondary
--bg-tertiary
--card-bg
--text-primary
--text-secondary
--border-color
--shadow-sm
--shadow-md
--shadow-lg
```

---

## Best Practices

1. **Always show loading states** using the `loading` prop
2. **Format values** using utility functions (formatCurrency, formatNumber)
3. **Use appropriate colors** for different stat types
4. **Add trends** to show performance changes
5. **Keep charts simple** and easy to read
6. **Use ChartCard** wrapper for consistent styling
7. **Handle empty data** gracefully

---

**Total Components: 3**
**Production-Ready: ✅**
