// ==================== الإعدادات المصرية ====================
console.log('⚙️ تحميل الإعدادات المصرية...');

const APP_SETTINGS = (function() {
    'use strict';

    let currentSettings = null;

    // ==================== التهيئة ====================
    function initializeSettings() {
        currentSettings = APP_CORE.getData('settings') || APP_CORE.getDefaultSettings?.() || getDefaultSettings();
        
        // التأكد من وجود الإعدادات
        if (!APP_CORE.getData('settings')) {
            APP_CORE.setData('settings', currentSettings);
        }
        
        console.log('✅ الإعدادات المصرية جاهزة 🇪🇬');
        
        // تطبيق العملة الحالية
        updateCurrencyUI(currentSettings.financial?.currency || 'EGP');
    }

    // ==================== تبديل العملة ====================
    function setCurrency(currency) {
        console.log('💱 تبديل العملة إلى:', currency);
        
        if (!currentSettings) {
            initializeSettings();
        }

        // تحديث الإعدادات
        if (currentSettings.financial) {
            currentSettings.financial.currency = currency;
            
            if (currency === 'EGP') {
                currentSettings.financial.currencySymbol = 'ج.م';
                currentSettings.financial.currencyName = 'جنيه مصري';
            } else if (currency === 'USD') {
                currentSettings.financial.currencySymbol = '$';
                currentSettings.financial.currencyName = 'دولار أمريكي';
            }
            
            APP_CORE.setData('settings', currentSettings);
            
            // تحديث الواجهة
            updateCurrencyUI(currency);
            
            // إعادة تحميل الصفحة الحالية
            if (typeof APP_PAGES !== 'undefined' && typeof APP_PAGES.getCurrentPage === 'function') {
                const currentPage = APP_PAGES.getCurrentPage();
                if (currentPage && typeof APP_PAGES.navigateTo === 'function') {
                    APP_PAGES.navigateTo(currentPage);
                }
            }
            
            // إظهار رسالة
            if (typeof APP_CORE.showToast === 'function') {
                APP_CORE.showToast(`تم التبديل إلى ${currentSettings.financial.currencyName} ✅`, 'success');
            }
            
            console.log('✅ تم تبديل العملة بنجاح');
        }
    }

    // ==================== تحديث واجهة العملة ====================
    function updateCurrencyUI(currency) {
        // تحديث أيقونات العملة (إذا كانت موجودة)
        const checkEGP = document.getElementById('check-egp');
        const checkUSD = document.getElementById('check-usd');
        
        if (checkEGP && checkUSD) {
            if (currency === 'EGP') {
                checkEGP.classList.remove('hidden');
                checkUSD.classList.add('hidden');
            } else if (currency === 'USD') {
                checkEGP.classList.add('hidden');
                checkUSD.classList.remove('hidden');
            }
        }
        
        console.log('🎨 تم تحديث واجهة العملة:', currency);
    }

    // ==================== تبديل العملة المزدوجة ====================
    function toggleDualCurrency(enabled) {
        if (!currentSettings) {
            initializeSettings();
        }

        if (currentSettings.display) {
            currentSettings.display.showSecondaryCurrency = enabled;
            APP_CORE.setData('settings', currentSettings);
            
            // إعادة تحميل الصفحة
            if (typeof APP_PAGES !== 'undefined' && typeof APP_PAGES.getCurrentPage === 'function') {
                const currentPage = APP_PAGES.getCurrentPage();
                if (currentPage && typeof APP_PAGES.navigateTo === 'function') {
                    APP_PAGES.navigateTo(currentPage);
                }
            }
            
            if (typeof APP_CORE.showToast === 'function') {
                APP_CORE.showToast(enabled ? 'تم تفعيل العملة المزدوجة ✅' : 'تم إيقاف العملة المزدوجة', 'info');
            }
        }
    }

    // ==================== تحديث سعر الصرف ====================
    function updateExchangeRate() {
        // في بيئة حقيقية، يمكن جلب السعر من API
        const newRate = prompt('أدخل سعر الصرف الجديد (1$ = ... ج.م):', '30.90');
        
        if (newRate && !isNaN(newRate)) {
            if (!currentSettings) {
                initializeSettings();
            }
            
            if (currentSettings.financial) {
                currentSettings.financial.exchangeRate = parseFloat(newRate);
                APP_CORE.setData('settings', currentSettings);
                
                // تحديث واجهة سعر الصرف
                const rateElement = document.getElementById('exchange-rate');
                if (rateElement) {
                    rateElement.textContent = newRate;
                }
                
                if (typeof APP_CORE.showToast === 'function') {
                    APP_CORE.showToast(`تم تحديث سعر الصرف: 1$ = ${newRate} ج.م ✅`, 'success');
                }
            }
        }
    }

    // ==================== الحصول على الإعدادات ====================
    function getSettings() {
        if (!currentSettings) {
            initializeSettings();
        }
        return currentSettings;
    }

    // ==================== الإعدادات الافتراضية ====================
    function getDefaultSettings() {
        return {
            company: {
                name: 'شركة محاسبي برو - مصر',
                nameEn: 'Accounting Pro Egypt',
                email: 'info@accounting-pro.com.eg',
                phone: '+20 10 1234 5678',
                address: 'القاهرة، جمهورية مصر العربية',
                city: 'القاهرة',
                country: 'مصر',
                countryCode: 'EG',
                taxNumber: '123-456-789',
                commercialRecord: '12345',
                taxCard: '98765-4321',
                logo: null
            },
            financial: {
                currency: 'EGP',
                currencySymbol: 'ج.م',
                currencyName: 'جنيه مصري',
                currencyNameEn: 'Egyptian Pound',
                secondaryCurrency: 'USD',
                secondaryCurrencySymbol: '$',
                secondaryCurrencyName: 'دولار أمريكي',
                exchangeRate: 30.90,
                taxRate: 14,
                taxSystem: 'egyptian',
                taxRegistrationNumber: '123-456-789',
                invoicePrefix: 'INV-EG-',
                quotationPrefix: 'QUO-EG-',
                salesOrderPrefix: 'SO-EG-',
                purchaseOrderPrefix: 'PO-EG-',
                fiscalYearStart: '01-07',
                fiscalYearEnd: '30-06',
                decimalPlaces: 2,
                thousandSeparator: ',',
                decimalSeparator: '.',
                paymentMethods: ['نقدي', 'تحويل بنكي', 'شيك', 'فودافون كاش', 'انستا باي', 'فيزا/ماستركارد', 'آجل']
            },
            regional: {
                timezone: 'Africa/Cairo',
                locale: 'ar-EG',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '12',
                weekStart: 'saturday',
                workingDays: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
            },
            display: {
                theme: 'light',
                language: 'ar',
                showSecondaryLanguage: true,
                showSecondaryCurrency: false,
                numberFormat: 'egyptian'
            }
        };
    }

    // ==================== Public API ====================
    console.log('✅ APP_SETTINGS جاهز');
    
    return {
        initializeSettings,
        setCurrency,
        toggleDualCurrency,
        updateExchangeRate,
        getSettings,
        getDefaultSettings
    };
})();

if (typeof APP_SETTINGS !== 'undefined') {
    console.log('✅ APP_SETTINGS تم تعريفه بنجاح');
} else {
    console.error('❌ فشل تعريف APP_SETTINGS');
}