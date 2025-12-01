'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader } from 'lucide-react';
import styles from './SmartSearch.module.css';

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length >= 2) {
            // Debounce search
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            setResults([]);
            setSuggestions([]);
            setIsOpen(false);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query]);

    const performSearch = async (searchQuery) => {
        setLoading(true);
        setIsOpen(true);

        try {
            const response = await fetch('/api/search/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });

            const data = await response.json();

            if (data.success) {
                setResults(data.data.results || []);
                setSuggestions(data.data.suggestions || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setSuggestions([]);
        setIsOpen(false);
    };

    const handleResultClick = (result) => {
        window.location.href = result.url;
    };

    const getTypeIcon = (type) => {
        const icons = {
            client: '👤',
            deal: '💼',
            task: '✓',
            ticket: '🎫',
            contact: '📇'
        };
        return icons[type] || '📄';
    };

    const getTypeLabel = (type) => {
        const labels = {
            client: 'عميل',
            deal: 'صفقة',
            task: 'مهمة',
            ticket: 'تذكرة',
            contact: 'جهة اتصال'
        };
        return labels[type] || type;
    };

    const highlightMatch = (text, query) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ?
                <mark key={index} className={styles.highlight}>{part}</mark> :
                part
        );
    };

    return (
        <div className={styles.container} ref={searchRef}>
            <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={20} />
                <input
                    type="text"
                    className={styles.input}
                    placeholder="ابحث عن عملاء، صفقات، مهام..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
                {loading && <Loader className={styles.loadingIcon} size={20} />}
                {query && !loading && (
                    <button className={styles.clearButton} onClick={handleClear}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && (results.length > 0 || suggestions.length > 0) && (
                <div className={styles.dropdown}>
                    {/* AI Suggestions */}
                    {suggestions.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>
                                🤖 اقتراحات ذكية
                            </div>
                            {suggestions.map((suggestion, index) => (
                                <a
                                    key={index}
                                    href={suggestion.url}
                                    className={styles.suggestion}
                                >
                                    <span className={styles.suggestionIcon}>
                                        {suggestion.icon}
                                    </span>
                                    <span className={styles.suggestionText}>
                                        {suggestion.text}
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>
                                نتائج البحث ({results.length})
                            </div>
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className={styles.result}
                                    onClick={() => handleResultClick(result)}
                                >
                                    <div className={styles.resultIcon}>
                                        {getTypeIcon(result.type)}
                                    </div>
                                    <div className={styles.resultContent}>
                                        <div className={styles.resultTitle}>
                                            {highlightMatch(result.title, query)}
                                        </div>
                                        <div className={styles.resultSubtitle}>
                                            {result.subtitle}
                                        </div>
                                    </div>
                                    <div className={styles.resultType}>
                                        {getTypeLabel(result.type)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.length === 0 && suggestions.length === 0 && !loading && (
                        <div className={styles.empty}>
                            لا توجد نتائج لـ &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
