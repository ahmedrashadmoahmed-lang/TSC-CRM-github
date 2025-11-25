import { ar } from './locales/ar';
import { en } from './locales/en';

const translations = {
    ar,
    en,
};

let currentLocale = 'ar'; // Default to Arabic

export function setLocale(locale) {
    if (translations[locale]) {
        currentLocale = locale;

        // Update HTML dir attribute
        if (typeof document !== 'undefined') {
            document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = locale;
        }
    }
}

export function getLocale() {
    return currentLocale;
}

export function t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[currentLocale];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }

    if (typeof value === 'string') {
        // Replace parameters
        return value.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }

    return key;
}

// React hook for translations
export function useTranslation() {
    return {
        t,
        locale: currentLocale,
        setLocale,
    };
}

export default {
    t,
    setLocale,
    getLocale,
    useTranslation,
};
