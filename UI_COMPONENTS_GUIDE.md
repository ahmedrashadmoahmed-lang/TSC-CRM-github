# UI Components Implementation Guide

## 🎨 Missing UI Components

Based on the completed engines and APIs, here are the UI components that need to be built:

---

## Phase 1 Components

### 1. Lost Reasons Modal ✅ (Already Created)
- Location: `src/components/opportunities/LostReasonModal.js`
- Status: Complete

### 2. Lost Reasons Analytics Dashboard ✅ (Already Created)
- Location: `src/components/analytics/LostReasonsAnalytics.js`
- Status: Complete

### 3. Pipeline Hygiene Dashboard ✅ (Already Created)
- Location: `src/components/pipeline/PipelineHygieneDashboard.js`
- Status: Complete

### 4. Deal Health Indicator ✅ (Already Created)
- Location: `src/components/deals/DealHealthIndicator.js`
- Status: Complete

### 5. Deal Velocity Dashboard ✅ (Already Created)
- Location: `src/components/analytics/DealVelocityDashboard.js`
- Status: Complete

---

## Phase 2 Components (Need Implementation)

### 6. Sales Velocity Dashboard ✅ (Already Created)
- Location: `src/components/dashboard/SalesVelocityDashboard.js`
- Status: Complete

### 7. Deal Score Card ⏳
**Purpose**: Display multi-dimensional deal scores

**Location**: `src/components/deals/DealScoreCard.js`

**Features**:
- Total score display (0-100)
- Letter grade (A+ to F)
- Score breakdown by factor
- Priority badge
- Recommendations list

### 8. Churn Risk Dashboard ⏳
**Purpose**: Display customer churn risk analysis

**Location**: `src/components/analytics/ChurnRiskDashboard.js`

**Features**:
- Risk score gauge
- Risk level indicator
- Factor breakdown
- Retention strategies
- At-risk customers list

### 9. Next Action Suggestions ⏳
**Purpose**: Display AI-powered follow-up recommendations

**Location**: `src/components/opportunities/NextActionSuggestions.js`

**Features**:
- Top suggestion card
- All suggestions list
- Confidence indicator
- One-click actions
- Reasoning explanation

---

## Phase 3 Components (Need Implementation)

### 10. Report Builder ⏳
**Purpose**: Create custom reports with filters

**Location**: `src/components/reports/ReportBuilder.js`

**Features**:
- Filter builder
- Column selector
- Grouping options
- Sort controls
- Export buttons
- Schedule configuration

### 11. Forecast Scenario Planner ⏳
**Purpose**: What-if analysis interface

**Location**: `src/components/analytics/ScenarioPlanner.js`

**Features**:
- Scenario sliders
- Impact visualization
- Baseline comparison
- Multiple scenarios
- Save scenarios

### 12. RFM Matrix ⏳
**Purpose**: Customer segmentation visualization

**Location**: `src/components/analytics/RFMMatrix.js`

**Features**:
- 2D matrix visualization
- Segment colors
- Customer counts
- Drill-down capability
- Segment actions

---

## Phase 4 Components (Need Implementation)

### 13. Marketing ROI Dashboard ⏳
**Purpose**: Campaign performance tracking

**Location**: `src/components/marketing/MarketingROIDashboard.js`

**Features**:
- ROI by campaign
- Source attribution
- Conversion funnels
- Cost per lead
- Revenue attribution

### 14. Communication Panel ⏳
**Purpose**: Unified communication interface

**Location**: `src/components/communication/CommunicationPanel.js`

**Features**:
- Channel selector (Email/SMS/WhatsApp)
- Message composer
- Template selector
- Communication history
- Quick actions

### 15. Workflow Builder ⏳
**Purpose**: Visual workflow designer

**Location**: `src/components/workflows/WorkflowBuilder.js`

**Features**:
- Drag-and-drop interface
- Trigger configuration
- Action blocks
- Delay settings
- Visual flow diagram

### 16. Feedback Dashboard ⏳
**Purpose**: NPS and feedback visualization

**Location**: `src/components/feedback/FeedbackDashboard.js`

**Features**:
- NPS score gauge
- Sentiment distribution
- Feedback timeline
- Response rate
- Action items

---

## Phase 5 Components (Need Implementation)

### 17. Leaderboard ⏳
**Purpose**: Gamification leaderboard

**Location**: `src/components/gamification/Leaderboard.js`

**Features**:
- Ranked list
- Points display
- Badges showcase
- Period selector
- Team comparison

### 18. Territory Map ⏳
**Purpose**: Territory visualization and management

**Location**: `src/components/territory/TerritoryMap.js`

**Features**:
- Geographic map
- Territory boundaries
- Load indicators
- Assignment interface
- Balance recommendations

### 19. Competitor Battle Cards ⏳
**Purpose**: Competitive intelligence display

**Location**: `src/components/competitors/BattleCards.js`

**Features**:
- Competitor profiles
- Strengths/weaknesses
- Win strategies
- Pricing comparison
- Talking points

### 20. Deal Room ⏳
**Purpose**: Collaborative deal workspace

**Location**: `src/components/dealrooms/DealRoom.js`

**Features**:
- Document library
- Stakeholder list
- Activity feed
- Engagement metrics
- Health indicator

---

## Phase 6 Components (Need Implementation)

### 21. Permissions Manager ⏳
**Purpose**: Role and permission configuration

**Location**: `src/components/admin/PermissionsManager.js`

**Features**:
- Role list
- Permission matrix
- User assignment
- Audit log viewer
- Field-level security

### 22. Currency Converter ⏳
**Purpose**: Multi-currency management

**Location**: `src/components/finance/CurrencyConverter.js`

**Features**:
- Currency selector
- Live conversion
- Rate display
- Multi-currency totals
- Historical rates

### 23. Custom Field Builder ⏳
**Purpose**: Create custom fields and objects

**Location**: `src/components/admin/CustomFieldBuilder.js`

**Features**:
- Field type selector
- Validation rules
- Default values
- Entity selector
- Preview

### 24. Webhook Manager ⏳
**Purpose**: Webhook configuration and monitoring

**Location**: `src/components/admin/WebhookManager.js`

**Features**:
- Webhook list
- Event selector
- URL configuration
- Test webhook
- Delivery logs

---

## 🎯 Implementation Priority

### High Priority (Core Features):
1. Deal Score Card
2. Churn Risk Dashboard
3. Next Action Suggestions
4. Report Builder
5. Communication Panel

### Medium Priority (Enhanced Features):
6. Workflow Builder
7. Feedback Dashboard
8. Leaderboard
9. Territory Map
10. Deal Room

### Low Priority (Admin Features):
11. Permissions Manager
12. Custom Field Builder
13. Webhook Manager
14. Currency Converter

---

## 📝 Component Template

```javascript
'use client';

import { useState, useEffect } from 'react';
import styles from './ComponentName.module.css';

export default function ComponentName({ tenantId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/endpoint?tenantId=${tenantId}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!data) return null;

    return (
        <div className={styles.container}>
            {/* Component content */}
        </div>
    );
}
```

---

## ✅ Next Steps

1. Create component files
2. Implement UI logic
3. Add CSS styling
4. Connect to APIs
5. Test functionality
6. Add to pages

**Estimated Time**: 15-20 hours for all components
