// ==================== نظام المحاسبة المتكامل ====================
const APP_ACCOUNTING = (function() {
    'use strict';

    // ==================== Render Accounting Page ====================
    function renderAccountingPage() {
        const accounting = APP_CORE.getData('accounting') || {};
        const accounts = accounting.accounts || {};
        const transactions = accounting.transactions || [];
        
        const totalAssets = calculateTotalAssets();
        const totalLiabilities = calculateTotalLiabilities();
        const totalRevenue = calculateTotalRevenue();
        const totalExpenses = calculateTotalExpenses();
        const netProfit = totalRevenue - totalExpenses;

        return `
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-bold mb-2">نظام المحاسبة المتكامل</h2>
                    <p class="text-gray-600 dark:text-gray-400">إدارة الحسابات والقيود المحاسبية</p>
                </div>

                <!-- Financial Summary -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="accounting-card asset card bg-white dark:bg-gray-800 shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-70">إجمالي الأصول</p>
                                    <p class="text-2xl font-bold text-info">${APP_CORE.formatCurrency(totalAssets)}</p>
                                </div>
                                <div class="text-4xl text-info opacity-20">
                                    <i class="bi bi-building"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="accounting-card liability card bg-white dark:bg-gray-800 shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-70">إجمالي الالتزامات</p>
                                    <p class="text-2xl font-bold text-warning">${APP_CORE.formatCurrency(totalLiabilities)}</p>
                                </div>
                                <div class="text-4xl text-warning opacity-20">
                                    <i class="bi bi-credit-card"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="accounting-card revenue card bg-white dark:bg-gray-800 shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-70">إجمالي الإيرادات</p>
                                    <p class="text-2xl font-bold text-success">${APP_CORE.formatCurrency(totalRevenue)}</p>
                                </div>
                                <div class="text-4xl text-success opacity-20">
                                    <i class="bi bi-arrow-down-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="accounting-card expense card bg-white dark:bg-gray-800 shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-70">إجمالي المصروفات</p>
                                    <p class="text-2xl font-bold text-error">${APP_CORE.formatCurrency(totalExpenses)}</p>
                                </div>
                                <div class="text-4xl text-error opacity-20">
                                    <i class="bi bi-arrow-up-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Net Profit Card -->
                <div class="card bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
                    <div class="card-body">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-lg opacity-90">صافي الربح/الخسارة</p>
                                <p class="text-4xl font-bold">${APP_CORE.formatCurrency(netProfit)}</p>
                            </div>
                            <div class="text-6xl opacity-30">
                                <i class="bi bi-graph-up-arrow"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chart of Accounts & Recent Transactions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Chart of Accounts -->
                    <div class="card bg-white dark:bg-gray-800 shadow-lg">
                        <div class="card-body">
                            <h3 class="card-title mb-4">
                                <i class="bi bi-journal-text text-primary"></i>
                                دليل الحسابات
                            </h3>
                            <div class="space-y-4 max-h-96 overflow-y-auto">
                                ${renderChartOfAccounts()}
                            </div>
                        </div>
                    </div>

                    <!-- Recent Transactions -->
                    <div class="card bg-white dark:bg-gray-800 shadow-lg">
                        <div class="card-body">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="card-title">
                                    <i class="bi bi-clock-history text-primary"></i>
                                    آخر القيود
                                </h3>
                                <button class="btn btn-primary btn-sm" onclick="APP_ACCOUNTING.showAddJournalEntryModal()">
                                    <i class="bi bi-plus-lg"></i>
                                    قيد جديد
                                </button>
                            </div>
                            <div class="space-y-3 max-h-96 overflow-y-auto">
                                ${renderRecentTransactions(transactions)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Account Details Section -->
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <h3 class="card-title mb-4">
                            <i class="bi bi-wallet2 text-primary"></i>
                            تفاصيل الحسابات الرئيسية
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <p class="text-sm opacity-70 mb-1">النقدية والبنك</p>
                                <p class="text-2xl font-bold text-success">${APP_CORE.formatCurrency(accounts.cash + accounts.bank)}</p>
                            </div>
                            <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p class="text-sm opacity-70 mb-1">العملاء (مدينون)</p>
                                <p class="text-2xl font-bold text-info">${APP_CORE.formatCurrency(accounts.accountsReceivable)}</p>
                            </div>
                            <div class="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                <p class="text-sm opacity-70 mb-1">الموردون (دائنون)</p>
                                <p class="text-2xl font-bold text-warning">${APP_CORE.formatCurrency(accounts.accountsPayable)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Calculate Totals ====================
    function calculateTotalAssets() {
        const accounting = APP_CORE.getData('accounting') || {};
        const chartOfAccounts = accounting.chartOfAccounts || {};
        const assets = chartOfAccounts.assets || [];
        return assets.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }

    function calculateTotalLiabilities() {
        const accounting = APP_CORE.getData('accounting') || {};
        const chartOfAccounts = accounting.chartOfAccounts || {};
        const liabilities = chartOfAccounts.liabilities || [];
        return liabilities.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }

    function calculateTotalRevenue() {
        const accounting = APP_CORE.getData('accounting') || {};
        const chartOfAccounts = accounting.chartOfAccounts || {};
        const revenue = chartOfAccounts.revenue || [];
        return revenue.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }

    function calculateTotalExpenses() {
        const accounting = APP_CORE.getData('accounting') || {};
        const chartOfAccounts = accounting.chartOfAccounts || {};
        const expenses = chartOfAccounts.expenses || [];
        return expenses.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }

    // ==================== Render Chart of Accounts ====================
    function renderChartOfAccounts() {
        const accounting = APP_CORE.getData('accounting') || {};
        const chartOfAccounts = accounting.chartOfAccounts || {};
        
        const categories = [
            { name: 'الأصول', data: chartOfAccounts.assets || [], color: 'info' },
            { name: 'الالتزامات', data: chartOfAccounts.liabilities || [], color: 'warning' },
            { name: 'حقوق الملكية', data: chartOfAccounts.equity || [], color: 'success' },
            { name: 'الإيرادات', data: chartOfAccounts.revenue || [], color: 'success' },
            { name: 'المصروفات', data: chartOfAccounts.expenses || [], color: 'error' }
        ];

        return categories.map(category => `
            <div class="collapse collapse-arrow bg-base-200">
                <input type="radio" name="chart-accordion" /> 
                <div class="collapse-title font-bold">
                    <span class="badge badge-${category.color} badge-sm ml-2">${category.data.length}</span>
                    ${category.name}
                </div>
                <div class="collapse-content">
                    <div class="space-y-2 mt-2">
                        ${category.data.map(account => `
                            <div class="flex justify-between items-center p-2 rounded bg-base-100 hover:bg-base-300 transition-colors">
                                <div>
                                    <p class="font-semibold text-sm">${account.name}</p>
                                    <p class="text-xs opacity-60">${account.code}</p>
                                </div>
                                <span class="font-bold text-${category.color}">${APP_CORE.formatCurrency(account.balance)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ==================== Render Recent Transactions ====================
    function renderRecentTransactions(transactions) {
        if (!transactions || transactions.length === 0) {
            return '<p class="text-center text-gray-500 py-8">لا توجد قيود محاسبية</p>';
        }

        return transactions.slice(0, 5).map(transaction => `
            <div class="p-4 rounded-lg border border-base-300 hover:border-primary transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="font-semibold">${transaction.description}</p>
                        <p class="text-xs opacity-60">${transaction.reference || 'N/A'}</p>
                    </div>
                    <span class="badge ${transaction.status === 'posted' ? 'badge-success' : 'badge-warning'}">
                        ${transaction.status === 'posted' ? 'مرحّل' : 'مسودة'}
                    </span>
                </div>
                <div class="text-xs opacity-70">
                    ${APP_CORE.formatDate(transaction.date, 'short')}
                </div>
            </div>
        `).join('');
    }

    // ==================== Journal Entry Modal ====================
    function showAddJournalEntryModal() {
        APP_CORE.showToast('نافذة إضافة قيد محاسبي قيد التطوير', 'info');
    }

    // ==================== Post Journal Entry ====================
    function postJournalEntry(entry) {
        const accounting = APP_CORE.getData('accounting') || {};
        const transactions = accounting.transactions || [];
        
        transactions.push(entry);
        APP_CORE.setData('accounting', accounting);
        
        APP_CORE.showToast('تم ترحيل القيد المحاسبي بنجاح', 'success');
    }

    // ==================== Public API ====================
    return {
        renderAccountingPage,
        showAddJournalEntryModal,
        postJournalEntry,
        calculateTotalAssets,
        calculateTotalLiabilities,
        calculateTotalRevenue,
        calculateTotalExpenses
    };
})();