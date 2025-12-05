-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxNumber" TEXT,
    "paymentTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "suppliers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "reorderPoint" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderDate" DATETIME NOT NULL,
    "expectedDate" DATETIME NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "total" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "salary" REAL NOT NULL,
    "hireDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "employees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" REAL NOT NULL,
    "allowances" REAL NOT NULL DEFAULT 0,
    "deductions" REAL NOT NULL DEFAULT 0,
    "netSalary" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentDate" DATETIME,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payroll_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "currencyId" TEXT,
    "taxRateId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "accounts_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "accounts_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "tax_rates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reference" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "journal_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalEntryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0,
    "credit" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "costCenterId" TEXT,
    "currencyId" TEXT,
    "exchangeRate" REAL NOT NULL DEFAULT 1,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "journal_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "journal_lines_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "journal_lines_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_movements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" TEXT,
    "newData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "einvoice_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "einvoice_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "einvoice_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionUUID" TEXT NOT NULL,
    "internalId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "etaResponse" TEXT,
    "errorMessage" TEXT,
    "submittedAt" DATETIME,
    "acceptedAt" DATETIME,
    "rejectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "einvoice_submissions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "einvoice_submissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "rate" REAL NOT NULL DEFAULT 1,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "currencies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tax_rates_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tax_rates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cost_centers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cost_centers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cost_centers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "amount" REAL NOT NULL,
    "actual" REAL NOT NULL DEFAULT 0,
    "variance" REAL NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "budgets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "iban" TEXT,
    "swiftCode" TEXT,
    "balance" REAL NOT NULL DEFAULT 0,
    "lastReconciled" DATETIME,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bank_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bank_accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "debit" REAL NOT NULL DEFAULT 0,
    "credit" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "journalEntryId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bank_transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bank_transactions_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bank_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fixed_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "assetAccountId" TEXT NOT NULL,
    "depreciationAccountId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "salvageValue" REAL NOT NULL DEFAULT 0,
    "usefulLife" INTEGER NOT NULL,
    "depreciationMethod" TEXT NOT NULL,
    "accumulatedDepr" REAL NOT NULL DEFAULT 0,
    "bookValue" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fixed_assets_assetAccountId_fkey" FOREIGN KEY ("assetAccountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fixed_assets_depreciationAccountId_fkey" FOREIGN KEY ("depreciationAccountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fixed_assets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "depreciation_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fixedAssetId" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "period" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "depreciation_entries_fixedAssetId_fkey" FOREIGN KEY ("fixedAssetId") REFERENCES "fixed_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "depreciation_entries_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "depreciation_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurring_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "nextDate" DATETIME NOT NULL,
    "templateLines" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastGenerated" DATETIME,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recurring_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "receipt" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'lead',
    "probability" INTEGER NOT NULL DEFAULT 0,
    "closedDate" DATETIME,
    "lastActivityDate" DATETIME,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "archivedReason" TEXT,
    "healthScore" INTEGER,
    "velocityScore" REAL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opportunities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opportunities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'draft',
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "deadline" DATETIME,
    "closedAt" DATETIME,
    "budget" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "estimatedCost" REAL,
    "template" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'not_required',
    "approverId" TEXT,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "rfqs_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rfqs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "specifications" TEXT,
    "technicalSpecs" TEXT,
    "deliveryTerms" TEXT,
    "warrantyTerms" TEXT,
    "qualityStandards" TEXT,
    "notes" TEXT,
    "estimatedPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rfq_items_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" DATETIME,
    "respondedAt" DATETIME,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "rfq_suppliers_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rfq_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "supplier_quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "quoteNumber" TEXT,
    "totalPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "deliveryTime" INTEGER NOT NULL,
    "paymentTerms" TEXT,
    "validUntil" DATETIME,
    "score" REAL,
    "rank" INTEGER,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "termsConditions" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" DATETIME,
    "selectedAt" DATETIME,
    CONSTRAINT "supplier_quotes_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "supplier_quotes_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "deliveryTime" INTEGER,
    "notes" TEXT,
    CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "supplier_quotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_timeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rfq_timeline_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rfq_attachments_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quote_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quote_attachments_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "supplier_quotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" DATETIME,
    "assignedTo" TEXT,
    "clientId" TEXT,
    "dealId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "opportunities" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "clientId" TEXT,
    "assignedTo" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "activities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stage_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "previousStage" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stage_history_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lost_reasons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "competitorName" TEXT,
    "competitorPrice" REAL,
    "opportunityId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lost_reasons_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lost_reasons_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "fields" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rfq_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "rfqId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contracts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contracts_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contracts_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "supplier_quotes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contracts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "advanced_purchase_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "rfqId" TEXT,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDelivery" DATETIME,
    "actualDelivery" DATETIME,
    "budgetId" TEXT,
    "budgetExceeded" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCost" REAL,
    "landedCost" REAL,
    "approvalStatus" TEXT DEFAULT 'pending',
    "approvalLevel" INTEGER NOT NULL DEFAULT 1,
    "currentApprover" TEXT,
    "warehouseId" TEXT,
    "deliveryAddress" TEXT,
    "shippingMethod" TEXT,
    "paymentTerms" TEXT,
    "paymentStatus" TEXT DEFAULT 'pending',
    "advancePayment" REAL,
    "qualityStatus" TEXT DEFAULT 'pending',
    "inspectionRequired" BOOLEAN NOT NULL DEFAULT true,
    "trackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "supplierRisk" INTEGER,
    "deliveryRisk" INTEGER,
    "overallRisk" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "advanced_purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "advanced_purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "po_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "quantityReceived" INTEGER NOT NULL DEFAULT 0,
    "quantityPending" INTEGER NOT NULL,
    "quantityRejected" INTEGER NOT NULL DEFAULT 0,
    "shippingCost" REAL,
    "taxAmount" REAL,
    "customsDuty" REAL,
    "otherCosts" REAL,
    "landedCostPerUnit" REAL,
    "serialNumbers" TEXT,
    "batchNumbers" TEXT,
    "expiryDate" DATETIME,
    "specifications" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "po_items_poId_fkey" FOREIGN KEY ("poId") REFERENCES "advanced_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "po_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "po_shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "shipmentNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'full',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "shippedDate" DATETIME,
    "expectedArrival" DATETIME,
    "actualArrival" DATETIME,
    "origin" TEXT,
    "destination" TEXT,
    "currentLocation" TEXT,
    "items" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "po_shipments_poId_fkey" FOREIGN KEY ("poId") REFERENCES "advanced_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "po_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "accessLevel" TEXT NOT NULL DEFAULT 'internal',
    "uploadedBy" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "po_documents_poId_fkey" FOREIGN KEY ("poId") REFERENCES "advanced_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "po_approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "approverName" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comments" TEXT,
    "signature" TEXT,
    "amountThreshold" REAL,
    "requiredRole" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "po_approvals_poId_fkey" FOREIGN KEY ("poId") REFERENCES "advanced_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "po_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentDate" DATETIME,
    "dueDate" DATETIME,
    "bankReference" TEXT,
    "transactionId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "po_payments_poId_fkey" FOREIGN KEY ("poId") REFERENCES "advanced_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "po_quality_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poId" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inspectionDate" DATETIME,
    "location" TEXT,
    "overallScore" INTEGER,
    "passedItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "partialItems" INTEGER NOT NULL DEFAULT 0,
    "defects" TEXT,
    "defectCount" INTEGER NOT NULL DEFAULT 0,
    "actionTaken" TEXT,
    "notes" TEXT,
    "recommendations" TEXT,
    "photos" TEXT,
    "reports" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "po_quality_checks_poId_fkey" FOREIGN KEY ("poId") REFERENCES "advanced_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "supplier_performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "poId" TEXT,
    "evaluationPeriod" TEXT,
    "deliveryScore" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "complianceScore" INTEGER NOT NULL DEFAULT 0,
    "responseScore" INTEGER NOT NULL DEFAULT 0,
    "pricingScore" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "onTimeDeliveries" INTEGER NOT NULL DEFAULT 0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "defectRate" REAL NOT NULL DEFAULT 0,
    "returnRate" REAL NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "riskLevel" TEXT,
    "riskFactors" TEXT,
    "evaluatedBy" TEXT NOT NULL,
    "evaluatorName" TEXT NOT NULL,
    "comments" TEXT,
    "recommendations" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "supplier_performance_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "supplier_performance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "suppliers_tenantId_idx" ON "suppliers"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_idx" ON "purchase_orders"("tenantId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "employees_tenantId_idx" ON "employees"("tenantId");

-- CreateIndex
CREATE INDEX "payroll_tenantId_idx" ON "payroll"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_employeeId_month_year_key" ON "payroll"("employeeId", "month", "year");

-- CreateIndex
CREATE INDEX "accounts_tenantId_idx" ON "accounts"("tenantId");

-- CreateIndex
CREATE INDEX "accounts_parentId_idx" ON "accounts"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_code_tenantId_key" ON "accounts"("code", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_entryNumber_key" ON "journal_entries"("entryNumber");

-- CreateIndex
CREATE INDEX "journal_entries_tenantId_idx" ON "journal_entries"("tenantId");

-- CreateIndex
CREATE INDEX "journal_entries_status_idx" ON "journal_entries"("status");

-- CreateIndex
CREATE INDEX "journal_lines_journalEntryId_idx" ON "journal_lines"("journalEntryId");

-- CreateIndex
CREATE INDEX "journal_lines_accountId_idx" ON "journal_lines"("accountId");

-- CreateIndex
CREATE INDEX "journal_lines_costCenterId_idx" ON "journal_lines"("costCenterId");

-- CreateIndex
CREATE INDEX "inventory_movements_productId_idx" ON "inventory_movements"("productId");

-- CreateIndex
CREATE INDEX "inventory_movements_tenantId_idx" ON "inventory_movements"("tenantId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_tenantId_idx" ON "notifications"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE UNIQUE INDEX "einvoice_configs_tenantId_key" ON "einvoice_configs"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "einvoice_submissions_submissionUUID_key" ON "einvoice_submissions"("submissionUUID");

-- CreateIndex
CREATE INDEX "einvoice_submissions_invoiceId_idx" ON "einvoice_submissions"("invoiceId");

-- CreateIndex
CREATE INDEX "einvoice_submissions_tenantId_idx" ON "einvoice_submissions"("tenantId");

-- CreateIndex
CREATE INDEX "einvoice_submissions_status_idx" ON "einvoice_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE INDEX "currencies_tenantId_idx" ON "currencies"("tenantId");

-- CreateIndex
CREATE INDEX "tax_rates_tenantId_idx" ON "tax_rates"("tenantId");

-- CreateIndex
CREATE INDEX "cost_centers_tenantId_idx" ON "cost_centers"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_tenantId_key" ON "cost_centers"("code", "tenantId");

-- CreateIndex
CREATE INDEX "budgets_tenantId_idx" ON "budgets"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_accountId_year_month_tenantId_key" ON "budgets"("accountId", "year", "month", "tenantId");

-- CreateIndex
CREATE INDEX "bank_accounts_tenantId_idx" ON "bank_accounts"("tenantId");

-- CreateIndex
CREATE INDEX "bank_transactions_bankAccountId_idx" ON "bank_transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "bank_transactions_tenantId_idx" ON "bank_transactions"("tenantId");

-- CreateIndex
CREATE INDEX "fixed_assets_tenantId_idx" ON "fixed_assets"("tenantId");

-- CreateIndex
CREATE INDEX "depreciation_entries_fixedAssetId_idx" ON "depreciation_entries"("fixedAssetId");

-- CreateIndex
CREATE INDEX "depreciation_entries_tenantId_idx" ON "depreciation_entries"("tenantId");

-- CreateIndex
CREATE INDEX "recurring_entries_tenantId_idx" ON "recurring_entries"("tenantId");

-- CreateIndex
CREATE INDEX "recurring_entries_nextDate_idx" ON "recurring_entries"("nextDate");

-- CreateIndex
CREATE INDEX "expenses_tenantId_idx" ON "expenses"("tenantId");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "opportunities_tenantId_idx" ON "opportunities"("tenantId");

-- CreateIndex
CREATE INDEX "opportunities_stage_idx" ON "opportunities"("stage");

-- CreateIndex
CREATE INDEX "opportunities_customerId_idx" ON "opportunities"("customerId");

-- CreateIndex
CREATE INDEX "opportunities_lastActivityDate_idx" ON "opportunities"("lastActivityDate");

-- CreateIndex
CREATE INDEX "opportunities_isArchived_idx" ON "opportunities"("isArchived");

-- CreateIndex
CREATE INDEX "opportunities_healthScore_idx" ON "opportunities"("healthScore");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_rfqNumber_key" ON "rfqs"("rfqNumber");

-- CreateIndex
CREATE INDEX "rfqs_tenantId_idx" ON "rfqs"("tenantId");

-- CreateIndex
CREATE INDEX "rfqs_stage_idx" ON "rfqs"("stage");

-- CreateIndex
CREATE INDEX "rfqs_status_idx" ON "rfqs"("status");

-- CreateIndex
CREATE INDEX "rfqs_deadline_idx" ON "rfqs"("deadline");

-- CreateIndex
CREATE INDEX "rfqs_createdAt_idx" ON "rfqs"("createdAt");

-- CreateIndex
CREATE INDEX "rfq_items_rfqId_idx" ON "rfq_items"("rfqId");

-- CreateIndex
CREATE INDEX "rfq_suppliers_rfqId_idx" ON "rfq_suppliers"("rfqId");

-- CreateIndex
CREATE INDEX "rfq_suppliers_supplierId_idx" ON "rfq_suppliers"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_suppliers_rfqId_supplierId_key" ON "rfq_suppliers"("rfqId", "supplierId");

-- CreateIndex
CREATE INDEX "supplier_quotes_rfqId_idx" ON "supplier_quotes"("rfqId");

-- CreateIndex
CREATE INDEX "supplier_quotes_supplierId_idx" ON "supplier_quotes"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_quotes_isSelected_idx" ON "supplier_quotes"("isSelected");

-- CreateIndex
CREATE INDEX "quote_items_quoteId_idx" ON "quote_items"("quoteId");

-- CreateIndex
CREATE INDEX "rfq_timeline_rfqId_idx" ON "rfq_timeline"("rfqId");

-- CreateIndex
CREATE INDEX "rfq_timeline_createdAt_idx" ON "rfq_timeline"("createdAt");

-- CreateIndex
CREATE INDEX "rfq_attachments_rfqId_idx" ON "rfq_attachments"("rfqId");

-- CreateIndex
CREATE INDEX "quote_attachments_quoteId_idx" ON "quote_attachments"("quoteId");

-- CreateIndex
CREATE INDEX "tasks_tenantId_idx" ON "tasks"("tenantId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_assignedTo_idx" ON "tasks"("assignedTo");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketNumber_key" ON "tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "tickets_tenantId_idx" ON "tickets"("tenantId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_assignedTo_idx" ON "tickets"("assignedTo");

-- CreateIndex
CREATE INDEX "activities_tenantId_idx" ON "activities"("tenantId");

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_entityType_entityId_idx" ON "activities"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "stage_history_opportunityId_idx" ON "stage_history"("opportunityId");

-- CreateIndex
CREATE INDEX "stage_history_stage_idx" ON "stage_history"("stage");

-- CreateIndex
CREATE INDEX "stage_history_changedAt_idx" ON "stage_history"("changedAt");

-- CreateIndex
CREATE INDEX "lost_reasons_category_idx" ON "lost_reasons"("category");

-- CreateIndex
CREATE INDEX "lost_reasons_opportunityId_idx" ON "lost_reasons"("opportunityId");

-- CreateIndex
CREATE INDEX "lost_reasons_tenantId_idx" ON "lost_reasons"("tenantId");

-- CreateIndex
CREATE INDEX "lost_reasons_createdAt_idx" ON "lost_reasons"("createdAt");

-- CreateIndex
CREATE INDEX "lost_reasons_competitorName_idx" ON "lost_reasons"("competitorName");

-- CreateIndex
CREATE INDEX "rfq_templates_tenantId_idx" ON "rfq_templates"("tenantId");

-- CreateIndex
CREATE INDEX "rfq_templates_category_idx" ON "rfq_templates"("category");

-- CreateIndex
CREATE INDEX "rfq_templates_isDefault_idx" ON "rfq_templates"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contractNumber_key" ON "contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "contracts_tenantId_idx" ON "contracts"("tenantId");

-- CreateIndex
CREATE INDEX "contracts_rfqId_idx" ON "contracts"("rfqId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_contractNumber_idx" ON "contracts"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "advanced_purchase_orders_poNumber_key" ON "advanced_purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "advanced_purchase_orders_tenantId_idx" ON "advanced_purchase_orders"("tenantId");

-- CreateIndex
CREATE INDEX "advanced_purchase_orders_supplierId_idx" ON "advanced_purchase_orders"("supplierId");

-- CreateIndex
CREATE INDEX "advanced_purchase_orders_status_idx" ON "advanced_purchase_orders"("status");

-- CreateIndex
CREATE INDEX "advanced_purchase_orders_poNumber_idx" ON "advanced_purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "advanced_purchase_orders_rfqId_idx" ON "advanced_purchase_orders"("rfqId");

-- CreateIndex
CREATE INDEX "po_items_poId_idx" ON "po_items"("poId");

-- CreateIndex
CREATE INDEX "po_items_productId_idx" ON "po_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "po_shipments_shipmentNumber_key" ON "po_shipments"("shipmentNumber");

-- CreateIndex
CREATE INDEX "po_shipments_poId_idx" ON "po_shipments"("poId");

-- CreateIndex
CREATE INDEX "po_shipments_status_idx" ON "po_shipments"("status");

-- CreateIndex
CREATE INDEX "po_shipments_shipmentNumber_idx" ON "po_shipments"("shipmentNumber");

-- CreateIndex
CREATE INDEX "po_documents_poId_idx" ON "po_documents"("poId");

-- CreateIndex
CREATE INDEX "po_documents_type_idx" ON "po_documents"("type");

-- CreateIndex
CREATE INDEX "po_approvals_poId_idx" ON "po_approvals"("poId");

-- CreateIndex
CREATE INDEX "po_approvals_approverId_idx" ON "po_approvals"("approverId");

-- CreateIndex
CREATE INDEX "po_approvals_status_idx" ON "po_approvals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "po_payments_paymentNumber_key" ON "po_payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "po_payments_poId_idx" ON "po_payments"("poId");

-- CreateIndex
CREATE INDEX "po_payments_status_idx" ON "po_payments"("status");

-- CreateIndex
CREATE INDEX "po_payments_paymentNumber_idx" ON "po_payments"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "po_quality_checks_inspectionNumber_key" ON "po_quality_checks"("inspectionNumber");

-- CreateIndex
CREATE INDEX "po_quality_checks_poId_idx" ON "po_quality_checks"("poId");

-- CreateIndex
CREATE INDEX "po_quality_checks_inspectorId_idx" ON "po_quality_checks"("inspectorId");

-- CreateIndex
CREATE INDEX "po_quality_checks_status_idx" ON "po_quality_checks"("status");

-- CreateIndex
CREATE INDEX "po_quality_checks_inspectionNumber_idx" ON "po_quality_checks"("inspectionNumber");

-- CreateIndex
CREATE INDEX "supplier_performance_supplierId_idx" ON "supplier_performance"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_performance_tenantId_idx" ON "supplier_performance"("tenantId");

-- CreateIndex
CREATE INDEX "supplier_performance_evaluationPeriod_idx" ON "supplier_performance"("evaluationPeriod");
