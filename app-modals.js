// ==================== نماذج متقدمة للإضافة والتعديل ====================
const APP_MODALS_EXTENDED = (function() {
    'use strict';

    // ==================== إضافة فرصة بيعية ====================
    function showAddOpportunityModal() {
        const customers = APP_CORE.getData('customers') || [];
        const salesTeam = APP_CORE.getData('salesTeam') || [];
        
        const modalHTML = `
            <dialog id="addOpportunityModal" class="modal modal-open">
                <div class="modal-box max-w-3xl">
                    <h3 class="font-bold text-lg mb-4">
                        <i class="bi bi-briefcase-fill text-primary"></i>
                        إضافة فرصة بيعية جديدة
                    </h3>
                    
                    <form id="addOpportunityForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- عنوان الفرصة -->
                            <div class="form-control md:col-span-2">
                                <label class="label"><span class="label-text">عنوان الفرصة *</span></label>
                                <input type="text" name="title" class="input input-bordered" required placeholder="مثال: توريد أجهزة كمبيوتر - شركة X" />
                            </div>
                            
                            <!-- العميل -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">العميل *</span></label>
                                <select name="customerId" class="select select-bordered" required>
                                    <option value="">اختر العميل</option>
                                    ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <!-- القيمة المتوقعة -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">القيمة المتوقعة *</span></label>
                                <input type="number" name="expectedValue" class="input input-bordered" required step="0.01" placeholder="0.00" />
                            </div>
                            
                            <!-- احتمال النجاح -->
                            <div class="form-control">
                                <label class="label">
                                    <span class="label-text">احتمال النجاح (%) *</span>
                                    <span class="label-text-alt" id="probabilityValue">50%</span>
                                </label>
                                <input type="range" name="probability" class="range range-primary" min="0" max="100" value="50" step="10" 
                                       oninput="document.getElementById('probabilityValue').textContent = this.value + '%'" />
                                <div class="w-full flex justify-between text-xs px-2 mt-1">
                                    <span>0%</span>
                                    <span>25%</span>
                                    <span>50%</span>
                                    <span>75%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            
                            <!-- المرحلة -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">المرحلة *</span></label>
                                <select name="stage" class="select select-bordered" required>
                                    <option value="prospecting">استكشاف</option>
                                    <option value="qualification">تأهيل</option>
                                    <option value="proposal">عرض</option>
                                    <option value="negotiation">تفاوض</option>
                                </select>
                            </div>
                            
                            <!-- الأولوية -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">الأولوية *</span></label>
                                <select name="priority" class="select select-bordered" required>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية</option>
                                    <option value="low">منخفضة</option>
                                </select>
                            </div>
                            
                            <!-- مندوب المبيعات -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">مندوب المبيعات</span></label>
                                <select name="salesAgent" class="select select-bordered">
                                    <option value="">اختر المندوب</option>
                                    ${salesTeam.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <!-- تاريخ الإغلاق المتوقع -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">تاريخ الإغلاق المتوقع *</span></label>
                                <input type="date" name="expectedClose" class="input input-bordered" required 
                                       value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" />
                            </div>
                            
                            <!-- الملاحظات -->
                            <div class="form-control md:col-span-2">
                                <label class="label"><span class="label-text">الملاحظات</span></label>
                                <textarea name="notes" class="textarea textarea-bordered" rows="3" placeholder="أي معلومات إضافية..."></textarea>
                            </div>
                        </div>
                        
                        <div class="modal-action">
                            <button type="button" class="btn btn-ghost" onclick="APP_MODALS_EXTENDED.closeModal('addOpportunityModal')">إلغاء</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-lg"></i>
                                حفظ الفرصة
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('addOpportunityForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const opportunity = {
                id: APP_CORE.generateId('opp'),
                title: formData.get('title'),
                customerId: formData.get('customerId'),
                salesAgent: formData.get('salesAgent') || APP_CORE.appState.currentUser?.id,
                expectedValue: parseFloat(formData.get('expectedValue')) || 0,
                probability: parseInt(formData.get('probability')) || 50,
                stage: formData.get('stage'),
                priority: formData.get('priority'),
                expectedClose: new Date(formData.get('expectedClose')).toISOString(),
                notes: formData.get('notes'),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            APP_CORE.addItem('opportunities', opportunity);
            APP_CORE.showToast('تم إضافة الفرصة البيعية بنجاح ✅', 'success');
            closeModal('addOpportunityModal');
            APP_PAGES.navigateTo('opportunities');
        };
    }

    // ==================== إضافة طلب بيع ====================
    function showAddSalesOrderModal() {
        const customers = APP_CORE.getData('customers') || [];
        const products = APP_CORE.getData('products') || [];
        
        const modalHTML = `
            <dialog id="addSalesOrderModal" class="modal modal-open">
                <div class="modal-box max-w-5xl">
                    <h3 class="font-bold text-lg mb-4">
                        <i class="bi bi-cart-check-fill text-primary"></i>
                        إنشاء طلب بيع جديد
                    </h3>
                    
                    <form id="addSalesOrderForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- العميل -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">العميل *</span></label>
                                <select name="customerId" class="select select-bordered" required>
                                    <option value="">اختر العميل</option>
                                    ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <!-- التاريخ -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">التاريخ *</span></label>
                                <input type="date" name="date" class="input input-bordered" required 
                                       value="${new Date().toISOString().split('T')[0]}" />
                            </div>
                            
                            <!-- تاريخ التسليم -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">تاريخ التسليم المتوقع</span></label>
                                <input type="date" name="deliveryDate" class="input input-bordered" 
                                       value="${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" />
                            </div>
                        </div>
                        
                        <!-- جدول الأصناف -->
                        <div class="card bg-base-200">
                            <div class="card-body">
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="font-bold">أصناف الطلب</h4>
                                    <button type="button" class="btn btn-sm btn-primary" onclick="APP_MODALS_EXTENDED.addOrderItem()">
                                        <i class="bi bi-plus-lg"></i>
                                        إضافة صنف
                                    </button>
                                </div>
                                
                                <div class="overflow-x-auto">
                                    <table class="table table-sm" id="orderItemsTable">
                                        <thead>
                                            <tr>
                                                <th>المنتج</th>
                                                <th>الكمية</th>
                                                <th>السعر</th>
                                                <th>الإجمالي</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="orderItemsBody">
                                            <tr>
                                                <td colspan="5" class="text-center opacity-60">لا توجد أصناف - اضغط "إضافة صنف"</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div class="divider"></div>
                                
                                <div class="flex justify-end">
                                    <div class="w-64 space-y-2">
                                        <div class="flex justify-between">
                                            <span>المجموع الفرعي:</span>
                                            <span class="font-bold" id="orderSubtotal">0.00 ر.س</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span>الضريبة (15%):</span>
                                            <span class="font-bold" id="orderTax">0.00 ر.س</span>
                                        </div>
                                        <div class="divider my-1"></div>
                                        <div class="flex justify-between text-lg">
                                            <span class="font-bold">الإجمالي:</span>
                                            <span class="font-bold text-primary" id="orderTotal">0.00 ر.س</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- الملاحظات -->
                        <div class="form-control">
                            <label class="label"><span class="label-text">الملاحظات</span></label>
                            <textarea name="notes" class="textarea textarea-bordered" rows="2"></textarea>
                        </div>
                        
                        <div class="modal-action">
                            <button type="button" class="btn btn-ghost" onclick="APP_MODALS_EXTENDED.closeModal('addSalesOrderModal')">إلغاء</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-lg"></i>
                                حفظ الطلب
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // معالجة النموذج
        document.getElementById('addSalesOrderForm').onsubmit = function(e) {
            e.preventDefault();
            // سيتم إضافة المنطق لاحقاً
            APP_CORE.showToast('طلب البيع قيد التطوير', 'info');
            closeModal('addSalesOrderModal');
        };
    }

    // ==================== إضافة منتج ====================
    function showAddProductModal() {
        const suppliers = APP_CORE.getData('suppliers') || [];
        
        const modalHTML = `
            <dialog id="addProductModal" class="modal modal-open">
                <div class="modal-box max-w-3xl">
                    <h3 class="font-bold text-lg mb-4">
                        <i class="bi bi-box-seam-fill text-primary"></i>
                        إضافة منتج جديد
                    </h3>
                    
                    <form id="addProductForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- اسم المنتج -->
                            <div class="form-control md:col-span-2">
                                <label class="label"><span class="label-text">اسم المنتج *</span></label>
                                <input type="text" name="name" class="input input-bordered" required placeholder="مثال: لابتوب HP EliteBook" />
                            </div>
                            
                            <!-- SKU -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">SKU (كود المنتج) *</span></label>
                                <input type="text" name="sku" class="input input-bordered" required placeholder="HP-EB-2024" />
                            </div>
                            
                            <!-- الفئة -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">الفئة *</span></label>
                                <select name="category" class="select select-bordered" required>
                                    <option value="">اختر الفئة</option>
                                    <option value="أجهزة كمبيوتر">أجهزة كمبيوتر</option>
                                    <option value="طابعات">طابعات</option>
                                    <option value="اكسسوارات">اكسسوارات</option>
                                    <option value="شبكات">شبكات</option>
                                    <option value="كاميرات">كاميرات</option>
                                </select>
                            </div>
                            
                            <!-- سعر الشراء -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">سعر الشراء *</span></label>
                                <input type="number" name="purchasePrice" class="input input-bordered" required step="0.01" placeholder="0.00" />
                            </div>
                            
                            <!-- سعر البيع -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">سعر البيع *</span></label>
                                <input type="number" name="sellingPrice" class="input input-bordered" required step="0.01" placeholder="0.00" />
                            </div>
                            
                            <!-- المخزون الحالي -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">المخزون الحالي *</span></label>
                                <input type="number" name="currentStock" class="input input-bordered" required min="0" value="0" />
                            </div>
                            
                            <!-- الحد الأدنى -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">الحد الأدنى للمخزون *</span></label>
                                <input type="number" name="minStock" class="input input-bordered" required min="0" value="5" />
                            </div>
                            
                            <!-- المورد -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">المورد الرئيسي</span></label>
                                <select name="supplierId" class="select select-bordered">
                                    <option value="">اختر المورد</option>
                                    ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <!-- الحالة -->
                            <div class="form-control">
                                <label class="label"><span class="label-text">الحالة</span></label>
                                <select name="status" class="select select-bordered">
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="modal-action">
                            <button type="button" class="btn btn-ghost" onclick="APP_MODALS_EXTENDED.closeModal('addProductModal')">إلغاء</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-lg"></i>
                                حفظ المنتج
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('addProductForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const product = {
                id: APP_CORE.generateId('prod'),
                name: formData.get('name'),
                sku: formData.get('sku'),
                category: formData.get('category'),
                purchasePrice: parseFloat(formData.get('purchasePrice')) || 0,
                sellingPrice: parseFloat(formData.get('sellingPrice')) || 0,
                currentStock: parseInt(formData.get('currentStock')) || 0,
                minStock: parseInt(formData.get('minStock')) || 5,
                supplierId: formData.get('supplierId') || null,
                status: formData.get('status') || 'active',
                createdAt: new Date().toISOString()
            };
            
            APP_CORE.addItem('products', product);
            APP_CORE.showToast('تم إضافة المنتج بنجاح ✅', 'success');
            closeModal('addProductModal');
            APP_PAGES.navigateTo('inventory');
        };
    }

    // ==================== تعديل المخزون ====================
    function adjustStock(productId) {
        const products = APP_CORE.getData('products') || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            APP_CORE.showToast('المنتج غير موجود', 'error');
            return;
        }
        
        const modalHTML = `
            <dialog id="adjustStockModal" class="modal modal-open">
                <div class="modal-box">
                    <h3 class="font-bold text-lg mb-4">
                        <i class="bi bi-plus-slash-minus text-primary"></i>
                        تعديل مخزون: ${product.name}
                    </h3>
                    
                    <form id="adjustStockForm" class="space-y-4">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <span>المخزون الحالي: <strong>${product.currentStock}</strong></span>
                        </div>
                        
                        <div class="form-control">
                            <label class="label"><span class="label-text">نوع العملية</span></label>
                            <select name="type" class="select select-bordered" id="adjustmentType">
                                <option value="add">إضافة (+)</option>
                                <option value="subtract">خصم (-)</option>
                                <option value="set">تعيين (=)</option>
                            </select>
                        </div>
                        
                        <div class="form-control">
                            <label class="label"><span class="label-text">الكمية *</span></label>
                            <input type="number" name="quantity" class="input input-bordered" required min="1" value="1" />
                        </div>
                        
                        <div class="form-control">
                            <label class="label"><span class="label-text">السبب</span></label>
                            <textarea name="reason" class="textarea textarea-bordered" rows="2" placeholder="مثال: شراء جديد، مبيعات، تالف..."></textarea>
                        </div>
                        
                        <div class="modal-action">
                            <button type="button" class="btn btn-ghost" onclick="APP_MODALS_EXTENDED.closeModal('adjustStockModal')">إلغاء</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-lg"></i>
                                تطبيق
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('adjustStockForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const type = formData.get('type');
            const quantity = parseInt(formData.get('quantity')) || 0;
            
            let newStock = product.currentStock;
            
            switch(type) {
                case 'add':
                    newStock += quantity;
                    break;
                case 'subtract':
                    newStock -= quantity;
                    if (newStock < 0) newStock = 0;
                    break;
                case 'set':
                    newStock = quantity;
                    break;
            }
            
            APP_CORE.updateItem('products', productId, { currentStock: newStock });
            APP_CORE.showToast(`تم تحديث المخزون إلى ${newStock} ✅`, 'success');
            closeModal('adjustStockModal');
            APP_PAGES.navigateTo('inventory');
        };
    }

    // ==================== إغلاق Modal ====================
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    // ==================== Public API ====================
    return {
        showAddOpportunityModal,
        showAddSalesOrderModal,
        showAddProductModal,
        adjustStock,
        viewOpportunityDetails: (id) => APP_CORE.showToast('قيد التطوير', 'info'),
        viewSalesOrderDetails: (id) => APP_CORE.showToast('قيد التطوير', 'info'),
        viewProductHistory: (id) => APP_CORE.showToast('قيد التطوير', 'info'),
        editProduct: (id) => APP_CORE.showToast('قيد التطوير', 'info'),
        addOrderItem: () => APP_CORE.showToast('قيد التطوير', 'info'),
        closeModal
    };
})();

console.log('✅ APP_MODALS_EXTENDED جاهز');