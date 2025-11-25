'use client';

import { useState, useEffect } from 'react';
import { setLocale, getLocale } from '@/i18n';

export default function LanguageSwitcher() {
    const [currentLocale, setCurrentLocale] = useState('ar');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrentLocale(getLocale());
    }, []);

    const handleLanguageChange = (locale) => {
        setLocale(locale);
        setCurrentLocale(locale);
        setIsOpen(false);

        // Update document direction
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;

        // Reload page to apply changes
        window.location.reload();
    };

    const languages = [
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
    ];

    const currentLanguage = languages.find(lang => lang.code === currentLocale);

    return (
        <div className="language-switcher">
            <button
                className="language-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change language"
            >
                <span className="flag">{currentLanguage?.flag}</span>
                <span className="language-name">{currentLanguage?.name}</span>
                <svg
                    className={`arrow ${isOpen ? 'open' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                >
                    <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="overlay" onClick={() => setIsOpen(false)} />
                    <div className="dropdown">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                className={`dropdown-item ${language.code === currentLocale ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(language.code)}
                            >
                                <span className="flag">{language.flag}</span>
                                <span className="language-name">{language.name}</span>
                                {language.code === currentLocale && (
                                    <svg
                                        className="check-icon"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M13.5 4.5L6 12L2.5 8.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <style jsx>{`
        .language-switcher {
          position: relative;
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .language-button:hover {
          background: var(--bg-tertiary);
          border-color: var(--primary-color);
        }

        .flag {
          font-size: 1.25rem;
          line-height: 1;
        }

        .language-name {
          font-weight: 500;
        }

        .arrow {
          transition: transform 0.2s;
          color: var(--text-secondary);
        }

        .arrow.open {
          transform: rotate(180deg);
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 998;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 150px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 999;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.875rem;
          color: var(--text-primary);
          text-align: right;
        }

        .dropdown-item:hover {
          background: var(--bg-secondary);
        }

        .dropdown-item.active {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .check-icon {
          margin-right: auto;
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .language-name {
            display: none;
          }

          .dropdown {
            right: auto;
            left: 0;
          }
        }
      `}</style>
        </div>
    );
}
