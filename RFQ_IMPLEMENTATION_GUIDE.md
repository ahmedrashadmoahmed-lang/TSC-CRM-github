# 🚀 RFQ System - Implementation Guide

## 📋 Overview

This guide will help you integrate and use the advanced RFQ (Request for Quotation) system with AI-powered features.

**Version**: 2.0
**Date**: 2025-11-26
**Status**: Production Ready ✅

---

## 🎯 Features Summary

### Core Features (100% Complete)
1. ✅ **Multi-Stage Workflow** - 9-stage RFQ lifecycle management
2. ✅ **Dynamic Templates** - Customizable RFQ templates with 8 categories
3. ✅ **Quote Comparison** - Intelligent quote evaluation and ranking
4. ✅ **Alerts & Notifications** - 8 types of smart alerts

### AI Features (100% Complete)
5. ✅ **AI Supplier Recommendations** - Multi-factor supplier ranking
6. ✅ **Cost Estimation AI** - ML-based price predictions
7. ✅ **Risk Analysis** - Comprehensive risk assessment (6 categories)
8. ✅ **Price Prediction** - Advanced time-series forecasting

### Analytics (100% Complete)
9. ✅ **RFQ Dashboard** - Comprehensive analytics and insights
10. ✅ **Performance Metrics** - KPIs and trend analysis

---

## 📦 Installation

### Step 1: Database Setup

Run the Prisma migrations to create all required tables:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name add_rfq_advanced_system

# Or push schema directly (development only)
npx prisma db push
```

### Step 2: Verify Database Models

Ensure these models exist in your `prisma/schema.prisma`:
- RFQ
- RFQItem
- RFQSupplier
- SupplierQuote
- QuoteItem
- RFQTimeline
- RFQAttachment
- QuoteAttachment
- RFQTemplate

### Step 3: Install Dependencies

All dependencies should already be in your `package.json`. If not:

```bash
npm install
```

### Step 4: Environment Variables

Ensure your `.env` file has:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

---

## 🔧 Usage

### 1. Creating an RFQ

```javascript
import RFQWorkflowEngine from '@/lib/rfqWorkflowEngine';

// Create RFQ via API
const response = await fetch('/api/rfq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tenantId: 'your-tenant-id',
        createdBy: 'user-id',
        title: 'Equipment Purchase',
        description: 'IT hardware procurement',
        items: [
            {
                productName: 'Laptop',
                quantity: 10,
                unit: 'pcs',
                specifications: { ram: '16GB', storage: '512GB SSD' }
            }
        ],
        suppliers: ['supplier-id-1', 'supplier-id-2'],
        deadline: '2025-12-31',
        budget: 50000,
        template: 'it_hardware'
    })
});

const rfq = await response.json();
```

### 2. Using Template Builder

```javascript
import TemplateBuilder from '@/components/rfq/TemplateBuilder';

function MyPage() {
    const handleSave = async (template) => {
        const response = await fetch('/api/rfq/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...template, tenantId: 'your-tenant-id' })
        });

        const saved = await response.json();
        console.log('Template saved:', saved);
    };

    return (
        <TemplateBuilder onSave={handleSave} />
    );
}
```

### 3. AI Supplier Recommendations

```javascript
import SupplierRecommendations from '@/components/rfq/SupplierRecommendations';

function RFQPage({ rfq, suppliers, historicalData }) {
    const handleSelectSuppliers = async (selectedIds) => {
        // Invite selected suppliers
        await fetch(`/api/rfq/${rfq.id}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supplierIds: selectedIds })
        });
    };

    return (
        <SupplierRecommendations
            rfq={rfq}
            suppliers={suppliers}
            historicalData={historicalData}
            onSelectSuppliers={handleSelectSuppliers}
        />
    );
}
```

### 4. Cost Estimation

```javascript
import CostEstimator from '@/components/rfq/CostEstimator';

function RFQCostPage({ rfqItems, historicalData, budget }) {
    return (
        <CostEstimator
            rfqItems={rfqItems}
            historicalData={historicalData}
            budget={budget}
        />
    );
}
```

### 5. Comprehensive Analysis

```javascript
// Get full analysis for an RFQ
const analyze = async (rfqId, tenantId) => {
    const response = await fetch('/api/rfq/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rfqId,
            tenantId,
            analysisTypes: ['all'] // or ['suppliers', 'cost', 'risk', 'prediction']
        })
    });

    const analysis = await response.json();

    console.log('Supplier Recommendations:', analysis.data.supplierRecommendations);
    console.log('Cost Estimation:', analysis.data.costEstimation);
    console.log('Risk Analysis:', analysis.data.riskAnalysis);
    console.log('Price Prediction:', analysis.data.pricePrediction);
};
```

### 6. Quote Comparison

```javascript
import QuoteComparison from '@/components/rfq/QuoteComparison';

function ComparePage({ rfqId, quotes }) {
    return (
        <QuoteComparison
            rfqId={rfqId}
            quotes={quotes}
        />
    );
}
```

### 7. Analytics Dashboard

```javascript
import RFQDashboard from '@/components/rfq/RFQDashboard';

function AnalyticsPage({ rfqs, quotes, suppliers }) {
    return (
        <RFQDashboard
            rfqs={rfqs}
            quotes={quotes}
            suppliers={suppliers}
        />
    );
}
```

---

## 📊 API Endpoints

### Core RFQ Operations

```javascript
// GET all RFQs
GET /api/rfq?tenantId=xxx&stage=draft

// GET single RFQ
GET /api/rfq?id=xxx

// POST create RFQ
POST /api/rfq
Body: { tenantId, createdBy, title, description, items, suppliers, ... }

// PATCH update RFQ
PATCH /api/rfq
Body: { rfqId, action: 'send' | 'move_to_comparing' | 'select_supplier' | ... }

// DELETE RFQ
DELETE /api/rfq?id=xxx
```

### Templates

```javascript
// GET templates
GET /api/rfq/templates?tenantId=xxx&category=equipment

// POST create template
POST /api/rfq/templates
Body: { tenantId, name, category, description, fields }

// PATCH update template
PATCH /api/rfq/templates
Body: { templateId, ... }

// DELETE template
DELETE /api/rfq/templates?id=xxx
```

### Analysis

```javascript
// POST comprehensive analysis
POST /api/rfq/analyze
Body: {
    rfqId: 'xxx',
    tenantId: 'xxx',
    analysisTypes: ['all'] // or specific types
}

// Returns:
{
    supplierRecommendations: [...],
    costEstimation: {...},
    riskAnalysis: {...},
    pricePrediction: {...},
    budgetComparison: {...}
}
```

### Analytics

```javascript
// GET dashboard metrics
GET /api/rfq/analytics?tenantId=xxx&timeRange=30

// Returns comprehensive metrics:
{
    overview: { totalRFQs, activeRFQs, closedRFQs, ... },
    financial: { totalValue, totalSavings, ... },
    performance: { avgCycleTime, responseRate, ... },
    distribution: { byStage, byPriority, ... },
    suppliers: [...],
    trends: { daily, weekly, monthly }
}
```

---

## 🎨 Styling

All components use CSS Modules. Styles are self-contained and won't conflict with other components.

To customize:

```css
/* Override in your own CSS */
.yourComponent :global(.rfq-dashboard) {
    /* Your custom styles */
}
```

---

## 🔍 Advanced Features

### 1. Risk Analysis Categories

The Risk Analysis Engine evaluates 6 risk categories:

```javascript
import RiskAnalysisEngine from '@/lib/riskAnalysisEngine';

const analysis = RiskAnalysisEngine.analyzeRFQRisk(rfq, suppliers, quotes, historicalData);

console.log(analysis.risks.supplier);   // Supplier-related risks
console.log(analysis.risks.financial);  // Budget and pricing risks
console.log(analysis.risks.delivery);   // Timeline risks
console.log(analysis.risks.quality);    // Quality concerns
console.log(analysis.risks.compliance); // Regulatory risks
console.log(analysis.risks.market);     // Market condition risks
```

### 2. Price Prediction Models

Three prediction models are combined:

```javascript
import PricePredictionEngine from '@/lib/pricePredictionEngine';

const prediction = PricePredictionEngine.predictPrices(items, historicalData, {
    horizon: 30,          // Days into future
    inflationRate: 5,     // Annual inflation %
    demandFactor: 10,     // Market demand adjustment %
    quantity: 100         // For volume discounts
});

// Uses:
// 1. Linear Regression (40% weight)
// 2. Moving Average (30% weight)
// 3. Exponential Smoothing (30% weight)
```

### 3. Cost Estimation Algorithms

```javascript
import CostEstimationEngine from '@/lib/costEstimationEngine';

// Uses similarity matching based on:
// - Product name keywords (40%)
// - Unit matching (20%)
// - Quantity similarity (20%)
// - Specifications matching (20%)

const estimate = CostEstimationEngine.estimateRFQCost(items, historicalData);
```

### 4. Supplier Scoring

```javascript
import SupplierRecommendationEngine from '@/lib/supplierRecommendationEngine';

// 5-factor scoring system:
// - Past Performance (25%)
// - Category Match (20%)
// - Price Competitiveness (25%)
// - Reliability (20%)
// - Response Rate (10%)

const recommendations = SupplierRecommendationEngine.recommendSuppliers(rfq, suppliers, history);
```

---

## 🧪 Testing

### Unit Testing

```bash
# Test individual engines
npm test -- rfqWorkflowEngine.test.js
npm test -- supplierRecommendationEngine.test.js
npm test -- costEstimationEngine.test.js
```

### Integration Testing

```bash
# Test complete flow
npm test -- rfq-flow.test.js
```

### Manual Testing

1. Create an RFQ with the Template Builder
2. Add suppliers and invite them
3. View AI recommendations
4. Check cost estimation
5. Review risk analysis
6. Compare quotes when received
7. View analytics dashboard

---

## 🐛 Troubleshooting

### Issue: Database migration fails

**Solution:**
```bash
# Reset database (development only!)
npx prisma migrate reset

# Then run
npx prisma migrate dev
```

### Issue: Prisma client not generated

**Solution:**
```bash
npx prisma generate
```

### Issue: API returns 500 error

**Solution:**
- Check database connection
- Verify all environment variables
- Check server logs: `npm run dev`
- Ensure Prisma schema is up to date

### Issue: Components not rendering

**Solution:**
- Check that all CSS modules exist
- Verify imports are correct
- Clear Next.js cache: `rm -rf .next`

---

## 📈 Performance Tips

1. **Use pagination** for large RFQ lists
2. **Cache historical data** for AI predictions
3. **Index database** on frequently queried fields
4. **Lazy load** analytics dashboard
5. **Debounce** template builder changes

---

## 🔒 Security Considerations

1. **Always validate tenant ID** in API routes
2. **Check user permissions** before allowing actions
3. **Sanitize user input** in template fields
4. **Encrypt sensitive data** (prices, supplier info)
5. **Rate limit** AI analysis endpoints

---

## 🎯 Best Practices

1. **Use templates** for recurring RFQ types
2. **Invite 3-5 suppliers** for competitive quotes
3. **Set realistic deadlines** (7-14 days)
4. **Include detailed specifications** for accurate quotes
5. **Review risk analysis** before supplier selection
6. **Monitor analytics** for process improvement

---

## 📞 Support

For issues or questions:
- Check this guide first
- Review the code comments
- Check the API documentation
- Create an issue in the project repository

---

## 🎉 What's Next?

Future enhancements planned:
- Supplier portal for direct quote submission
- Email/WhatsApp integration
- Multi-currency support
- Reverse auction functionality
- Contract generation
- Mobile app

---

**Last Updated**: 2025-11-26
**Version**: 2.0
**Author**: AI Development Team
