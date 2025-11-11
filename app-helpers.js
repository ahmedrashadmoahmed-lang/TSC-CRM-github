// ==================== الدوال المساعدة - النسخة المصرية الكاملة ====================
console.log('🔧 تحميل الدوال المساعدة...');

// ==================== دوال العملة المصرية ====================
function formatEgyptianCurrency(amount, showCurrency = true, decimals = 2) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return showCurrency ? '0.00 ج.م' : '0.00';
    }
    const formatted = parseFloat(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return showCurrency ? `${formatted} ج.م` : formatted;
}

function formatUSDCurrency(amount, showCurrency = true, decimals = 2) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return showCurrency ? '$0.00' : '0.00';
    }
    const formatted = parseFloat(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return showCurrency ? `$${formatted}` : formatted;
}

function convertEGPToUSD(amountEGP, exchangeRate = null) {
    if (!exchangeRate) {
        const settings = typeof APP_CORE !== 'undefined' ? APP_CORE.getData('settings') : null;
        exchangeRate = settings?.financial?.exchangeRate || 30.90;
    }
    return amountEGP / exchangeRate;
}

function convertUSDToEGP(amountUSD, exchangeRate = null) {
    if (!exchangeRate) {
        const settings = typeof APP_CORE !== 'undefined' ? APP_CORE.getData('settings') : null;
        exchangeRate = settings?.financial?.exchangeRate || 30.90;
    }
    return amountUSD * exchangeRate;
}

function calculateEgyptianTax(amount, includesTax = false) {
    const taxRate = 0.14; // 14%
    
    if (includesTax) {
        const baseAmount = amount / (1 + taxRate);
        const taxAmount = amount - baseAmount;
        return {
            baseAmount: baseAmount,
            taxAmount: taxAmount,
            totalAmount: amount,
            taxRate: taxRate * 100
        };
    } else {
        const taxAmount = amount * taxRate;
        const totalAmount = amount + taxAmount;
        return {
            baseAmount: amount,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            taxRate: taxRate * 100
        };
    }
}

// ==================== دوال حالات النظام ====================
function getQuotationStatusName(status) {
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

function getQuotationStatusBadge(status) {
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

function getOpportunityStageName(stage) {
    const stages = {
        prospecting: 'استكشاف',
        qualification: 'تأهيل',
        proposal: 'عرض',
        negotiation: 'تفاوض',
        closed: 'مغلقة'
    };
    return stages[stage] || stage;
}

function getPriorityName(priority) {
    const priorities = {
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة'
    };
    return priorities[priority] || priority;
}

function getSalesOrderStatusName(status) {
    const statuses = {
        draft: 'مسودة',
        pending: 'قيد الانتظار',
        approved: 'معتمد',
        completed: 'مكتمل',
        cancelled: 'ملغي'
    };
    return statuses[status] || status;
}

function getPaymentStatusName(status) {
    const statuses = {
        pending: 'معلق',
        partial: 'جزئي',
        paid: 'مدفوع',
        overdue: 'متأخر'
    };
    return statuses[status] || status;
}

// ==================== دوال التاريخ المصري ====================
function formatEgyptianDate(dateString, format = 'full') {
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

function getCurrentEgyptianTime() {
    return new Date().toLocaleString('ar-EG', {
        timeZone: 'Africa/Cairo',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

// ==================== دوال عامة ====================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof APP_CORE !== 'undefined') {
                APP_CORE.showToast('تم النسخ ✅', 'success');
            }
        }).catch(err => {
            console.error('فشل النسخ:', err);
        });
    }
}

function numberToArabicWords(num) {
    if (num === 0) return 'صفر';
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    
    if (num < 10) return ones[num];
    if (num < 20) {
        const special = {
            10: 'عشرة', 11: 'أحد عشر', 12: 'اثنا عشر', 13: 'ثلاثة عشر',
            14: 'أربعة عشر', 15: 'خمسة عشر', 16: 'ستة عشر', 17: 'سبعة عشر',
            18: 'ثمانية عشر', 19: 'تسعة عشر'
        };
        return special[num];
    }
    if (num < 100) {
        const tensPlace = Math.floor(num / 10);
        const onesPlace = num % 10;
        return tens[tensPlace] + (onesPlace > 0 ? ' و' + ones[onesPlace] : '');
    }
    
    return num.toLocaleString('ar-EG');
}

// ==================== تصدير للاستخدام العام ====================
window.formatEgyptianCurrency = formatEgyptianCurrency;
window.formatUSDCurrency = formatUSDCurrency;
window.convertEGPToUSD = convertEGPToUSD;
window.convertUSDToEGP = convertUSDToEGP;
window.calculateEgyptianTax = calculateEgyptianTax;
window.getQuotationStatusName = getQuotationStatusName;
window.getQuotationStatusBadge = getQuotationStatusBadge;
window.getOpportunityStageName = getOpportunityStageName;
window.getPriorityName = getPriorityName;
window.getSalesOrderStatusName = getSalesOrderStatusName;
window.getPaymentStatusName = getPaymentStatusName;
window.formatEgyptianDate = formatEgyptianDate;
window.getCurrentEgyptianTime = getCurrentEgyptianTime;
window.formatTimeAgo = formatTimeAgo;
window.copyToClipboard = copyToClipboard;
window.numberToArabicWords = numberToArabicWords;

console.log('✅ الدوال المساعدة جاهزة');