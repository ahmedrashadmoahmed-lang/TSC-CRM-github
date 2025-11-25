// Format currency
export function formatCurrency(amount, currency = 'EGP', locale = 'ar-EG') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Format number
export function formatNumber(number, locale = 'ar-EG') {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(number);
}

// Format date
export function formatDate(date, format = 'short', locale = 'ar-EG') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (format === 'short') {
        return dateObj.toLocaleDateString(locale);
    } else if (format === 'long') {
        return dateObj.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } else if (format === 'time') {
        return dateObj.toLocaleTimeString(locale);
    } else if (format === 'datetime') {
        return `${dateObj.toLocaleDateString(locale)} ${dateObj.toLocaleTimeString(locale)}`;
    }

    return dateObj.toLocaleDateString(locale);
}

// Format relative time (e.g., "منذ ساعتين")
export function formatRelativeTime(date, locale = 'ar') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
        return locale === 'ar' ? 'منذ لحظات' : 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return locale === 'ar'
            ? `منذ ${diffInMinutes} دقيقة`
            : `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return locale === 'ar'
            ? `منذ ${diffInHours} ساعة`
            : `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return locale === 'ar'
            ? `منذ ${diffInDays} يوم`
            : `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return locale === 'ar'
            ? `منذ ${diffInMonths} شهر`
            : `${diffInMonths} months ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return locale === 'ar'
        ? `منذ ${diffInYears} سنة`
        : `${diffInYears} years ago`;
}

// Format percentage
export function formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
}

// Format file size
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Truncate text
export function truncate(text, length = 50, suffix = '...') {
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
}

// Capitalize first letter
export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Generate random ID
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

// Debounce function
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Group array by key
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

// Sort array by key
export function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

// Calculate percentage
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
}

// Calculate percentage change
export function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone (Egyptian format)
export function isValidPhone(phone) {
    const re = /^(010|011|012|015)\d{8}$/;
    return re.test(phone.replace(/\s+/g, ''));
}

// Generate color from string (for avatars)
export function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 65%, 50%)`;
}

// Get initials from name
export function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Sleep/delay function
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retry(fn, options = {}) {
    const {
        retries = 3,
        delay = 1000,
        backoff = 2,
    } = options;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await sleep(delay * Math.pow(backoff, i));
        }
    }
}
