// Keyboard Shortcuts Hook
import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts) {
    const handleKeyPress = useCallback((event) => {
        // Check if user is typing in an input field
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
        if (isTyping) return;

        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        // Build shortcut string
        let shortcut = '';
        if (ctrl) shortcut += 'ctrl+';
        if (shift) shortcut += 'shift+';
        if (alt) shortcut += 'alt+';
        shortcut += key;

        // Execute matching shortcut
        const action = shortcuts[shortcut];
        if (action) {
            event.preventDefault();
            action();
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);
}

// Dashboard Keyboard Shortcuts
export const dashboardShortcuts = {
    // Navigation
    'ctrl+d': () => window.location.href = '/dashboard',
    'ctrl+c': () => window.location.href = '/contacts',
    'ctrl+o': () => window.location.href = '/opportunities',
    'ctrl+i': () => window.location.href = '/invoices',

    // Actions
    'ctrl+n': () => console.log('New item'),
    'ctrl+s': () => console.log('Save'),
    'ctrl+f': () => document.querySelector('[type="search"]')?.focus(),
    'ctrl+r': () => window.location.reload(),

    // UI
    'ctrl+k': () => console.log('Command palette'),
    'ctrl+/': () => console.log('Show shortcuts'),
    'esc': () => console.log('Close modal'),
};

// Keyboard Shortcuts Guide Component
export const shortcutsGuide = [
    {
        category: 'التنقل',
        shortcuts: [
            { keys: ['Ctrl', 'D'], description: 'لوحة التحكم' },
            { keys: ['Ctrl', 'C'], description: 'جهات الاتصال' },
            { keys: ['Ctrl', 'O'], description: 'الفرص' },
            { keys: ['Ctrl', 'I'], description: 'الفواتير' },
        ]
    },
    {
        category: 'الإجراءات',
        shortcuts: [
            { keys: ['Ctrl', 'N'], description: 'عنصر جديد' },
            { keys: ['Ctrl', 'S'], description: 'حفظ' },
            { keys: ['Ctrl', 'F'], description: 'بحث' },
            { keys: ['Ctrl', 'R'], description: 'تحديث' },
        ]
    },
    {
        category: 'الواجهة',
        shortcuts: [
            { keys: ['Ctrl', 'K'], description: 'لوحة الأوامر' },
            { keys: ['Ctrl', '/'], description: 'عرض الاختصارات' },
            { keys: ['Esc'], description: 'إغلاق' },
        ]
    }
];
