// ==================== نظام محاسبي برو - النواة الأساسية - النسخة المصرية ====================
console.log('🔵 تحميل APP_CORE - النسخة المصرية 🇪🇬...');

const APP_CORE = (function() {
    'use strict';

    const version = '5.0.0-EG';
    const buildDate = '2025-01-11';

    const appState = {
        currentUser: null,
        currentTheme: 'light',
        currentPage: 'dashboard',
        isLoading: false,
        lastUpdate: null
    };

    function initialize() {
        console.log('🎬 تهيئة النظام...');
        console.log('📍 الإصدار:', version);
        console.log('🇪🇬 النظام: مصري');
        
        initializeStorage();
        checkLoginStatus();
        
        console.log('✅ تم تهيئة APP_CORE بنجاح');
    }

    function initializeStorage() {
        const storageKey = 'accounting_pro_eg_v5';
        
        if (!localStorage.getItem(storageKey)) {
            console.log('🆕 إنشاء قاعدة بيانات جديدة...');
            const initialData = {
                version: version,
                createdAt: new Date().toISOString(),
                settings: getDefaultSettings(),
                customers: [],
                quotations: [],
                invoices: [],
                salesOrders: [],
                purchaseOrders: [],
                products: [],
                suppliers: [],
                opportunities: [],
                salesTeam: getDefaultSalesTeam(),
                accounting: getDefaultAccounting()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(initialData));
            console.log('✅ قاعدة البيانات جاهزة');
        }
    }

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

    function getDefaultSalesTeam() {
        return [
            {
                id: 'sales_agent1',
                name: 'خالد سعيد',
                position: 'مندوب مبيعات',
                phone: '+20 100 123 4567',
                email: 'khaled@accounting-pro.com',
                target: 500000,
                achieved: 0,
                commissionRate: 5,
                status: 'active'
            },
            {
                id: 'sales_agent2',
                name: 'سارة علي',
                position: 'مندوبة مبيعات',
                phone: '+20 100 234 5678',
                email: 'sara@accounting-pro.com',
                target: 500000,
                achieved: 0,
                commissionRate: 5,
                status: 'active'
            }
        ];
    }

    function getDefaultAccounting() {
        return {
            accounts: {
                cash: 100000,
                bank: 500000,
                accountsReceivable: 0,
                accountsPayable: 0,
                inventory: 0,
                fixedAssets: 0
            },
            transactions: [],
            chartOfAccounts: {
                assets: [
                    { code: '1-1-1', name: 'النقدية', balance: 100000 },
                    { code: '1-1-2', name: 'البنك', balance: 500000 }
                ],
                liabilities: [],
                equity: [
                    { code: '3-1-1', name: 'رأس المال', balance: 600000 }
                ],
                revenue: [],
                expenses: []
            }
        };
    }

    function checkLoginStatus() {
        const savedUser = localStorage.getItem('accounting_pro_current_user_v5');
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                appState.currentUser = user;
                console.log('✅ المستخدم مسجل:', user.name);
                
                if (typeof APP_AUTH !== 'undefined' && typeof APP_AUTH.showMainApp === 'function') {
                    setTimeout(() => APP_AUTH.showMainApp(user), 100);
                }
            } catch (error) {
                console.error('❌ خطأ في قراءة بيانات المستخدم:', error);
                showLoginPage();
            }
        } else {
            console.log('⏳ لم يتم تسجيل الدخول بعد');
            showLoginPage();
        }
    }

    function showLoginPage() {
        if (typeof APP_AUTH !== 'undefined' && typeof APP_AUTH.showLoginPage === 'function') {
            setTimeout(() => APP_AUTH.showLoginPage(), 100);
        }
    }

    function getData(key) {
        try {
            const data = localStorage.getItem('accounting_pro_eg_v5');
            if (data) {
                const parsed = JSON.parse(data);
                return parsed[key] || null;
            }
            return null;
        } catch (error) {
            console.error('خطأ في قراءة البيانات:', error);
            return null;
        }
    }

    function setData(key, value) {
        try {
            const data = localStorage.getItem('accounting_pro_eg_v5');
            const parsed = data ? JSON.parse(data) : {};
            parsed[key] = value;
            parsed.lastUpdate = new Date().toISOString();
            localStorage.setItem('accounting_pro_eg_v5', JSON.stringify(parsed));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }

    function addItem(collection, item) {
        const data = getData(collection) || [];
        data.push(item);
        return setData(collection, data);
    }

    function updateItem(collection, itemId, updates) {
        const data = getData(collection) || [];
        const index = data.findIndex(item => item.id === itemId);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            return setData(collection, data);
        }
        return false;
    }

    function deleteItem(collection, itemId) {
        const data = getData(collection) || [];
        const filtered = data.filter(item => item.id !== itemId);
        return setData(collection, filtered);
    }

    function generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    function formatCurrency(amount, currency = null, showDual = false) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            amount = 0;
        }

        const settings = getData('settings') || getDefaultSettings();
        const financial = settings.financial || {};
        const display = settings.display || {};
        
        const useCurrency = currency || financial.currency || 'EGP';
        
        let formatted = '';
        
        if (useCurrency === 'EGP') {
            formatted = parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ج.م';
            
            if (showDual && display.showSecondaryCurrency) {
                const usd = amount / (financial.exchangeRate || 30.90);
                formatted += ` <span class="text-xs opacity-60">(≈ $${usd.toFixed(2)})</span>`;
            }
        } else if (useCurrency === 'USD') {
            formatted = '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            if (showDual && display.showSecondaryCurrency) {
                const egp = amount * (financial.exchangeRate || 30.90);
                formatted += ` <span class="text-xs opacity-60">(≈ ${egp.toFixed(2)} ج.م)</span>`;
            }
        } else {
            formatted = parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ' + useCurrency;
        }
        
        return formatted;
    }

    function formatDate(dateString, format = 'full') {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { timeZone: 'Africa/Cairo' };
        
        switch(format) {
            case 'short':
                return date.toLocaleDateString('ar-EG', { ...options, day: '2-digit', month: '2-digit', year: 'numeric' });
            case 'medium':
                return date.toLocaleDateString('ar-EG', { ...options, day: 'numeric', month: 'long', year: 'numeric' });
            case 'long':
                return date.toLocaleDateString('ar-EG', { ...options, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            case 'time':
                return date.toLocaleTimeString('ar-EG', { ...options, hour: '2-digit', minute: '2-digit' });
            case 'full':
            default:
                return date.toLocaleString('ar-EG', { ...options, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const colors = {
            success: 'alert-success',
            error: 'alert-error',
            warning: 'alert-warning',
            info: 'alert-info'
        };

        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const toast = document.createElement('div');
        toast.className = `alert ${colors[type]} shadow-lg mb-2 animate-fade-in`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="bi ${icons[type]} text-lg"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function exportData() {
        const data = localStorage.getItem('accounting_pro_eg_v5');
        if (!data) {
            showToast('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accounting-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('تم تصدير النسخة الاحتياطية بنجاح ✅', 'success');
    }

    function importData(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem('accounting_pro_eg_v5', JSON.stringify(data));
                showToast('تم استيراد البيانات بنجاح ✅', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                showToast('فشل استيراد البيانات', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    console.log('✅ APP_CORE تم تعريفه بنجاح');
    
    return {
        version,
        buildDate,
        appState,
        initialize,
        getData,
        setData,
        addItem,
        updateItem,
        deleteItem,
        generateId,
        formatCurrency,
        formatDate,
        showToast,
        exportData,
        importData
    };
})();

if (typeof APP_CORE !== 'undefined') {
    console.log('✅✅✅ APP_CORE محمّل بنجاح ✅✅✅');
    console.log('📦 الإصدار:', APP_CORE.version);
    console.log('🇪🇬 النظام المصري جاهز');
} else {
    console.error('❌❌❌ فشل تحميل APP_CORE ❌❌❌');
}