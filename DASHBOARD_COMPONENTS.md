# Dashboard Enhancement - Components Documentation

## Overview

This document describes the enhanced dashboard components created to improve the CRM system with AI-powered features, advanced visualizations, and better user experience.

---

## New Components

### 1. SparklineChart

**Location:** `src/components/dashboard/SparklineChart.js`

**Purpose:** Displays mini trend charts within KPI cards to show data trends over the last 7 days.

**Features:**
- SVG-based rendering for crisp display
- Gradient fill for visual appeal
- Interactive dots on hover
- Customizable colors and dimensions

**Usage:**
```javascript
import SparklineChart from '@/components/dashboard/SparklineChart';

<SparklineChart 
    data={[10, 15, 12, 18, 20, 17, 22]} 
    color="#007bff"
    height={30}
    width={120}
/>
```

---

### 2. Enhanced KPICard

**Location:** `src/components/dashboard/KPICard.tsx`

**Enhancements:**
- Added sparkline chart support
- Color-coded status indicators
- Clickable cards for navigation
- Loading states with skeleton
- Trend indicators with icons

**Props:**
```typescript
{
    title: string;
    value: number | string;
    trend?: number;
    unit?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    loading?: boolean;
    status?: 'success' | 'warning' | 'danger' | 'normal';
    sparkline?: number[];
}
```

**Usage:**
```javascript
<KPICard
    title="Total Clients"
    value={150}
    trend={12.5}
    sparkline={[10, 15, 12, 18, 20, 17, 22]}
    icon={<Users size={24} />}
    onClick={() => navigate('/clients')}
    status="success"
/>
```

---

### 3. SmartSearch

**Location:** `src/components/dashboard/SmartSearch.js`

**Features:**
- AI-powered search across multiple entities
- Debounced input (300ms)
- Autocomplete suggestions
- Highlighted search matches
- Intelligent action suggestions
- Search history support

**Searches:**
- Clients
- Deals
- Tasks
- Tickets
- Contacts

**AI Suggestions:**
- Create new entries
- Schedule follow-ups
- Update records
- Navigate to related items

**Usage:**
```javascript
import SmartSearch from '@/components/dashboard/SmartSearch';

<SmartSearch />
```

---

### 4. SalesFunnelChart

**Location:** `src/components/dashboard/SalesFunnelChart.js`

**Features:**
- Color-coded stages
- Interactive tooltips
- Conversion rate display
- Responsive design
- Drill-down capability

**Data Format:**
```javascript
[
    { stage: 'Lead', count: 45, value: 450000, conversionRate: 100 },
    { stage: 'Qualified', count: 32, value: 380000, conversionRate: 71 },
    { stage: 'Proposal', count: 24, value: 290000, conversionRate: 53 },
    { stage: 'Negotiation', count: 15, value: 210000, conversionRate: 33 },
    { stage: 'Won', count: 8, value: 120000, conversionRate: 18 }
]
```

**Usage:**
```javascript
<SalesFunnelChart data={funnelData} />
```

---

### 5. AlertsPanel

**Location:** `src/components/dashboard/AlertsPanel.js`

**Features:**
- Notification bell with badge
- Dropdown panel
- Severity-based styling (info, warning, error, success)
- Mark as read/unread
- Dismiss alerts
- Relative timestamps
- Action URLs

**Alert Types:**
- `overdue_task`
- `at_risk_deal`
- `new_deal`
- `low_stock`
- `overdue_invoice`

**Usage:**
```javascript
<AlertsPanel 
    alerts={alerts}
    onDismiss={(id) => handleDismiss(id)}
    onMarkAsRead={(id) => handleMarkAsRead(id)}
/>
```

---

## API Endpoints

### Enhanced KPIs Endpoint

**URL:** `/api/dashboard/kpis`

**Response:**
```json
{
    "success": true,
    "data": {
        "totalClients": {
            "value": 150,
            "trend": 12.5,
            "sparkline": [10, 15, 12, 18, 20, 17, 22]
        },
        "newLeads": {
            "value": 45,
            "trend": -5.2,
            "sparkline": [8, 12, 10, 15, 18, 14, 16]
        },
        ...
    }
}
```

### AI Search Endpoint

**URL:** `/api/search/ai`

**Method:** POST

**Request:**
```json
{
    "query": "john doe",
    "filters": {
        "type": "client"
    }
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "results": [
            {
                "id": "123",
                "type": "client",
                "title": "John Doe",
                "subtitle": "john@example.com",
                "url": "/customers/123",
                "matchScore": 95
            }
        ],
        "suggestions": [
            {
                "action": "view",
                "text": "View John Doe's profile",
                "icon": "👁️",
                "url": "/customers/123"
            }
        ]
    }
}
```

---

## Styling Guidelines

All components follow these design principles:

- **White Background:** `#ffffff`
- **Primary Color:** `#007bff` (Blue)
- **Success:** `#28a745` (Green)
- **Warning:** `#ffc107` (Yellow)
- **Danger:** `#dc3545` (Red)
- **Text Primary:** `#212529`
- **Text Secondary:** `#6c757d`
- **Border:** `#dee2e6`

**Spacing:**
- XS: 0.25rem
- SM: 0.5rem
- MD: 1rem
- LG: 1.5rem
- XL: 2rem

**Border Radius:**
- SM: 4px
- MD: 8px
- LG: 12px

---

## Accessibility

All components include:

- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast ratio ≥ 4.5:1

---

## Responsive Design

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

All components are fully responsive and adapt to different screen sizes.

---

## Testing

Run tests with:
```bash
npm test
```

Test files are located alongside component files with `.test.js` extension.

---

## Performance

Optimizations implemented:
- Debounced search (300ms)
- Lazy loading for charts
- Memoized components
- Virtual scrolling for long lists
- Code splitting

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Future Enhancements

- [ ] Real-time updates via WebSocket
- [ ] Export functionality for charts
- [ ] Advanced filtering options
- [ ] Customizable dashboard layouts
- [ ] Dark mode support
