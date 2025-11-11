// ==================== إكمال جميع الصفحات المتبقية ====================
const APP_PAGES_FINAL = (function() {
    'use strict';

    // ==================== صفحة الفرص البيعية - كاملة ====================
    function renderOpportunitiesComplete() {
        const opportunities = APP_CORE.getData('opportunities') || [];
        const customers = APP_CORE.getData('customers') || [];
        const salesTeam = APP_CORE.getData('salesTeam') || [];

        const totalValue = opportunities.reduce((sum, o) => sum + (o.expectedValue || 0), 0);
        const highPriority = opportunities.filter(o => o.priority === 'high').length;
        const avgProbability = opportunities.length > 0 
            ? (opportunities.reduce((sum, o) => sum + (o.probability || 0), 0) / opportunities.length).toFixed(0)
            : 0;

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-3xl font-bold flex items-center gap-3">
                            <i class="bi bi-briefcase text-primary"></i>
                            الفرص البيعية
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 mt-2">إدارة وتتبع جميع الفرص المحتملة</p>
                    </div>
                    <button class="btn btn-primary" onclick="APP_MODALS_EXTENDED.showAddOpportunityModal()">
                        <i class="bi bi-plus-lg"></i>
                        إضافة فرصة جديدة
                    </button>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="stats shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-briefcase text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">إجمالي الفرص</div>
                            <div class="stat-value">${opportunities.length}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-currency-dollar text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">القيمة المتوقعة</div>
                            <div class="stat-value text-2xl">${APP_CORE.formatCurrency(totalValue)}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-exclamation-triangle text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">أولوية عالية</div>
                            <div class="stat-value">${highPriority}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-percent text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">متوسط النجاح</div>
                            <div class="stat-value">${avgProbability}%</div>
                        </div>
                    </div>
                </div>

                <!-- Kanban Board -->
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="card-title">
                                <i class="bi bi-columns-gap text-primary"></i>
                                لوحة كانبان
                            </h3>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-active">كانبان</button>
                                <button class="btn btn-sm" onclick="APP_PAGES_FINAL.toggleOpportunityView('list')">قائمة</button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="opportunities-kanban">
                            ${renderOpportunityKanban(opportunities, customers)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderOpportunityKanban(opportunities, customers) {
        const stages = [
            { id: 'prospecting', name: 'استكشاف', icon: 'bi-search', color: 'blue' },
            { id: 'qualification', name: 'تأهيل', icon: 'bi-check-circle', color: 'yellow' },
            { id: 'proposal', name: 'عرض', icon: 'bi-file-earmark-text', color: 'purple' },
            { id: 'negotiation', name: 'تفاوض', icon: 'bi-chat-dots', color: 'orange' },
            { id: 'closed', name: 'مغلقة', icon: 'bi-check-all', color: 'green' }
        ];

        return stages.map(stage => {
            const stageOpportunities = opportunities.filter(o => o.stage === stage.id);
            const stageValue = stageOpportunities.reduce((sum, o) => sum + (o.expectedValue || 0), 0);

            return `
                <div class="card bg-base-200 shadow">
                    <div class="card-body p-4">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-bold flex items-center gap-2">
                                <i class="bi ${stage.icon} text-${stage.color}-500"></i>
                                ${stage.name}
                            </h4>
                            <span class="badge badge-${stage.color} badge-sm">${stageOpportunities.length}</span>
                        </div>
                        <p class="text-xs opacity-70 mb-3">${APP_CORE.formatCurrency(stageValue)}</p>
                        
                        <div class="space-y-2 max-h-96 overflow-y-auto">
                            ${stageOpportunities.length === 0 ? `
                                <p class="text-center text-sm opacity-50 py-8">لا توجد فرص</p>
                            ` : stageOpportunities.map(opp => {
                                const customer = customers.find(c => c.id === opp.customerId);
                                return `
                                    <div class="card bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                                         onclick="APP_MODALS_EXTENDED.viewOpportunityDetails('${opp.id}')">
                                        <div class="card-body p-3">
                                            <h5 class="font-semibold text-sm mb-1">${opp.title}</h5>
                                            <p class="text-xs opacity-70 mb-2">${customer?.name || 'غير محدد'}</p>
                                            <div class="flex items-center justify-between">
                                                <span class="text-xs font-bold text-success">${APP_CORE.formatCurrency(opp.expectedValue)}</span>
                                                <div class="flex items-center gap-1">
                                                    <div class="radial-progress text-xs" style="--value:${opp.probability}; --size:1.5rem;">
                                                        <span class="text-[0.5rem]">${opp.probability}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            ${opp.priority === 'high' ? `
                                                <div class="badge badge-error badge-xs mt-2">عاجل</div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ==================== صفحة طلبات البيع - كاملة ====================
    function renderSalesOrdersComplete() {
        const salesOrders = APP_CORE.getData('salesOrders') || [];
        const customers = APP_CORE.getData('customers') || [];

        const totalOrders = salesOrders.length;
        const pendingOrders = salesOrders.filter(so => so.status === 'pending').length;
        const totalValue = salesOrders.reduce((sum, so) => sum + (so.totalAmount || 0), 0);

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-3xl font-bold flex items-center gap-3">
                            <i class="bi bi-cart-check text-primary"></i>
                            طلبات البيع
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 mt-2">إدارة وتتبع طلبات البيع</p>
                    </div>
                    <button class="btn btn-primary" onclick="APP_MODALS_EXTENDED.showAddSalesOrderModal()">
                        <i class="bi bi-plus-lg"></i>
                        إنشاء طلب بيع
                    </button>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-primary">
                                <i class="bi bi-cart-check text-3xl"></i>
                            </div>
                            <div class="stat-title">إجمالي الطلبات</div>
                            <div class="stat-value text-primary">${totalOrders}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-warning">
                                <i class="bi bi-clock-history text-3xl"></i>
                            </div>
                            <div class="stat-title">قيد الانتظار</div>
                            <div class="stat-value text-warning">${pendingOrders}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-success">
                                <i class="bi bi-currency-dollar text-3xl"></i>
                            </div>
                            <div class="stat-title">القيمة الإجمالية</div>
                            <div class="stat-value text-success text-2xl">${APP_CORE.formatCurrency(totalValue)}</div>
                        </div>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        ${salesOrders.length === 0 ? `
                            <div class="empty-state py-16">
                                <i class="bi bi-cart-check text-6xl opacity-30"></i>
                                <p class="mt-4 text-lg">لا توجد طلبات بيع</p>
                                <p class="text-sm opacity-70 mt-2">يمكنك إنشاء طلب بيع من عرض سعر معتمد</p>
                                <div class="flex gap-2 justify-center mt-6">
                                    <button class="btn btn-primary btn-sm" onclick="APP_MODALS_EXTENDED.showAddSalesOrderModal()">
                                        <i class="bi bi-plus-lg"></i>
                                        إنشاء طلب بيع
                                    </button>
                                    <button class="btn btn-outline btn-sm" onclick="APP_PAGES.navigateTo('quotations')">
                                        <i class="bi bi-file-earmark-text"></i>
                                        عروض الأسعار
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="overflow-x-auto">
                                <table class="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>رقم الطلب</th>
                                            <th>التاريخ</th>
                                            <th>العميل</th>
                                            <th>المبلغ</th>
                                            <th>الحالة</th>
                                            <th>الدفع</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${salesOrders.map(order => {
                                            const customer = customers.find(c => c.id === order.customerId);
                                            return `
                                                <tr>
                                                    <td class="font-bold text-primary">${order.number}</td>
                                                    <td>${APP_CORE.formatDate(order.date, 'short')}</td>
                                                    <td>${customer?.name || 'غير محدد'}</td>
                                                    <td class="font-bold">${APP_CORE.formatCurrency(order.totalAmount)}</td>
                                                    <td>
                                                        <span class="badge badge-${order.status === 'approved' ? 'success' : order.status === 'pending' ? 'warning' : 'ghost'}">
                                                            ${order.status === 'approved' ? 'معتمد' : order.status === 'pending' ? 'قيد الانتظار' : 'مسودة'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span class="badge badge-${order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'partial' ? 'warning' : 'error'} badge-sm">
                                                            ${order.paymentStatus === 'paid' ? 'مدفوع' : order.paymentStatus === 'partial' ? 'جزئي' : 'معلق'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div class="flex gap-1">
                                                            <button class="btn btn-ghost btn-sm" onclick="APP_MODALS_EXTENDED.viewSalesOrderDetails('${order.id}')">
                                                                <i class="bi bi-eye"></i>
                                                            </button>
                                                            <button class="btn btn-ghost btn-sm" onclick="APP_PRINT.printSalesOrder('${order.id}')">
                                                                <i class="bi bi-printer"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== صفحة المخزون - كاملة ====================
    function renderInventoryComplete() {
        const products = APP_CORE.getData('products') || [];
        
        const totalProducts = products.length;
        const inStock = products.filter(p => p.currentStock > p.minStock).length;
        const lowStock = products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0).length;
        const outOfStock = products.filter(p => p.currentStock === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-3xl font-bold flex items-center gap-3">
                            <i class="bi bi-box-seam text-primary"></i>
                            إدارة المخزون
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 mt-2">مراقبة وإدارة مخزون المنتجات</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm" onclick="APP_PAGES_FINAL.exportInventoryToExcel()">
                            <i class="bi bi-file-earmark-excel"></i>
                            تصدير
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="APP_MODALS_EXTENDED.showAddProductModal()">
                            <i class="bi bi-plus-lg"></i>
                            إضافة منتج
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-primary">
                                <i class="bi bi-box-seam text-3xl"></i>
                            </div>
                            <div class="stat-title">إجمالي المنتجات</div>
                            <div class="stat-value text-primary">${totalProducts}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-success">
                                <i class="bi bi-check-circle text-3xl"></i>
                            </div>
                            <div class="stat-title">متوفر</div>
                            <div class="stat-value text-success">${inStock}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-warning">
                                <i class="bi bi-exclamation-triangle text-3xl"></i>
                            </div>
                            <div class="stat-title">منخفض</div>
                            <div class="stat-value text-warning">${lowStock}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-error">
                                <i class="bi bi-x-circle text-3xl"></i>
                            </div>
                            <div class="stat-title">نفد</div>
                            <div class="stat-value text-error">${outOfStock}</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg">
                        <div class="stat">
                            <div class="stat-figure text-info">
                                <i class="bi bi-currency-dollar text-3xl"></i>
                            </div>
                            <div class="stat-title">قيمة المخزون</div>
                            <div class="stat-value text-info text-xl">${APP_CORE.formatCurrency(totalValue)}</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card bg-white dark:bg-gray-800 shadow">
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="text" placeholder="بحث..." class="input input-bordered input-sm" id="inventory-search" onkeyup="APP_PAGES_FINAL.filterInventory()" />
                            
                            <select class="select select-bordered select-sm" id="inventory-category-filter" onchange="APP_PAGES_FINAL.filterInventory()">
                                <option value="">جميع الفئات</option>
                                <option value="أجهزة كمبيوتر">أجهزة كمبيوتر</option>
                                <option value="طابعات">طابعات</option>
                                <option value="اكسسوارات">اكسسوارات</option>
                            </select>
                            
                            <select class="select select-bordered select-sm" id="inventory-status-filter" onchange="APP_PAGES_FINAL.filterInventory()">
                                <option value="">جميع الحالات</option>
                                <option value="in-stock">متوفر</option>
                                <option value="low-stock">منخفض</option>
                                <option value="out-of-stock">نفد</option>
                            </select>

                            <button class="btn btn-sm btn-outline" onclick="APP_PAGES_FINAL.resetInventoryFilters()">
                                <i class="bi bi-arrow-clockwise"></i>
                                إعادة تعيين
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body p-0">
                        <div class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead class="bg-base-200">
                                    <tr>
                                        <th>المنتج</th>
                                        <th>SKU</th>
                                        <th>الفئة</th>
                                        <th>سعر الشراء</th>
                                        <th>سعر البيع</th>
                                        <th>المخزون الحالي</th>
                                        <th>الحد الأدنى</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-table-body">
                                    ${products.map(product => {
                                        const stockStatus = product.currentStock > product.minStock ? 'in-stock' : 
                                                          product.currentStock > 0 ? 'low-stock' : 'out-of-stock';
                                        
                                        return `
                                            <tr class="inventory-row" data-category="${product.category}" data-status="${stockStatus}">
                                                <td>
                                                    <div class="font-bold">${product.name}</div>
                                                    <div class="text-xs opacity-70">${product.sku}</div>
                                                </td>
                                                <td class="font-mono text-sm">${product.sku}</td>
                                                <td><span class="badge badge-ghost badge-sm">${product.category}</span></td>
                                                <td class="text-error">${APP_CORE.formatCurrency(product.purchasePrice)}</td>
                                                <td class="font-bold">${APP_CORE.formatCurrency(product.sellingPrice)}</td>
                                                <td>
                                                    <div class="flex items-center gap-2">
                                                        <span class="font-bold text-lg">${product.currentStock}</span>
                                                        ${product.currentStock <= product.minStock && product.currentStock > 0 ? 
                                                            '<i class="bi bi-exclamation-triangle text-warning"></i>' : 
                                                            product.currentStock === 0 ? '<i class="bi bi-x-circle text-error"></i>' : ''}
                                                    </div>
                                                </td>
                                                <td class="text-sm opacity-70">${product.minStock}</td>
                                                <td>
                                                    <span class="badge ${
                                                        product.currentStock > product.minStock ? 'badge-success' : 
                                                        product.currentStock > 0 ? 'badge-warning' : 'badge-error'
                                                    } badge-sm">
                                                        ${product.currentStock > product.minStock ? 'متوفر' : 
                                                          product.currentStock > 0 ? 'منخفض' : 'نفد'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="dropdown dropdown-end">
                                                        <button tabindex="0" class="btn btn-ghost btn-xs">
                                                            <i class="bi bi-three-dots-vertical"></i>
                                                        </button>
                                                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-52">
                                                            <li><a onclick="APP_MODALS_EXTENDED.adjustStock('${product.id}')">
                                                                <i class="bi bi-plus-slash-minus"></i> تعديل المخزون
                                                            </a></li>
                                                            <li><a onclick="APP_MODALS_EXTENDED.viewProductHistory('${product.id}')">
                                                                <i class="bi bi-clock-history"></i> سجل الحركات
                                                            </a></li>
                                                            <li><a onclick="APP_MODALS_EXTENDED.editProduct('${product.id}')">
                                                                <i class="bi bi-pencil"></i> تعديل
                                                            </a></li>
                                                            <li class="border-t mt-2 pt-2">
                                                                <a class="text-error" onclick="APP_PAGES_FINAL.deleteProduct('${product.id}')">
                                                                    <i class="bi bi-trash"></i> حذف
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
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

    // ==================== دوال مساعدة ====================
    function filterInventory() {
        const search = document.getElementById('inventory-search')?.value.toLowerCase() || '';
        const category = document.getElementById('inventory-category-filter')?.value || '';
        const status = document.getElementById('inventory-status-filter')?.value || '';
        
        const rows = document.querySelectorAll('.inventory-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const rowCategory = row.dataset.category;
            const rowStatus = row.dataset.status;
            
            let show = true;
            
            if (search && !text.includes(search)) show = false;
            if (category && rowCategory !== category) show = false;
            if (status && rowStatus !== status) show = false;
            
            row.style.display = show ? '' : 'none';
        });
    }

    function exportInventoryToExcel() {
        const products = APP_CORE.getData('products') || [];
        
        const data = products.map(p => ({
            'اسم المنتج': p.name,
            'SKU': p.sku,
            'الفئة': p.category,
            'سعر الشراء': p.purchasePrice,
            'سعر البيع': p.sellingPrice,
            'المخزون الحالي': p.currentStock,
            'الحد الأدنى': p.minStock,
            'القيمة الإجمالية': p.currentStock * p.sellingPrice,
            'الحالة': p.currentStock > p.minStock ? 'متوفر' : p.currentStock > 0 ? 'منخفض' : 'نفد'
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "المخزون");
        
        XLSX.writeFile(wb, `inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        APP_CORE.showToast('تم تصدير المخزون بنجاح ✅', 'success');
    }

    // ==================== Public API ====================
    return {
        renderOpportunitiesComplete,
        renderSalesOrdersComplete,
        renderInventoryComplete,
        filterInventory,
        exportInventoryToExcel,
        resetInventoryFilters: () => {
            document.getElementById('inventory-search').value = '';
            document.getElementById('inventory-category-filter').value = '';
            document.getElementById('inventory-status-filter').value = '';
            filterInventory();
        },
        toggleOpportunityView: (view) => APP_CORE.showToast(`عرض ${view} قيد التطوير`, 'info'),
        deleteProduct: (id) => {
            if (confirm('هل تريد حذف هذا المنتج؟')) {
                APP_CORE.deleteItem('products', id);
                APP_CORE.showToast('تم حذف المنتج', 'success');
                APP_PAGES.navigateTo('inventory');
            }
        }
    };
})();

// تحديث APP_PAGES
if (typeof APP_PAGES !== 'undefined') {
    const originalRenderOpportunities = APP_PAGES.opportunities?.render;
    if (APP_PAGES.PAGES) {
        APP_PAGES.PAGES.opportunities.render = APP_PAGES_FINAL.renderOpportunitiesComplete;
        APP_PAGES.PAGES.sales_orders.render = APP_PAGES_FINAL.renderSalesOrdersComplete;
        APP_PAGES.PAGES.inventory.render = APP_PAGES_FINAL.renderInventoryComplete;
    }
}