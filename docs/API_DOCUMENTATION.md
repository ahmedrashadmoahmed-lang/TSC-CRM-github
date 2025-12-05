# API Documentation

## Dashboard APIs

### 1. KPIs Endpoint
**GET** `/api/dashboard/kpis`

Returns key performance indicators for the dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClients": { "value": 150, "trend": 12 },
    "newLeads": { "value": 45, "trend": 8 },
    "openDeals": { "value": 23, "totalValue": 450000, "trend": 5 },
    "conversionRate": { "value": 35, "trend": -2 },
    "pendingTasks": { "value": 12, "overdue": 3 }
  }
}
```

---

### 2. Sales Cycle Analytics
**GET** `/api/analytics/sales-cycle?days=30`

Analyzes sales cycle performance and identifies bottlenecks.

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "name": "Prospecting",
        "avgDuration": 5.2,
        "count": 45,
        "conversionRate": 65
      }
    ],
    "bottlenecks": [
      {
        "stage": "Proposal",
        "avgDuration": 12.5,
        "severity": "high"
      }
    ],
    "trends": {
      "avgCycleTime": 28.5,
      "previousAvgCycleTime": 32.1,
      "improvement": 11.2
    },
    "recommendations": [
      {
        "priority": "high",
        "action": "Streamline proposal process",
        "reason": "High bottleneck detected"
      }
    ]
  }
}
```

---

### 3. Conversion Funnel
**GET** `/api/analytics/funnel`

Returns conversion funnel data.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "stage": "Lead",
      "count": 150,
      "value": 0,
      "conversionRate": 100,
      "dropOff": 0
    },
    {
      "stage": "Qualified",
      "count": 98,
      "value": 245000,
      "conversionRate": 65.3,
      "dropOff": 34.7
    }
  ]
}
```

---

## AI & Predictions APIs

### 1. Lead Scoring
**POST** `/api/ai/lead-score`

Calculates AI-powered lead quality score.

**Request Body:**
```json
{
  "leadData": {
    "jobTitle": "CEO",
    "companySize": 250,
    "industry": "technology",
    "location": "cairo",
    "emailOpens": 5,
    "linkClicks": 3,
    "websiteVisits": 8,
    "formSubmissions": 2,
    "downloadedContent": 3,
    "avgResponseTime": 3600000,
    "meetingsAttended": 2,
    "questionsAsked": 4,
    "socialEngagement": 3,
    "revenue": 10000000,
    "employees": 300,
    "growthRate": 15
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScore": 85,
    "grade": "A",
    "conversionProbability": 75,
    "breakdown": {
      "demographic": 80,
      "behavioral": 90,
      "engagement": 85,
      "firmographic": 75
    },
    "recommendations": [
      {
        "priority": "high",
        "action": "Schedule demo immediately",
        "reason": "High-quality lead with strong conversion potential"
      }
    ]
  }
}
```

---

### 2. Batch Lead Scoring
**PUT** `/api/ai/lead-score`

Scores multiple leads at once.

**Request Body:**
```json
{
  "leads": [
    { "id": "1", "name": "Lead 1", "emailOpens": 5, ... },
    { "id": "2", "name": "Lead 2", "emailOpens": 10, ... }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "2",
      "name": "Lead 2",
      "totalScore": 90,
      "grade": "A+",
      "conversionProbability": 80
    },
    {
      "id": "1",
      "name": "Lead 1",
      "totalScore": 75,
      "grade": "B+",
      "conversionProbability": 60
    }
  ]
}
```

---

## Alerts APIs

### 1. List Alerts
**GET** `/api/alerts`

Returns all custom alerts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_123",
      "name": "High Revenue Alert",
      "metric": "revenue",
      "operator": "greater_than",
      "threshold": 100000,
      "channels": ["inApp", "email", "slack"],
      "priority": "high",
      "isActive": true
    }
  ]
}
```

---

### 2. Create Alert
**POST** `/api/alerts`

Creates a new custom alert.

**Request Body:**
```json
{
  "name": "Low Stock Alert",
  "metric": "low_stock",
  "operator": "greater_than",
  "threshold": 5,
  "channels": ["inApp", "email"],
  "priority": "medium"
}
```

---

### 3. Evaluate Alerts
**POST** `/api/alerts/evaluate`

Manually triggers alert evaluation.

**Response:**
```json
{
  "success": true,
  "message": "Alerts evaluated successfully"
}
```

---

## Error Responses

All APIs return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Dashboard APIs**: 100 requests/minute
- **AI APIs**: 50 requests/minute
- **Alert APIs**: 30 requests/minute

---

## Authentication

All API endpoints require authentication via session cookie or JWT token.

**Header:**
```
Authorization: Bearer <token>
```

---

## Webhooks

### Slack Webhook Integration

Configure Slack webhook URL in environment variables:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Alerts will be automatically sent to Slack when triggered.

---

## Best Practices

1. **Caching**: Use React Query or SWR for client-side caching
2. **Polling**: Avoid excessive polling, use recommended intervals
3. **Error Handling**: Always check `success` field in response
4. **Pagination**: Use `page` and `limit` parameters for large datasets
5. **Filtering**: Use query parameters for filtering results

---

**Last Updated**: 2025-11-25
**API Version**: 1.0.0
