'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GlobalSearch.module.css';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        // Close on click outside
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Keyboard shortcut: Ctrl+K or Cmd+K
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                searchRef.current?.querySelector('input')?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            performSearch();
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setResults(data.data.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (result) => {
        router.push(result.link);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    const getTypeLabel = (type) => {
        const labels = {
            customer: 'عميل',
            invoice: 'فاتورة',
            product: 'منتج',
            supplier: 'مورد',
            employee: 'موظف'
        };
        return labels[type] || type;
    };

    return (
        <div className={styles.container} ref={searchRef}>
            <div className={styles.searchBox}>
                <span className={styles.icon}>🔍</span>
                <input
                    type="text"
                    placeholder="بحث... (Ctrl+K)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className={styles.input}
                />
                {query && (
                    <button
                        className={styles.clearBtn}
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {isOpen && (query.length >= 2 || results.length > 0) && (
                <div className={styles.results}>
                    {loading ? (
                        <div className={styles.loading}>جاري البحث...</div>
                    ) : results.length === 0 ? (
                        <div className={styles.empty}>لا توجد نتائج</div>
                    ) : (
                        <>
                            <div className={styles.resultsHeader}>
                                {results.length} نتيجة
                            </div>
                            {results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={styles.resultItem}
                                    onClick={() => handleResultClick(result)}
                                >
                                    <span className={styles.resultIcon}>{result.icon}</span>
                                    <div className={styles.resultContent}>
                                        <div className={styles.resultTitle}>{result.title}</div>
                                        <div className={styles.resultSubtitle}>
                                            {result.subtitle}
                                        </div>
                                    </div>
                                    <span className={styles.resultType}>
                                        {getTypeLabel(result.type)}
                                    </span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
