-- CreateTable
CREATE TABLE "customer_quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteNumber" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "terms" TEXT,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customer_quotes_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "customer_quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "customer_quotes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_quote_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "customer_quotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_quotes_quoteNumber_key" ON "customer_quotes"("quoteNumber");

-- CreateIndex
CREATE INDEX "customer_quotes_tenantId_idx" ON "customer_quotes"("tenantId");

-- CreateIndex
CREATE INDEX "customer_quotes_opportunityId_idx" ON "customer_quotes"("opportunityId");

-- CreateIndex
CREATE INDEX "customer_quotes_customerId_idx" ON "customer_quotes"("customerId");

-- CreateIndex
CREATE INDEX "customer_quotes_status_idx" ON "customer_quotes"("status");

-- CreateIndex
CREATE INDEX "customer_quote_items_quoteId_idx" ON "customer_quote_items"("quoteId");

-- CreateIndex
CREATE INDEX "customer_quote_items_productId_idx" ON "customer_quote_items"("productId");
