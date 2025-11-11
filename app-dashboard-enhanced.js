// ==================== لوحة التحكم المحسّنة ====================
console.log('📊 تحميل لوحة التحكم المحسّنة...');

const APP_DASHBOARD_ENHANCED = (function() {
    'use strict';

    function renderEnhancedDashboard() {
        // استخدام الدالة الأساسية من APP_PAGES
        if (typeof APP_PAGES !== 'undefined' && APP_PAGES.PAGES && APP_PAGES.PAGES.dashboard) {
            return APP_PAGES.PAGES.dashboard.render();
        }
        
        return `
            <div class="space-y-6">
                <div class="alert alert-info">
                    <span>لوحة التحكم المحسّنة...</span>
                </div>
            </div>
        `;
    }

    return {
        renderEnhancedDashboard
    };
})();

console.log('✅ لوحة التحكم المحسّنة جاهزة');