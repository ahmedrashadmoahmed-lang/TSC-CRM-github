// ==================== صفحة عروض الأسعار الكاملة - مُصلح ====================
console.log('📄 تحميل APP_PAGES_COMPLETE...');

const APP_PAGES_COMPLETE = (function() {
    'use strict';

    // ==================== دوال مساعدة محلية ====================
    function getQuotationStatusNameLocal(status) {
        const statuses = {
            draft: 'مسودة',
            pending: 'قيد الانتظار',
            approved: 'معتمد',
            closed: 'مغلق',
            po: 'أمر شراء',
            rejected: 'مرفوض'
        };
        return statuses[status] || status;
    }

    function getQuotationStatusBadgeLocal(status) {
        const badges = {
            draft: 'badge-ghost',
            pending: 'badge-warning',
            approved: 'badge-success',
            closed: 'badge-info',
            po: 'badge-primary',
            rejected: 'badge-error'
        };
        return badges[status] || 'badge-ghost';
    }

    // ==================== عرض صفحة عروض الأسعار الكاملة ====================
    function renderQuotationsComplete() {
        console.log('🎨 رسم صفحة عروض الأسعار الكاملة...');
        
        const quotations = APP_CORE.getData('quotations') || [];
        const customers = APP_CORE.getData('customers') || [];
        
        // حساب الإحصائيات
        const totalQuotations = quotations.length;
        const closedQuotations = quotations.filter(q => q.status === 'closed').length;
        const totalSales = quotations.filter(q => q.status === 'closed').reduce((sum, q) => sum + (q.customerPrice || 0), 0);
        const totalProfit = quotations.filter(q => q.status === 'closed').reduce((sum, q) => sum + (q.profit || 0), 0);
        const avgProfitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 class="text-3xl font-bold flex items-center gap-3">
                            <i class="bi bi-file-earmark-text text-primary"></i>
                            عروض الأسعار
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 mt-2">إدارة شاملة لجميع عروض الأسعار</p>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button class="btn btn-outline btn-sm" onclick="exportQuotationsToExcel()">
                            <i class="bi bi-file-earmark-excel"></i>
                            تصدير Excel
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="showAddQuotationModal()">
                            <i class="bi bi-plus-lg"></i>
                            إنشاء عرض جديد
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="stats shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-file-earmark-text text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">إجمالي العروض</div>
                            <div class="stat-value">${totalQuotations}</div>
                            <div class="stat-desc text-white opacity-75">${closedQuotations} مغلق</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-currency-dollar text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">إجمالي المبيعات</div>
                            <div class="stat-value text-2xl">${APP_CORE.formatCurrency(totalSales)}</div>
                            <div class="stat-desc text-white opacity-75">من العروض المغلقة</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-graph-up-arrow text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">صافي الربح</div>
                            <div class="stat-value text-2xl">${APP_CORE.formatCurrency(totalProfit)}</div>
                            <div class="stat-desc text-white opacity-75">${avgProfitMargin}% هامش ربح</div>
                        </div>
                    </div>

                    <div class="stats shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div class="stat">
                            <div class="stat-figure text-white opacity-40">
                                <i class="bi bi-clock-history text-4xl"></i>
                            </div>
                            <div class="stat-title text-white opacity-90">قيد الانتظار</div>
                            <div class="stat-value">${quotations.filter(q => q.status === 'pending').length}</div>
                            <div class="stat-desc text-white opacity-75">يحتاج متابعة</div>
                        </div>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="form-control">
                                <label class="label"><span class="label-text">بحث</span></label>
                                <input type="text" placeholder="ابحث في العروض..." class="input input-bordered input-sm" id="quotation-search" onkeyup="filterQuotationsLocal()" />
                            </div>
                            
                            <div class="form-control">
                                <label class="label"><span class="label-text">الحالة</span></label>
                                <select class="select select-bordered select-sm" id="quotation-status-filter" onchange="filterQuotationsLocal()">
                                    <option value="">الكل</option>
                                    <option value="draft">مسودة</option>
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="closed">مغلق</option>
                                    <option value="po">أمر شراء</option>
                                </select>
                            </div>
                            
                            <div class="form-control">
                                <label class="label"><span class="label-text">مندوب المبيعات</span></label>
                                <select class="select select-bordered select-sm" id="quotation-sales-filter" onchange="filterQuotationsLocal()">
                                    <option value="">الكل</option>
                                    <option value="Heba">Heba</option>
                                    <option value="Doaa">Doaa</option>
                                </select>
                            </div>
                            
                            <div class="form-control">
                                <label class="label"><span class="label-text">ترتيب حسب</span></label>
                                <select class="select select-bordered select-sm" id="quotation-sort" onchange="filterQuotationsLocal()">
                                    <option value="date-desc">الأحدث أولاً</option>
                                    <option value="date-asc">الأقدم أولاً</option>
                                    <option value="amount-desc">الأعلى سعراً</option>
                                    <option value="amount-asc">الأقل سعراً</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quotations Table -->
                <div class="card bg-white dark:bg-gray-800 shadow-lg">
                    <div class="card-body p-0">
                        <div class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead class="bg-base-200 sticky top-0">
                                    <tr>
                                        <th>رقم العرض</th>
                                        <th>التاريخ</th>
                                        <th>العميل</th>
                                        <th>التفاصيل</th>
                                        <th>المندوب</th>
                                        <th>التكلفة</th>
                                        <th>السعر</th>
                                        <th>الربح</th>
                                        <th>الهامش</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="quotations-table-body">
                                    ${quotations.length === 0 ? `
                                        <tr>
                                            <td colspan="11" class="text-center py-12">
                                                <div class="empty-state">
                                                    <i class="bi bi-file-earmark-text text-6xl opacity-30"></i>
                                                    <p class="mt-4 text-lg">لا توجد عروض أسعار</p>
                                                    <button class="btn btn-primary btn-sm mt-4" onclick="showAddQuotationModal()">
                                                        <i class="bi bi-plus-lg"></i>
                                                        إنشاء عرض جديد
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ` : quotations.map(quotation => {
                                        const customer = customers.find(c => c.id === quotation.customerId);
                                        const profitMargin = quotation.customerPrice > 0 ? ((quotation.profit / quotation.customerPrice) * 100).toFixed(1) : 0;
                                        
                                        return `
                                            <tr class="quotation-row hover:bg-base-200 transition-colors" 
                                                data-status="${quotation.status}" 
                                                data-sales="${quotation.salesPerson || ''}"
                                                data-date="${quotation.date}"
                                                data-amount="${quotation.customerPrice}">
                                                <td>
                                                    <span class="font-bold text-primary cursor-pointer hover:underline" onclick="viewQuotationDetailsLocal('${quotation.id}')">
                                                        ${quotation.number}
                                                    </span>
                                                </td>
                                                <td class="text-sm">${APP_CORE.formatDate(quotation.date, 'short')}</td>
                                                <td>
                                                    <div class="flex items-center gap-2">
                                                        <div class="avatar placeholder">
                                                            <div class="bg-primary text-white rounded-full w-8 text-xs">
                                                                <span>${(customer?.name || 'X').charAt(0)}</span>
                                                            </div>
                                                        </div>
                                                        <div class="max-w-xs truncate font-semibold text-sm">${customer?.name || 'غير محدد'}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="max-w-xs truncate text-sm" title="${quotation.details || ''}">
                                                        ${quotation.details || 'غير محدد'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span class="badge badge-ghost badge-sm">${quotation.salesPerson || 'غير محدد'}</span>
                                                </td>
                                                <td class="text-error font-semibold">${APP_CORE.formatCurrency(quotation.cost || 0)}</td>
                                                <td class="font-bold text-lg">${APP_CORE.formatCurrency(quotation.customerPrice || 0)}</td>
                                                <td class="text-success font-semibold">${APP_CORE.formatCurrency(quotation.profit || 0)}</td>
                                                <td>
                                                    <div class="radial-progress text-xs ${profitMargin > 20 ? 'text-success' : profitMargin > 10 ? 'text-warning' : 'text-error'}" 
                                                         style="--value:${Math.min(profitMargin * 2, 100)}; --size:2.5rem; --thickness: 3px;">
                                                        ${profitMargin}%
                                                    </div>
                                                </td>
                                                <td>
                                                    <span class="badge ${getQuotationStatusBadgeLocal(quotation.status)} badge-sm">
                                                        ${getQuotationStatusNameLocal(quotation.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="flex gap-1">
                                                        <button class="btn btn-ghost btn-sm" onclick="viewQuotationDetailsLocal('${quotation.id}')" title="عرض">
                                                            <i class="bi bi-eye"></i>
                                                        </button>
                                                        <button class="btn btn-ghost btn-sm" onclick="printQuotation('${quotation.id}')" title="طباعة">
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
                    </div>
                </div>

                <!-- Pagination -->
                ${quotations.length > 0 ? `
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            عرض ${quotations.length} من ${quotations.length} عرض
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ==================== عرض تفاصيل عرض السعر ====================
    function viewQuotationDetailsLocal(quotationId) {
        const quotations = APP_CORE.getData('quotations') || [];
        const customers = APP_CORE.getData('customers') || [];
        const quotation = quotations.find(q => q.id === quotationId);
        
        if (!quotation) {
            APP_CORE.showToast('عرض السعر غير موجود', 'error');
            return;
        }
        
        const customer = customers.find(c => c.id === quotation.customerId);
        const profitMargin = quotation.customerPrice > 0 ? ((quotation.profit / quotation.customerPrice) * 100).toFixed(1) : 0;
        
        const modalHTML = `
            <dialog id="quotationDetailsModal" class="modal modal-open">
                <div class="modal-box max-w-4xl">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute left-2 top-2">✕</button>
                    </form>
                    
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h3 class="font-bold text-2xl text-primary">${quotation.number}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                ${APP_CORE.formatDate(quotation.date, 'full')}
                            </p>
                        </div>
                        <span class="badge ${getQuotationStatusBadgeLocal(quotation.status)} badge-lg">
                            ${getQuotationStatusNameLocal(quotation.status)}
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="card bg-base-200">
                            <div class="card-body">
                                <h4 class="card-title text-sm">معلومات العميل</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm opacity-70">العميل:</span>
                                        <span class="font-semibold">${customer?.name || 'غير محدد'}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm opacity-70">الهاتف:</span>
                                        <span class="font-semibold">${customer?.phone || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card bg-base-200">
                            <div class="card-body">
                                <h4 class="card-title text-sm">معلومات المبيعات</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm opacity-70">المندوب:</span>
                                        <span class="font-semibold">${quotation.salesPerson || 'غير محدد'}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm opacity-70">الموردون:</span>
                                        <span class="font-semibold text-xs">${quotation.suppliers || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-base-200 mb-6">
                        <div class="card-body">
                            <h4 class="card-title text-sm mb-3">تفاصيل العرض</h4>
                            <p class="text-sm leading-relaxed">${quotation.details || 'غير محدد'}</p>
                        </div>
                    </div>

                    <div class="card bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <div class="card-body">
                            <h4 class="card-title text-white">الملخص المالي</h4>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <p class="text-xs opacity-75">التكلفة</p>
                                    <p class="text-xl font-bold">${APP_CORE.formatCurrency(quotation.cost || 0)}</p>
                                </div>
                                <div>
                                    <p class="text-xs opacity-75">السعر</p>
                                    <p class="text-xl font-bold">${APP_CORE.formatCurrency(quotation.customerPrice || 0)}</p>
                                </div>
                                <div>
                                    <p class="text-xs opacity-75">الربح</p>
                                    <p class="text-xl font-bold">${APP_CORE.formatCurrency(quotation.profit || 0)}</p>
                                </div>
                                <div>
                                    <p class="text-xs opacity-75">الهامش</p>
                                    <p class="text-xl font-bold">${profitMargin}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-action">
                        <button class="btn btn-ghost" onclick="closeQuotationDetailsModal()">إغلاق</button>
                        <button class="btn btn-outline" onclick="printQuotation('${quotation.id}')">
                            <i class="bi bi-printer"></i> طباعة
                        </button>
                    </div>
                </div>
            </dialog>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ==================== فلترة العروض ====================
    function filterQuotationsLocal() {
        const searchTerm = document.getElementById('quotation-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('quotation-status-filter')?.value || '';
        const salesFilter = document.getElementById('quotation-sales-filter')?.value || '';
        const sortBy = document.getElementById('quotation-sort')?.value || 'date-desc';
        
        const rows = Array.from(document.querySelectorAll('.quotation-row'));
        
        // فلترة
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const status = row.dataset.status;
            const sales = row.dataset.sales;
            
            let show = true;
            
            if (searchTerm && !text.includes(searchTerm)) show = false;
            if (statusFilter && status !== statusFilter) show = false;
            if (salesFilter && sales !== salesFilter) show = false;
            
            row.style.display = show ? '' : 'none';
        });

        // ترتيب
        const visibleRows = rows.filter(r => r.style.display !== 'none');
        visibleRows.sort((a, b) => {
            switch(sortBy) {
                case 'date-desc':
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                case 'date-asc':
                    return new Date(a.dataset.date) - new Date(b.dataset.date);
                case 'amount-desc':
                    return parseFloat(b.dataset.amount) - parseFloat(a.dataset.amount);
                case 'amount-asc':
                    return parseFloat(a.dataset.amount) - parseFloat(b.dataset.amount);
                default:
                    return 0;
            }
        });

        const tbody = document.getElementById('quotations-table-body');
        if (tbody) {
            visibleRows.forEach(row => tbody.appendChild(row));
        }
    }

    // ==================== تصدير Excel ====================
    function exportQuotationsToExcelLocal() {
        const quotations = APP_CORE.getData('quotations') || [];
        const customers = APP_CORE.getData('customers') || [];
        
        if (quotations.length === 0) {
            APP_CORE.showToast('لا توجد بيانات للتصدير', 'warning');
            return;
        }
        
        const data = quotations.map(q => {
            const customer = customers.find(c => c.id === q.customerId);
            const profitMargin = q.customerPrice > 0 ? ((q.profit / q.customerPrice) * 100).toFixed(2) : 0;
            
            return {
                'رقم العرض': q.number,
                'التاريخ': new Date(q.date).toLocaleDateString('ar-SA'),
                'العميل': customer?.name || 'غير محدد',
                'التفاصيل': q.details,
                'المندوب': q.salesPerson,
                'الموردون': q.suppliers || '',
                'التكلفة': q.cost,
                'السعر': q.customerPrice,
                'الربح': q.profit,
                'هامش الربح %': profitMargin,
                'الحالة': getQuotationStatusNameLocal(q.status)
            };
        });
        
        if (typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "عروض الأسعار");
            XLSX.writeFile(wb, `quotations-${new Date().toISOString().split('T')[0]}.xlsx`);
            APP_CORE.showToast('تم تصدير البيانات بنجاح ✅', 'success');
        } else {
            APP_CORE.showToast('مكتبة XLSX غير محمّلة', 'error');
        }
    }

    // ==================== دوال عامة للاستخدام في HTML ====================
    window.viewQuotationDetailsLocal = viewQuotationDetailsLocal;
    window.filterQuotationsLocal = filterQuotationsLocal;
    window.exportQuotationsToExcel = exportQuotationsToExcelLocal;
    window.closeQuotationDetailsModal = function() {
        const modal = document.getElementById('quotationDetailsModal');
        if (modal) modal.remove();
    };

    // ==================== Public API ====================
    console.log('✅ APP_PAGES_COMPLETE جاهز');
    
    return {
        renderQuotationsComplete,
        viewQuotationDetails: viewQuotationDetailsLocal,
        exportQuotationsToExcel: exportQuotationsToExcelLocal,
        filterQuotations: filterQuotationsLocal
    };
})();