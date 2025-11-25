'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        setIsDark(shouldBeDark);
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        const theme = newTheme ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={isDark ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي'}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
