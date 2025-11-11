// ==================== فحص وإصلاح النظام ====================
(function() {
    'use strict';

    console.log('🔍 بدء فحص النظام...');

    // فحص الوحدات الأساسية
    const requiredModules = [
        { name: 'APP_CORE', status: typeof APP_CORE !== 'undefined' },
        { name: 'APP_AUTH', status: typeof APP_AUTH !== 'undefined' },
        { name: 'APP_PAGES', status: typeof APP_PAGES !== 'undefined' },
        { name: 'APP_ACCOUNTING', status: typeof APP_ACCOUNTING !== 'undefined' },
        { name: 'APP_SALES', status: typeof APP_SALES !== 'undefined' },
        { name: 'APP_WORKFLOW', status: typeof APP_WORKFLOW !== 'undefined' }
    ];

    console.table(requiredModules);

    // فحص البيانات
    if (typeof APP_CORE !== 'undefined') {
        const customers = APP_CORE.getData('customers') || [];
        const quotations = APP_CORE.getData('quotations') || [];
        const products = APP_CORE.getData('products') || [];
        
        console.log('📊 إحصائيات البيانات:');
        console.log('- العملاء:', customers.length);
        console.log('- عروض الأسعار:', quotations.length);
        console.log('- المنتجات:', products.length);
    }

    // إصلاح تلقائي
    if (typeof APP_PAGES !== 'undefined' && !APP_PAGES.navigateTo) {
        console.warn('⚠️ APP_PAGES.navigateTo غير موجودة - إصلاح...');
        // سيتم إصلاحها بالكود أعلاه
    }

    // إصلاح Chart.js
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.font.size = 12;
        console.log('✅ Chart.js جاهز');
    } else {
        console.warn('⚠️ Chart.js غير محمّل');
    }

    // إصلاح XLSX
    if (typeof XLSX !== 'undefined') {
        console.log('✅ XLSX جاهز');
    } else {
        console.warn('⚠️ XLSX غير محمّل');
    }

    console.log('✅ انتهى فحص النظام');

    // عرض تقرير في الواجهة
    setTimeout(() => {
        if (typeof APP_CORE !== 'undefined' && APP_CORE.appState.currentUser) {
            const missing = requiredModules.filter(m => !m.status);
            if (missing.length > 0) {
                APP_CORE.showToast(`⚠️ ${missing.length} وحدة ناقصة`, 'warning');
            } else {
                APP_CORE.showToast('✅ جميع الوحدات محمّلة بنجاح', 'success');
            }
        }
    }, 3000);
})();