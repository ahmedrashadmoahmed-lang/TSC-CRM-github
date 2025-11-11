// ==================== فحص شامل للنظام ====================
console.log('%c🔍 بدء الفحص الشامل للنظام...', 'color: #f59e0b; font-size: 18px; font-weight: bold;');

const SYSTEM_DIAGNOSTIC = (function() {
    'use strict';
    
    const diagnosticResults = {
        files: [],
        modules: [],
        data: [],
        errors: [],
        warnings: []
    };

    // ==================== فحص الملفات ====================
    function checkFiles() {
        console.log('%c📁 فحص الملفات...', 'color: #3b82f6; font-weight: bold;');
        
        const requiredFiles = [
            { name: 'APP_CORE', file: 'app-core.js', critical: true },
            { name: 'APP_HELPERS', file: 'app-helpers.js', critical: true },
            { name: 'APP_AUTH', file: 'app-auth.js', critical: true },
            { name: 'APP_PAGES', file: 'app-pages.js', critical: true },
            { name: 'APP_SALES', file: 'app-sales.js', critical: false },
            { name: 'APP_WORKFLOW', file: 'app-workflow.js', critical: false },
            { name: 'APP_ACCOUNTING', file: 'app-accounting.js', critical: false },
            { name: 'APP_MODALS', file: 'app-modals.js', critical: false },
            { name: 'APP_MODALS_EXTENDED', file: 'app-modals-extended.js', critical: false },
            { name: 'APP_PRINT', file: 'app-print.js', critical: false },
            { name: 'APP_CHARTS', file: 'app-charts.js', critical: false },
            { name: 'APP_NOTIFICATIONS', file: 'app-notifications.js', critical: false },
            { name: 'APP_REAL_DATA', file: 'app-real-data.js', critical: true },
            { name: 'APP_REAL_DATA_EXTENDED', file: 'app-real-data-extended.js', critical: false },
            { name: 'APP_DASHBOARD_ENHANCED', file: 'app-dashboard-enhanced.js', critical: false },
            { name: 'APP_PAGES_COMPLETE', file: 'app-pages-complete.js', critical: false },
            { name: 'APP_PAGES_FINAL', file: 'app-pages-final.js', critical: false },
            { name: 'APP_SETTINGS', file: 'app-settings.js', critical: true },
            { name: 'APP_GOOGLE_SHEETS', file: 'app-google-sheets-import.js', critical: false }
        ];

        requiredFiles.forEach(fileInfo => {
            const exists = typeof window[fileInfo.name] !== 'undefined';
            
            if (exists) {
                console.log(`  ✅ ${fileInfo.file} - محمّل`);
                diagnosticResults.files.push({ file: fileInfo.file, status: 'loaded', critical: fileInfo.critical });
            } else {
                const message = `${fileInfo.file} - غير محمّل`;
                if (fileInfo.critical) {
                    console.error(`  ❌ ${message} (حرج)`);
                    diagnosticResults.errors.push(message);
                } else {
                    console.warn(`  ⚠️ ${message}`);
                    diagnosticResults.warnings.push(message);
                }
                diagnosticResults.files.push({ file: fileInfo.file, status: 'missing', critical: fileInfo.critical });
            }
        });
    }

    // ==================== فحص المكتبات الخارجية ====================
    function checkExternalLibraries() {
        console.log('%c📚 فحص المكتبات الخارجية...', 'color: #3b82f6; font-weight: bold;');
        
        const libraries = [
            { name: 'Chart.js', check: () => typeof Chart !== 'undefined', critical: false },
            { name: 'XLSX', check: () => typeof XLSX !== 'undefined', critical: false }
        ];

        libraries.forEach(lib => {
            if (lib.check()) {
                console.log(`  ✅ ${lib.name} - متوفر`);
            } else {
                const message = `${lib.name} - غير محمّل`;
                if (lib.critical) {
                    console.error(`  ❌ ${message}`);
                    diagnosticResults.errors.push(message);
                } else {
                    console.warn(`  ⚠️ ${message}`);
                    diagnosticResults.warnings.push(message);
                }
            }
        });
    }

    // ==================== فحص الدوال الأساسية ====================
    function checkCoreFunctions() {
        console.log('%c🔧 فحص الدوال الأساسية...', 'color: #3b82f6; font-weight: bold;');
        
        const functions = [
            { name: 'APP_CORE.initialize', check: () => typeof APP_CORE?.initialize === 'function' },
            { name: 'APP_CORE.getData', check: () => typeof APP_CORE?.getData === 'function' },
            { name: 'APP_CORE.setData', check: () => typeof APP_CORE?.setData === 'function' },
            { name: 'APP_CORE.formatCurrency', check: () => typeof APP_CORE?.formatCurrency === 'function' },
            { name: 'APP_CORE.showToast', check: () => typeof APP_CORE?.showToast === 'function' },
            { name: 'APP_AUTH.showLoginPage', check: () => typeof APP_AUTH?.showLoginPage === 'function' },
            { name: 'APP_AUTH.login', check: () => typeof APP_AUTH?.login === 'function' },
            { name: 'APP_PAGES.navigateTo', check: () => typeof APP_PAGES?.navigateTo === 'function' },
            { name: 'formatEgyptianCurrency', check: () => typeof formatEgyptianCurrency === 'function' },
            { name: 'getCurrentEgyptianTime', check: () => typeof getCurrentEgyptianTime === 'function' }
        ];

        functions.forEach(func => {
            if (func.check()) {
                console.log(`  ✅ ${func.name} - متوفرة`);
            } else {
                console.error(`  ❌ ${func.name} - غير متوفرة`);
                diagnosticResults.errors.push(`Function ${func.name} missing`);
            }
        });
    }

    // ==================== فحص عناصر DOM ====================
    function checkDOMElements() {
        console.log('%c🎨 فحص عناصر الصفحة...', 'color: #3b82f6; font-weight: bold;');
        
        const elements = [
            { id: 'loading-screen', name: 'شاشة التحميل', critical: true },
            { id: 'login-page', name: 'صفحة تسجيل الدخول', critical: true },
            { id: 'main-app', name: 'التطبيق الرئيسي', critical: true },
            { id: 'main-content', name: 'المحتوى الرئيسي', critical: true },
            { id: 'sidebar-menu', name: 'القائمة الجانبية', critical: true },
            { id: 'toast-container', name: 'حاوية الإشعارات', critical: false },
            { id: 'page-title', name: 'عنوان الصفحة', critical: false },
            { id: 'page-icon', name: 'أيقونة الصفحة', critical: false }
        ];

        elements.forEach(el => {
            const element = document.getElementById(el.id);
            if (element) {
                console.log(`  ✅ #${el.id} (${el.name}) - موجود`);
            } else {
                const message = `#${el.id} (${el.name}) - غير موجود`;
                if (el.critical) {
                    console.error(`  ❌ ${message}`);
                    diagnosticResults.errors.push(message);
                } else {
                    console.warn(`  ⚠️ ${message}`);
                    diagnosticResults.warnings.push(message);
                }
            }
        });
    }

    // ==================== فحص البيانات ====================
    function checkData() {
        console.log('%c💾 فحص البيانات...', 'color: #3b82f6; font-weight: bold;');
        
        if (typeof APP_CORE === 'undefined') {
            console.error('  ❌ APP_CORE غير محمّل - لا يمكن فحص البيانات');
            return;
        }

        const dataChecks = [
            { key: 'customers', name: 'العملاء' },
            { key: 'quotations', name: 'عروض الأسعار' },
            { key: 'settings', name: 'الإعدادات' }
        ];

        dataChecks.forEach(data => {
            const items = APP_CORE.getData(data.key);
            if (items) {
                const count = Array.isArray(items) ? items.length : 'موجود';
                console.log(`  ✅ ${data.name} - ${count}`);
                diagnosticResults.data.push({ key: data.key, count: count });
            } else {
                console.warn(`  ⚠️ ${data.name} - فارغ`);
                diagnosticResults.warnings.push(`${data.name} empty`);
            }
        });
    }

    // ==================== فحص LocalStorage ====================
    function checkLocalStorage() {
        console.log('%c💿 فحص التخزين المحلي...', 'color: #3b82f6; font-weight: bold;');
        
        try {
            const testKey = 'test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            console.log('  ✅ LocalStorage يعمل بشكل صحيح');
            
            const mainData = localStorage.getItem('accounting_pro_eg_v5');
            if (mainData) {
                const size = (mainData.length / 1024).toFixed(2);
                console.log(`  ✅ البيانات الرئيسية موجودة (${size} KB)`);
            } else {
                console.warn('  ⚠️ لا توجد بيانات محفوظة');
                diagnosticResults.warnings.push('No saved data in localStorage');
            }
        } catch (e) {
            console.error('  ❌ خطأ في LocalStorage:', e);
            diagnosticResults.errors.push('LocalStorage error: ' + e.message);
        }
    }

    // ==================== فحص المستخدم الحالي ====================
    function checkCurrentUser() {
        console.log('%c👤 فحص المستخدم الحالي...', 'color: #3b82f6; font-weight: bold;');
        
        if (typeof APP_CORE === 'undefined') {
            console.error('  ❌ APP_CORE غير محمّل');
            return;
        }

        const user = APP_CORE.appState?.currentUser;
        if (user) {
            console.log(`  ✅ المستخدم: ${user.name} (${user.role})`);
        } else {
            console.log('  ℹ️ لم يتم تسجيل الدخول بعد');
        }
    }

    // ==================== إنشاء تقرير مفصل ====================
    function generateReport() {
        console.log('%c📋 تقرير الفحص:', 'color: #10b981; font-size: 16px; font-weight: bold;');
        
        const totalFiles = diagnosticResults.files.length;
        const loadedFiles = diagnosticResults.files.filter(f => f.status === 'loaded').length;
        const missingFiles = diagnosticResults.files.filter(f => f.status === 'missing').length;
        const criticalErrors = diagnosticResults.errors.length;
        
        console.log(`\n┌─────────────────────────────────────┐`);
        console.log(`│  🇪🇬 نظام محاسبي برو - مصر v5.0    │`);
        console.log(`├─────────────────────────────────────┤`);
        console.log(`│  الملفات: ${loadedFiles}/${totalFiles} محمّلة`);
        console.log(`│  الأخطاء الحرجة: ${criticalErrors}`);
        console.log(`│  التحذيرات: ${diagnosticResults.warnings.length}`);
        console.log(`└─────────────────────────────────────┘\n`);

        if (criticalErrors > 0) {
            console.error('%c❌ أخطاء حرجة:', 'color: #ef4444; font-weight: bold;');
            diagnosticResults.errors.forEach(err => console.error(`  • ${err}`));
        }

        if (diagnosticResults.warnings.length > 0) {
            console.warn('%c⚠️ تحذيرات:', 'color: #f59e0b; font-weight: bold;');
            diagnosticResults.warnings.forEach(warn => console.warn(`  • ${warn}`));
        }

        if (criticalErrors === 0 && diagnosticResults.warnings.length === 0) {
            console.log('%c✅ النظام يعمل بشكل مثالي!', 'color: #10b981; font-size: 16px; font-weight: bold;');
        }

        return diagnosticResults;
    }

    // ==================== محاولة الإصلاح التلقائي ====================
    function attemptAutoFix() {
        console.log('%c🔧 محاولة الإصلاح التلقائي...', 'color: #f59e0b; font-weight: bold;');

        // إخفاء شاشة التحميل إذا كانت عالقة
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('  🔄 إخفاء شاشة التحميل...');
            loadingScreen.style.display = 'none';
        }

        // إظهار صفحة تسجيل الدخول إذا كان APP_CORE موجود
        if (typeof APP_CORE !== 'undefined') {
            const loginPage = document.getElementById('login-page');
            if (loginPage) {
                console.log('  🔄 إظهار صفحة تسجيل الدخول...');
                loginPage.style.display = 'flex';
            }
        } else {
            console.error('  ❌ لا يمكن الإصلاح - APP_CORE غير موجود');
        }
    }

    // ==================== تشغيل الفحص الكامل ====================
    function runFullDiagnostic() {
        console.clear();
        console.log('%c🔍 فحص شامل للنظام - 2025-01-11 16:20:31', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
        console.log('%c👤 المستخدم: ahmedrashadmoahmed-lang', 'color: #6366f1; font-size: 14px;');
        console.log('\n');

        checkExternalLibraries();
        console.log('\n');
        
        checkFiles();
        console.log('\n');
        
        checkCoreFunctions();
        console.log('\n');
        
        checkDOMElements();
        console.log('\n');
        
        checkLocalStorage();
        console.log('\n');
        
        checkData();
        console.log('\n');
        
        checkCurrentUser();
        console.log('\n');
        
        const results = generateReport();
        
        // إذا كانت هناك مشاكل، حاول الإصلاح
        if (results.errors.length > 0) {
            console.log('\n');
            attemptAutoFix();
        }

        return results;
    }

    return {
        runFullDiagnostic,
        attemptAutoFix,
        getResults: () => diagnosticResults
    };
})();

// تشغيل الفحص تلقائياً عند التحميل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => SYSTEM_DIAGNOSTIC.runFullDiagnostic(), 3000);
    });
} else {
    setTimeout(() => SYSTEM_DIAGNOSTIC.runFullDiagnostic(), 3000);
}

// إتاحة الفحص اليدوي
window.SYSTEM_DIAGNOSTIC = SYSTEM_DIAGNOSTIC;

console.log('%c💡 لتشغيل الفحص يدوياً، اكتب في Console:', 'color: #10b981; font-weight: bold;');
console.log('   SYSTEM_DIAGNOSTIC.runFullDiagnostic()');