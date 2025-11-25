'use client';

import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import styles from './KeyboardShortcuts.module.css';

const SHORTCUTS = [
    { key: 'R', description: 'تحديث البيانات', action: 'refresh' },
    { key: 'E', description: 'تصدير التقرير', action: 'export' },
    { key: 'F', description: 'التركيز على البحث', action: 'search' },
    { key: 'D', description: 'تبديل الوضع الليلي/النهاري', action: 'theme' },
    { key: '?', description: 'عرض الاختصارات', action: 'help' },
];

export default function KeyboardShortcuts({ onAction }) {
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toUpperCase()) {
                case 'R':
                    e.preventDefault();
                    onAction?.('refresh');
                    break;
                case 'E':
                    e.preventDefault();
                    onAction?.('export');
                    break;
                case 'F':
                    e.preventDefault();
                    onAction?.('search');
                    break;
                case 'D':
                    e.preventDefault();
                    onAction?.('theme');
                    break;
                case '?':
                    e.preventDefault();
                    setShowHelp(true);
                    break;
                case 'ESCAPE':
                    setShowHelp(false);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onAction]);

    return (
        <>
            <button
                className={styles.helpButton}
                onClick={() => setShowHelp(true)}
                title="اختصارات لوحة المفاتيح (?)"
            >
                <Keyboard size={18} />
            </button>

            {showHelp && (
                <>
                    <div className={styles.overlay} onClick={() => setShowHelp(false)} />
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <h3>اختصارات لوحة المفاتيح</h3>
                            <button className={styles.closeButton} onClick={() => setShowHelp(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.shortcuts}>
                            {SHORTCUTS.map((shortcut) => (
                                <div key={shortcut.key} className={styles.shortcut}>
                                    <kbd className={styles.key}>{shortcut.key}</kbd>
                                    <span className={styles.description}>{shortcut.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
