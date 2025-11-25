# API Routes Documentation

## Overview

This directory contains all API routes for the Enterprise ERP system. All routes follow RESTful conventions and include authentication, authorization, validation, and error handling.

## Authentication

All API routes (except `/api/auth/*`) require authentication via `withAuth` middleware:

```javascript
import { withAuth } from '@/lib/authMiddleware';

export const GET = withAuth(async (request) => {
  // request.tenantId - Current tenant ID
  // request.userId - Current user ID
  // request.userName - Current user name
  // request.userEmail - Current user email
  // request.userRoles - User roles array
}, ['permission:required']);
```

## Available Routes

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/[id]/payment` - Record payment
- `POST /api/invoices/[id]/approve` - Approve invoice
- `GET /api/invoices/statistics` - Get statistics

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/[id]` - Update supplier
- `DELETE /api/suppliers/[id]` - Delete supplier

### Purchase Orders
- `GET /api/purchase-orders` - List purchase orders
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/[id]` - Update purchase order
- `DELETE /api/purchase-orders/[id]` - Delete purchase order
- `POST /api/purchase-orders/[id]/approve` - Approve PO
- `POST /api/purchase-orders/[id]/receive` - Mark as received
- `GET /api/purchase-orders/statistics` - Get statistics

### Inventory
- `GET /api/inventory/movements` - List inventory movements
- `POST /api/inventory/movements` - Record movement
- `POST /api/inventory/transfer` - Transfer stock
- `POST /api/inventory/adjust` - Adjust stock
- `GET /api/inventory/stock` - Get stock levels

### Payroll
- `GET /api/payroll` - List payroll entries
- `POST /api/payroll` - Create payroll entry
- `PUT /api/payroll/[id]` - Update payroll
- `POST /api/payroll/[id]/approve` - Approve payroll
- `POST /api/payroll/[id]/pay` - Mark as paid
- `GET /api/payroll/statistics` - Get statistics

### Accounting
- `GET /api/accounting/reports/trial-balance` - Trial balance
- `GET /api/accounting/reports/income-statement` - Income statement
- `GET /api/accounting/reports/balance-sheet` - Balance sheet
- `POST /api/accounting/journal-entries` - Create journal entry

## Request/Response Format

### Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "عملية ناجحة"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "رسالة الخطأ",
  "errors": {
    "field": "رسالة الخطأ للحقل"
  }
}
```

## Query Parameters

### Filtering
```
GET /api/invoices?status=pending&customerId=123
```

### Pagination
```
GET /api/invoices?page=1&limit=10
```

### Sorting
```
GET /api/invoices?sortBy=date&order=desc
```

### Search
```
GET /api/customers?search=ahmed
```

### Date Range
```
GET /api/invoices?startDate=2024-01-01&endDate=2024-12-31
```

## Validation

All routes use Zod schemas for validation:

```javascript
import { validate } from '@/lib/validation';
import { customerSchema } from '@/lib/validation';

const { success, errors } = validate(customerSchema, body);
if (!success) {
  return NextResponse.json({ success: false, errors }, { status: 400 });
}
```

## Error Handling

```javascript
try {
  // Route logic
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    {
      success: false,
      error: error.message || 'حدث خطأ',
    },
    { status: 500 }
  );
}
```

## Permissions

Required permissions for each route:

| Route | Permission |
|-------|-----------|
| GET /api/invoices | invoice:read |
| POST /api/invoices | invoice:create |
| PUT /api/invoices/[id] | invoice:update |
| DELETE /api/invoices/[id] | invoice:delete |
| POST /api/invoices/[id]/approve | invoice:approve |
| GET /api/customers | customer:read |
| POST /api/customers | customer:create |
| GET /api/inventory/* | inventory:read |
| POST /api/inventory/* | inventory:create |
| GET /api/payroll | payroll:read |
| POST /api/payroll | payroll:create |
| POST /api/payroll/[id]/approve | payroll:approve |

## Service Integration

All routes use the service layer:

```javascript
import { InvoiceService } from '@/services/InvoiceService';

const service = new InvoiceService(
  request.tenantId,
  request.userId,
  request.userName,
  request.userEmail
);

const invoice = await service.createInvoice(data, request);
```

## Testing

```bash
# Test with curl
curl -X GET http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test with fetch
const response = await fetch('/api/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

---

**Total Routes: 30+**
**All routes include: Authentication, Authorization, Validation, Error Handling, Audit Logging**
