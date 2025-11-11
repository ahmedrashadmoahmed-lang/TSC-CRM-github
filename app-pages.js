// ==================== إدارة صفحات النظام - نسخة كاملة ومُصلحة ====================
const APP_PAGES = (function() {
    'use strict';

    let currentPage = 'dashboard';

    // ==================== Page Definitions ====================
    const PAGES = {
        dashboard: { title: 'لوحة التحكم', icon: 'bi-speedometer2', render: renderDashboard },
        customers: { title: 'إدارة العملاء', icon: 'bi-people', render: renderCustomers },
        opportunities: { title: 'الفرص البيعية', icon: 'bi-briefcase', render: renderOpportunities },
        quotations: { title: 'عروض الأسعار', icon: 'bi-file-earmark-text', render: renderQuotations },
        sales_orders: { title: 'طلبات البيع', icon: 'bi-cart-check', render: renderSalesOrders },
        sales_team: { title: 'فريق المبيعات', icon: 'bi-person-badge', render: renderSalesTeam },
        suppliers: { title: 'الموردون', icon: 'bi-truck', render: renderSuppliers },
        purchase_orders: { title: 'طلبات الشراء', icon: 'bi-cart-plus', render: renderPurchaseOrders },
        inventory: { title: 'المخزون', icon: 'bi-box-seam', render: renderInventory },
        accounting: { title: 'المحاسبة', icon: 'bi-calculator', render: () => APP_ACCOUNTING.renderAccountingPage() },
        invoices: { title: 'الفواتير', icon: 'bi-receipt', render: renderInvoices },
        reports: { title: 'التقارير', icon: 'bi-graph-up', render: renderReports },
        settings: { title: 'الإعدادات', icon: 'bi-gear', render: renderSettings },
        profile: { title: 'الملف الشخصي', icon: 'bi-person', render: renderProfile }
    };

    // ==================== Navigate to Page ====================
    function navigateTo(pageId) {
        if (!PAGES[pageId]) {
            APP_CORE.showToast('الصفحة غير موجودة', 'error');
            return;
        }

        currentPage = pageId;
        const page = PAGES[pageId];

        document.getElementById('page-title').textContent = page.title;
        document.getElementById('page-icon').className = `bi ${page.icon} text-primary`;

        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('bg-primary', 'text-white');
            } else {
                link.classList.remove('bg-primary', 'text-white');
            }
        });

        const content = document.getElementById('main-content');
        if (content) {
            content.innerHTML = page.render();
        }

        document.getElementById('drawer-toggle').checked = false;
    }

    // ==================== Dashboard ====================
    function renderDashboard() {
        const customers = APP_CORE.getData('customers') || [];
        const quotations = APP_CORE.getData('quotations') || [];
        const opportunities = APP_CORE.getData('opportunities') || [];
        const products = APP_CORE.getData('products') || [];

        const totalSales = quotations.filter(q => q.status === 'closed').reduce((sum, q) => sum + (q.customerPrice || 0), 0);
        const activeOpportunities = opportunities.filter(o => o.stage !== 'closed').length;
        const lowStockProducts = products.filter(p => p.currentStock <= p.minStock).length;

        return `
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-bold mb-2">مرحباً، ${APP_CORE.appState.currentUser?.name}</h2>
                    <p class="text-gray-600 dark:text-gray-400">نظرة عامة على أداء نظامك</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="stat-card card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg" onclick="APP_PAGES.navigateTo('customers')">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">إجمالي العملاء</p>
                                    <p class="text-3xl font-bold">${customers.length}</p>
                                </div>
                                <div class="text-5xl opacity-30"><i class="bi bi-people"></i></div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">إجمالي المبيعات</p>
                                    <p class="text-3xl font-bold">${APP_CORE.formatCurrency(totalSales)}</p>
                                </div>
                                <div class="text-5xl opacity-30"><i class="bi bi-currency-dollar"></i></div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">الفرص النشطة</p>
                                    <p class="text-3xl font-bold">${activeOpportunities}</p>
                                </div>
                                <div class="text-5xl opacity-30"><i class="bi bi-briefcase"></i></div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card card bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm opacity-90">تنبيهات المخزون</p>
                                    <p class="text-3xl font-bold">${lowStockProducts}</p>
                                </div>
                                <div class="text-5xl opacity-30"><i class="bi bi-exclamation-triangle"></i></div>
                            </div>
                        </div>
                    </div>
                </div>

                ${APP_WORKFLOW.renderWorkflowDiagram()}
            </div>
        `;
    }

    // ==================== Customers ====================
    function renderCustomers() {
        const customers = APP_CORE.getData('customers') || [];
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold">إدارة العملاء</h2>
                        <p class="text-gray-600 dark:text-gray-400">${customers.length} عميل</p>
                    </div>
                    <button class="btn btn-primary" onclick="APP_CORE.showToast('قيد التطوير', 'info')">
                        <i class="bi bi-plus-lg"></i> إضافة عميل
                    </button>
                </div>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <div class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead>
                                    <tr><th>العميل</th><th>الهاتف</th><th>البريد</th><th>الحالة</th><th>الإجراءات</th></tr>
                                </thead>
                                <tbody>
                                    ${customers.map(c => `
                                        <tr>
                                            <td><div class="font-bold">${c.name}</div><div class="text-sm opacity-70">${c.nameEn || ''}</div></td>
                                            <td>${c.phone}</td>
                                            <td>${c.email}</td>
                                            <td><span class="badge badge-success">نشط</span></td>
                                            <td><button class="btn btn-ghost btn-sm"><i class="bi bi-eye"></i></button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Opportunities ====================
    function renderOpportunities() {
        const opportunities = APP_CORE.getData('opportunities') || [];
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">الفرص البيعية</h2>
                    <button class="btn btn-primary" onclick="APP_CORE.showToast('قيد التطوير', 'info')">
                        <i class="bi bi-plus-lg"></i> إضافة فرصة
                    </button>
                </div>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        ${opportunities.length === 0 ? `
                            <div class="text-center py-12">
                                <i class="bi bi-briefcase text-6xl opacity-30"></i>
                                <p class="mt-4">لا توجد فرص بيعية</p>
                            </div>
                        ` : `<p>عدد الفرص: ${opportunities.length}</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Quotations ====================
    function renderQuotations() {
        const quotations = APP_CORE.getData('quotations') || [];
        const customers = APP_CORE.getData('customers') || [];
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold">عروض الأسعار</h2>
                        <p class="text-gray-600 dark:text-gray-400">${quotations.length} عرض سعر</p>
                    </div>
                    <button class="btn btn-primary" onclick="APP_CORE.showToast('قيد التطوير', 'info')">
                        <i class="bi bi-plus-lg"></i> إنشاء عرض
                    </button>
                </div>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <div class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead>
                                    <tr><th>رقم العرض</th><th>التاريخ</th><th>العميل</th><th>المبلغ</th><th>الحالة</th></tr>
                                </thead>
                                <tbody>
                                    ${quotations.map(q => {
                                        const customer = customers.find(c => c.id === q.customerId);
                                        return `
                                            <tr>
                                                <td class="font-bold">${q.number}</td>
                                                <td>${APP_CORE.formatDate(q.date, 'short')}</td>
                                                <td>${customer?.name || 'غير محدد'}</td>
                                                <td class="font-bold text-success">${APP_CORE.formatCurrency(q.customerPrice)}</td>
                                                <td><span class="badge badge-${q.status === 'closed' ? 'success' : 'warning'}">${q.status}</span></td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Sales Orders ====================
    function renderSalesOrders() {
        return renderSimplePage('طلبات البيع', 'bi-cart-check', 'لا توجد طلبات بيع');
    }

    // ==================== Sales Team ====================
    function renderSalesTeam() {
        const salesTeam = APP_CORE.getData('salesTeam') || [];
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">فريق المبيعات</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${salesTeam.map(agent => `
                        <div class="card bg-white dark:bg-gray-800 shadow-lg">
                            <div class="card-body">
                                <div class="flex items-center gap-4">
                                    <div class="avatar placeholder">
                                        <div class="bg-primary text-white rounded-full w-16"><span>${agent.name.charAt(0)}</span></div>
                                    </div>
                                    <div>
                                        <h3 class="font-bold">${agent.name}</h3>
                                        <p class="text-sm opacity-70">${agent.position}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ==================== Suppliers ====================
    function renderSuppliers() {
        const suppliers = APP_CORE.getData('suppliers') || [];
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">الموردون</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${suppliers.map(s => `
                        <div class="card bg-white dark:bg-gray-800 shadow">
                            <div class="card-body">
                                <h3 class="card-title">${s.name}</h3>
                                <p class="text-sm">${s.phone}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ==================== Purchase Orders ====================
    function renderPurchaseOrders() {
        return renderSimplePage('طلبات الشراء', 'bi-cart-plus', 'لا توجد طلبات شراء');
    }

    // ==================== Inventory ====================
    function renderInventory() {
        const products = APP_CORE.getData('products') || [];
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">المخزون</h2>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <table class="table table-zebra w-full">
                            <thead><tr><th>المنتج</th><th>المخزون</th><th>الحالة</th></tr></thead>
                            <tbody>
                                ${products.map(p => `
                                    <tr>
                                        <td>${p.name}</td>
                                        <td>${p.currentStock}</td>
                                        <td><span class="badge badge-${p.currentStock > p.minStock ? 'success' : 'warning'}">${p.currentStock > p.minStock ? 'متوفر' : 'منخفض'}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Invoices ====================
    function renderInvoices() {
        const invoices = APP_CORE.getData('invoices') || [];
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">الفواتير</h2>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <p>عدد الفواتير: ${invoices.length}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Reports ====================
    function renderReports() {
        const stats = APP_REAL_DATA.calculateRealStatistics();
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">التقارير والإحصائيات</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="stats shadow"><div class="stat"><div class="stat-title">إجمالي المبيعات</div><div class="stat-value text-success">${APP_CORE.formatCurrency(stats.totalSales)}</div></div></div>
                    <div class="stats shadow"><div class="stat"><div class="stat-title">إجمالي التكاليف</div><div class="stat-value text-error">${APP_CORE.formatCurrency(stats.totalCost)}</div></div></div>
                    <div class="stats shadow"><div class="stat"><div class="stat-title">صافي الربح</div><div class="stat-value text-primary">${APP_CORE.formatCurrency(stats.totalProfit)}</div></div></div>
                </div>
            </div>
        `;
    }

    // ==================== Settings ====================
    function renderSettings() {
        return renderSimplePage('الإعدادات', 'bi-gear', 'إعدادات النظام');
    }

    // ==================== Profile ====================
    function renderProfile() {
        const user = APP_CORE.appState.currentUser;
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">الملف الشخصي</h2>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <div class="flex items-center gap-6">
                            <div class="avatar placeholder">
                                <div class="bg-primary text-white rounded-full w-24 text-3xl"><span>${user?.avatar}</span></div>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold">${user?.name}</h3>
                                <p>${user?.email}</p>
                                <p class="text-sm opacity-70">${user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Helper Functions ====================
    function renderSimplePage(title, icon, emptyMessage) {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">${title}</h2>
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <div class="text-center py-12">
                            <i class="bi ${icon} text-6xl opacity-30"></i>
                            <p class="mt-4">${emptyMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Public API ====================
    return {
        navigateTo,
        getCurrentPage: () => currentPage,
        showAddCustomerModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddOpportunityModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddQuotationModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddSalesOrderModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddSalesAgentModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddSupplierModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddPurchaseOrderModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddProductModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        showAddInvoiceModal: () => APP_CORE.showToast('قيد التطوير', 'info'),
        viewCustomer: (id) => APP_CORE.showToast(`عرض عميل: ${id}`, 'info'),
        editCustomer: (id) => APP_CORE.showToast(`تعديل عميل: ${id}`, 'info'),
        viewQuotation: (id) => APP_CORE.showToast(`عرض: ${id}`, 'info'),
        printQuotation: (id) => APP_CORE.showToast(`طباعة: ${id}`, 'info'),
        adjustStock: (id) => APP_CORE.showToast(`تعديل مخزون: ${id}`, 'info'),
        filterCustomers: () => console.log('Filter'),
        exportCustomers: () => APP_CORE.showToast('تصدير العملاء', 'info'),
        createQuotationForCustomer: (id) => APP_CORE.showToast(`إنشاء عرض للعميل: ${id}`, 'info'),
        convertOpportunityToQuotation: (id) => APP_CORE.showToast(`تحويل فرصة: ${id}`, 'info')
    };
})();

// ==================== Helper Functions (Global) ====================
function getOpportunityStageName(stage) {
    const stages = { prospecting: 'استكشاف', qualification: 'تأهيل', proposal: 'عرض', negotiation: 'تفاوض', closed: 'مغلقة' };
    return stages[stage] || stage;
}

function getPriorityName(priority) {
    const priorities = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    return priorities[priority] || priority;
}

function getQuotationStatusName(status) {
    const statuses = { draft: 'مسودة', pending: 'قيد الانتظار', approved: 'معتمد', closed: 'مغلق', po: 'أمر شراء' };
    return statuses[status] || status;
}

function getQuotationStatusBadge(status) {
    const badges = { draft: 'badge-ghost', pending: 'badge-warning', approved: 'badge-success', closed: 'badge-info', po: 'badge-primary' };
    return badges[status] || 'badge-ghost';
}