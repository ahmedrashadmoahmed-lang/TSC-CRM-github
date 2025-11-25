# Services Layer Documentation

## Overview

This directory contains the complete service layer for the Enterprise ERP system. All services follow clean architecture principles with separation of concerns, audit logging, and multi-tenant support.

## Services

### 1. InvoiceService
**File:** `InvoiceService.js`

**Methods:**
- `createInvoice(data, request)` - Create invoice with auto tax calculation
- `updateInvoice(id, data, request)` - Update invoice
- `recordPayment(id, amount, date, request)` - Record payment
- `approveInvoice(id, request)` - Approve invoice
- `deleteInvoice(id, request)` - Delete invoice
- `getInvoices(filters)` - Get invoices with filters
- `getStatistics()` - Get invoice statistics
- `generateInvoiceNumber()` - Generate invoice number

**Features:**
- Automatic tax calculation using TaxCalculator
- Customer totals update
- Audit logging
- Tenant-scoped queries

---

### 2. CustomerService
**File:** `CustomerService.js`

**Methods:**
- `createCustomer(data, request)` - Create customer
- `updateCustomer(id, data, request)` - Update customer
- `deleteCustomer(id, request)` - Delete customer
- `getCustomers(filters)` - Get customers with filters
- `getCustomerById(id)` - Get customer by ID
- `getCustomerStats(id)` - Get customer statistics
- `getTopCustomers(limit)` - Get top customers

**Features:**
- Search and filtering
- Customer statistics (payment rate, total value)
- Audit logging

---

### 3. SupplierService
**File:** `SupplierService.js`

**Methods:**
- `createSupplier(data, request)` - Create supplier
- `updateSupplier(id, data, request)` - Update supplier
- `deleteSupplier(id, request)` - Delete supplier
- `getSuppliers(filters)` - Get suppliers with filters
- `getSupplierById(id)` - Get supplier by ID
- `getSupplierStats(id)` - Get supplier statistics
- `getTopSuppliers(limit)` - Get top suppliers
- `updateRating(id, rating, request)` - Update supplier rating

**Features:**
- Rating system
- On-time delivery tracking
- Audit logging

---

### 4. PurchaseOrderService
**File:** `PurchaseOrderService.js`

**Methods:**
- `createPurchaseOrder(data, request)` - Create PO
- `updatePurchaseOrder(id, data, request)` - Update PO
- `approvePurchaseOrder(id, request)` - Approve PO
- `markAsReceived(id, date, request)` - Mark as received
- `cancelPurchaseOrder(id, reason, request)` - Cancel PO
- `deletePurchaseOrder(id, request)` - Delete PO
- `getPurchaseOrders(filters)` - Get POs with filters
- `getStatistics()` - Get PO statistics
- `generatePONumber()` - Generate PO number

**Features:**
- Approval workflow
- Receive tracking
- Auto PO numbering
- Supplier totals update

---

### 5. InventoryService
**File:** `InventoryService.js`

**Methods:**
- `recordMovement(data, request)` - Record inventory movement
- `getStockLevel(productId)` - Get stock level
- `getWarehouseStock(warehouseId)` - Get warehouse stock
- `transferStock(data, request)` - Transfer between warehouses
- `adjustStock(data, request)` - Adjust stock
- `getLowStockProducts(threshold)` - Get low stock products
- `calculateCOGS(productId, quantity, method)` - Calculate COGS
- `getMovementHistory(productId)` - Get movement history
- `getInventoryValuation(warehouseId)` - Get inventory valuation

**Features:**
- FIFO/LIFO costing
- Multi-warehouse support
- Movement tracking
- Low stock alerts

---

### 6. AccountingService
**File:** `AccountingService.js`

**Methods:**
- `createJournalEntry(data, request)` - Create journal entry
- `postJournalEntry(id, request)` - Post journal entry
- `createEntryFromInvoice(invoice, request)` - Create entry from invoice
- `getAccountBalance(accountId, date)` - Get account balance
- `getTrialBalance(date)` - Get trial balance
- `getIncomeStatement(startDate, endDate)` - Get income statement
- `getBalanceSheet(date)` - Get balance sheet
- `generateEntryNumber()` - Generate entry number

**Features:**
- Double-entry validation
- Automatic journal entries
- Financial reports
- Account balance tracking

---

### 7. PayrollService
**File:** `PayrollService.js`

**Methods:**
- `createPayroll(data, request)` - Create payroll entry
- `updatePayroll(id, data, request)` - Update payroll
- `approvePayroll(id, request)` - Approve payroll
- `markAsPaid(id, date, request)` - Mark as paid
- `deletePayroll(id, request)` - Delete payroll
- `getPayrollEntries(filters)` - Get payroll entries
- `getStatistics(year, month)` - Get payroll statistics
- `generateMonthlyPayroll(month, year, request)` - Generate monthly payroll
- `getEmployeeHistory(employeeId)` - Get employee payroll history

**Features:**
- Approval workflow
- Payment tracking
- Monthly payroll generation
- Statistics

---

### 8. NotificationService
**File:** `NotificationService.js`

**Methods:**
- `createNotification(data, request)` - Create notification
- `createBulkNotifications(data, request)` - Create bulk notifications
- `getUserNotifications(userId)` - Get user notifications
- `markAsRead(id, request)` - Mark as read
- `markAllAsRead(userId, request)` - Mark all as read
- `getUnreadCount(userId)` - Get unread count
- `notifyLowStock(productId, currentStock, request)` - Notify low stock
- `notifyInvoiceApproved(invoiceId, request)` - Notify invoice approved
- `notifyPOApprovalNeeded(poId, request)` - Notify PO approval needed

**Features:**
- Role-based notifications
- System notifications
- Unread tracking

---

## Usage Example

```javascript
import { InvoiceService } from '@/services/InvoiceService';

// Initialize service
const service = new InvoiceService(
  tenantId,
  tenantSettings,
  userId,
  userName,
  userEmail
);

// Create invoice
const invoice = await service.createInvoice({
  customerId: 'customer-id',
  salesValue: 10000,
  hasDiscount: true,
  discounts: 500,
  date: new Date(),
  description: 'Invoice description',
  salesPerson: 'Ahmed',
  type: 'sales'
}, request);

// Automatic tax calculation
// Customer totals update
// Audit log created
```

## Common Patterns

### All Services Include:
1. **Constructor** - Accepts tenantId, userId, userName, userEmail
2. **Tenant Isolation** - Uses `getTenantPrisma(tenantId)`
3. **Audit Logging** - Logs all CRUD operations
4. **Error Handling** - Throws descriptive errors
5. **Validation** - Business rule validation

### Service Initialization:
```javascript
const service = new ServiceName(
  tenantId,
  userId,
  userName,
  userEmail
);
```

### Audit Logging:
```javascript
await logAudit({
  tenantId: this.tenantId,
  userId: this.userId,
  userName: this.userName,
  userEmail: this.userEmail,
  action: AUDIT_ACTIONS.CREATE,
  entity: 'EntityName',
  entityId: entity.id,
  before: null,
  after: entity,
  request,
});
```

## Best Practices

1. **Always pass request object** for audit logging
2. **Use filters** for list operations
3. **Check permissions** in API routes before calling services
4. **Validate input** using Zod schemas before calling services
5. **Handle errors** gracefully in API routes

## Testing

```javascript
import { InvoiceService } from '@/services/InvoiceService';

describe('InvoiceService', () => {
  it('should create invoice with tax calculation', async () => {
    const service = new InvoiceService(
      'tenant-id',
      { vatRate: 15 },
      'user-id',
      'User Name',
      'user@example.com'
    );

    const invoice = await service.createInvoice({
      customerId: 'customer-id',
      salesValue: 10000,
      // ...
    });

    expect(invoice.vat).toBe(1500);
    expect(invoice.total).toBe(11500);
  });
});
```

## Future Services

- [ ] AnalyticsService
- [ ] AIService
- [ ] ReportService
- [ ] EmailService
- [ ] SMSService

---

**Built with Clean Architecture principles**
