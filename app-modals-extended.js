// ==================== النماذج المتقدمة ====================
console.log('📝 تحميل النماذج المتقدمة...');

const APP_MODALS_EXTENDED = (function() {
    'use strict';

    // ==================== إضافة فرصة بيعية ====================
    function showAddOpportunityModal() {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast('نافذة إضافة فرصة بيعية قيد التطوير', 'info');
        }
    }

    // ==================== إضافة طلب بيع ====================
    function showAddSalesOrderModal() {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast('نافذة إضافة طلب بيع قيد التطوير', 'info');
        }
    }

    // ==================== إضافة منتج ====================
    function showAddProductModal() {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast('نافذة إضافة منتج قيد التطوير', 'info');
        }
    }

    // ==================== تعديل المخزون ====================
    function adjustStock(productId) {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast(`تعديل مخزون المنتج: ${productId}`, 'info');
        }
    }

    // ==================== عرض تفاصيل فرصة ====================
    function viewOpportunityDetails(id) {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast(`عرض تفاصيل الفرصة: ${id}`, 'info');
        }
    }

    // ==================== عرض تفاصيل طلب بيع ====================
    function viewSalesOrderDetails(id) {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast(`عرض تفاصيل طلب البيع: ${id}`, 'info');
        }
    }

    // ==================== عرض سجل منتج ====================
    function viewProductHistory(id) {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast(`عرض سجل المنتج: ${id}`, 'info');
        }
    }

    // ==================== تعديل منتج ====================
    function editProduct(id) {
        if (typeof APP_CORE !== 'undefined' && typeof APP_CORE.showToast === 'function') {
            APP_CORE.showToast(`تعديل المنتج: ${id}`, 'info');
        }
    }

    // ==================== إغلاق نافذة ====================
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            console.log('✅ تم إغلاق النافذة:', modalId);
        }
    }

    // ==================== Public API ====================
    console.log('✅ النماذج المتقدمة جاهزة');
    
    return {
        showAddOpportunityModal,
        showAddSalesOrderModal,
        showAddProductModal,
        adjustStock,
        viewOpportunityDetails,
        viewSalesOrderDetails,
        viewProductHistory,
        editProduct,
        closeModal
    };
})();

if (typeof APP_MODALS_EXTENDED !== 'undefined') {
    console.log('✅ APP_MODALS_EXTENDED تم تعريفه بنجاح');
} else {
    console.error('❌ فشل تعريف APP_MODALS_EXTENDED');
}