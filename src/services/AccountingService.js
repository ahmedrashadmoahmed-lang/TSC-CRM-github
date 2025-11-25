import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class AccountingService {
    constructor(tenantId, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Create journal entry
    async createJournalEntry(data, request = null) {
        // Validate double-entry (debits = credits)
        const totalDebits = data.transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalCredits = data.transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            throw new Error('Journal entry is not balanced. Debits must equal credits.');
        }

        // Generate entry number
        const entryNumber = await this.generateEntryNumber();

        // Create journal entry with transactions
        const entry = await this.prisma.journalEntry.create({
            data: {
                entryNumber,
                date: new Date(data.date),
                description: data.description,
                sourceType: data.sourceType || null,
                sourceId: data.sourceId || null,
                status: 'draft',
                createdBy: this.userId,
                transactions: {
                    create: data.transactions.map(t => ({
                        tenantId: this.tenantId,
                        accountId: t.accountId,
                        type: t.type,
                        amount: t.amount,
                        description: t.description || null,
                    })),
                },
            },
            include: {
                transactions: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'JournalEntry',
            entityId: entry.id,
            after: entry,
            request,
        });

        return entry;
    }

    // Post journal entry (finalize it)
    async postJournalEntry(id, request = null) {
        const entry = await this.prisma.journalEntry.findUnique({
            where: { id },
            include: { transactions: true },
        });

        if (!entry) {
            throw new Error('Journal entry not found');
        }

        if (entry.status === 'posted') {
            throw new Error('Journal entry is already posted');
        }

        const updated = await this.prisma.journalEntry.update({
            where: { id },
            data: {
                status: 'posted',
                postedAt: new Date(),
                postedBy: this.userId,
            },
            include: {
                transactions: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.APPROVE,
            entity: 'JournalEntry',
            entityId: id,
            before: entry,
            after: updated,
            request,
        });

        return updated;
    }

    // Create journal entry from invoice
    async createEntryFromInvoice(invoice) {
        const transactions = [];

        // Debit: Accounts Receivable
        const arAccount = await this.prisma.account.findFirst({
            where: { code: '1200' }, // Accounts Receivable
        });

        transactions.push({
            accountId: arAccount.id,
            type: 'debit',
            amount: invoice.finalValue,
            description: `Invoice ${invoice.invoiceNumber}`,
        });

        // Credit: Sales Revenue
        const revenueAccount = await this.prisma.account.findFirst({
            where: { code: '4100' }, // Sales Revenue
        });

        transactions.push({
            accountId: revenueAccount.id,
            type: 'credit',
            amount: invoice.salesValue,
            description: `Sales from invoice ${invoice.invoiceNumber}`,
        });

        // Credit: VAT Payable
        if (invoice.vat > 0) {
            const vatAccount = await this.prisma.account.findFirst({
                where: { code: '2100' }, // VAT Payable
            });

            transactions.push({
                accountId: vatAccount.id,
                type: 'credit',
                amount: invoice.vat,
                description: `VAT from invoice ${invoice.invoiceNumber}`,
            });
        }

        // Credit: Profit Tax (if applicable)
        if (invoice.profitTax > 0) {
            const taxAccount = await this.prisma.account.findFirst({
                where: { code: '2100' }, // Using VAT account for now
            });

            transactions.push({
                accountId: taxAccount.id,
                type: 'credit',
                amount: invoice.profitTax,
                description: `Profit tax from invoice ${invoice.invoiceNumber}`,
            });
        }

        return await this.createJournalEntry({
            date: invoice.date,
            description: `Sales invoice ${invoice.invoiceNumber}`,
            sourceType: 'Invoice',
            sourceId: invoice.id,
            transactions,
        });
    }

    // Get account balance
    async getAccountBalance(accountId, asOfDate = null) {
        const where = {
            accountId,
        };

        if (asOfDate) {
            where.journalEntry = {
                date: { lte: new Date(asOfDate) },
                status: 'posted',
            };
        } else {
            where.journalEntry = {
                status: 'posted',
            };
        }

        const transactions = await this.prisma.accountingTransaction.findMany({
            where,
            include: {
                account: true,
            },
        });

        const account = transactions[0]?.account;
        if (!account) {
            return { balance: 0, account: null };
        }

        let balance = 0;
        for (const transaction of transactions) {
            if (transaction.type === 'debit') {
                balance += account.normalBalance === 'debit'
                    ? transaction.amount
                    : -transaction.amount;
            } else {
                balance += account.normalBalance === 'credit'
                    ? transaction.amount
                    : -transaction.amount;
            }
        }

        return {
            balance,
            account,
            transactionCount: transactions.length,
        };
    }

    // Get trial balance
    async getTrialBalance(asOfDate = null) {
        const accounts = await this.prisma.account.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
        });

        const balances = [];
        let totalDebits = 0;
        let totalCredits = 0;

        for (const account of accounts) {
            const { balance } = await this.getAccountBalance(account.id, asOfDate);

            if (balance !== 0) {
                const debit = account.normalBalance === 'debit' && balance > 0 ? balance : 0;
                const credit = account.normalBalance === 'credit' && balance > 0 ? balance : 0;

                balances.push({
                    account,
                    debit,
                    credit,
                    balance,
                });

                totalDebits += debit;
                totalCredits += credit;
            }
        }

        return {
            balances,
            totalDebits,
            totalCredits,
            isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
            asOfDate: asOfDate || new Date(),
        };
    }

    // Get income statement
    async getIncomeStatement(startDate, endDate) {
        const revenueAccounts = await this.prisma.account.findMany({
            where: { type: 'revenue', isActive: true },
        });

        const expenseAccounts = await this.prisma.account.findMany({
            where: { type: 'expense', isActive: true },
        });

        let totalRevenue = 0;
        const revenues = [];

        for (const account of revenueAccounts) {
            const { balance } = await this.getAccountBalance(account.id, endDate);
            if (balance > 0) {
                revenues.push({ account, amount: balance });
                totalRevenue += balance;
            }
        }

        let totalExpenses = 0;
        const expenses = [];

        for (const account of expenseAccounts) {
            const { balance } = await this.getAccountBalance(account.id, endDate);
            if (balance > 0) {
                expenses.push({ account, amount: balance });
                totalExpenses += balance;
            }
        }

        const netIncome = totalRevenue - totalExpenses;

        return {
            period: { startDate, endDate },
            revenues,
            totalRevenue,
            expenses,
            totalExpenses,
            netIncome,
        };
    }

    // Get balance sheet
    async getBalanceSheet(asOfDate = null) {
        const date = asOfDate || new Date();

        const assetAccounts = await this.prisma.account.findMany({
            where: { type: 'asset', isActive: true },
        });

        const liabilityAccounts = await this.prisma.account.findMany({
            where: { type: 'liability', isActive: true },
        });

        const equityAccounts = await this.prisma.account.findMany({
            where: { type: 'equity', isActive: true },
        });

        let totalAssets = 0;
        const assets = [];

        for (const account of assetAccounts) {
            const { balance } = await this.getAccountBalance(account.id, date);
            if (balance > 0) {
                assets.push({ account, amount: balance });
                totalAssets += balance;
            }
        }

        let totalLiabilities = 0;
        const liabilities = [];

        for (const account of liabilityAccounts) {
            const { balance } = await this.getAccountBalance(account.id, date);
            if (balance > 0) {
                liabilities.push({ account, amount: balance });
                totalLiabilities += balance;
            }
        }

        let totalEquity = 0;
        const equity = [];

        for (const account of equityAccounts) {
            const { balance } = await this.getAccountBalance(account.id, date);
            if (balance > 0) {
                equity.push({ account, amount: balance });
                totalEquity += balance;
            }
        }

        return {
            asOfDate: date,
            assets,
            totalAssets,
            liabilities,
            totalLiabilities,
            equity,
            totalEquity,
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
            isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        };
    }

    // Generate entry number
    async generateEntryNumber() {
        const lastEntry = await this.prisma.journalEntry.findFirst({
            where: { tenantId: this.tenantId },
            orderBy: { createdAt: 'desc' },
        });

        let nextNumber = 1000;
        if (lastEntry) {
            const lastNumber = parseInt(lastEntry.entryNumber.replace('JE-', ''));
            nextNumber = lastNumber + 1;
        }

        return `JE-${nextNumber}`;
    }
}
