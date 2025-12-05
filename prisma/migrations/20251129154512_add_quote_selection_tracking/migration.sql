-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rfqs" (
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
    "opportunityId" TEXT,
    "selectedQuoteId" TEXT,
    CONSTRAINT "rfqs_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rfqs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rfqs_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rfqs_selectedQuoteId_fkey" FOREIGN KEY ("selectedQuoteId") REFERENCES "supplier_quotes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rfqs" ("approvalStatus", "approverId", "budget", "closedAt", "createdAt", "createdBy", "currency", "deadline", "description", "estimatedCost", "id", "notes", "priority", "rfqNumber", "sentAt", "stage", "status", "template", "tenantId", "title", "updatedAt") SELECT "approvalStatus", "approverId", "budget", "closedAt", "createdAt", "createdBy", "currency", "deadline", "description", "estimatedCost", "id", "notes", "priority", "rfqNumber", "sentAt", "stage", "status", "template", "tenantId", "title", "updatedAt" FROM "rfqs";
DROP TABLE "rfqs";
ALTER TABLE "new_rfqs" RENAME TO "rfqs";
CREATE UNIQUE INDEX "rfqs_rfqNumber_key" ON "rfqs"("rfqNumber");
CREATE UNIQUE INDEX "rfqs_selectedQuoteId_key" ON "rfqs"("selectedQuoteId");
CREATE INDEX "rfqs_tenantId_idx" ON "rfqs"("tenantId");
CREATE INDEX "rfqs_stage_idx" ON "rfqs"("stage");
CREATE INDEX "rfqs_status_idx" ON "rfqs"("status");
CREATE INDEX "rfqs_deadline_idx" ON "rfqs"("deadline");
CREATE INDEX "rfqs_createdAt_idx" ON "rfqs"("createdAt");
CREATE TABLE "new_supplier_quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondedAt" DATETIME,
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
INSERT INTO "new_supplier_quotes" ("currency", "deliveryTime", "evaluatedAt", "id", "isSelected", "notes", "paymentTerms", "quoteNumber", "rank", "rejectionReason", "rfqId", "score", "selectedAt", "submittedAt", "supplierId", "termsConditions", "totalPrice", "validUntil") SELECT "currency", "deliveryTime", "evaluatedAt", "id", "isSelected", "notes", "paymentTerms", "quoteNumber", "rank", "rejectionReason", "rfqId", "score", "selectedAt", "submittedAt", "supplierId", "termsConditions", "totalPrice", "validUntil" FROM "supplier_quotes";
DROP TABLE "supplier_quotes";
ALTER TABLE "new_supplier_quotes" RENAME TO "supplier_quotes";
CREATE INDEX "supplier_quotes_rfqId_idx" ON "supplier_quotes"("rfqId");
CREATE INDEX "supplier_quotes_supplierId_idx" ON "supplier_quotes"("supplierId");
CREATE INDEX "supplier_quotes_isSelected_idx" ON "supplier_quotes"("isSelected");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
