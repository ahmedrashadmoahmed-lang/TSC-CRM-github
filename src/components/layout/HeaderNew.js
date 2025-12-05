'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/hooks/useTheme';

export default function HeaderNew({ title, subtitle, actions }) {
    const { data: session } = useSession();
    const { theme, toggleTheme, isDark } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 px-4 h-16 flex items-center justify-between">
            {/* Left Side: Title & Breadcrumbs */}
            <div className="flex-1 flex flex-col items-start justify-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                {subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>
                )}
            </div>

            {/* Right Side: Actions & Profile */}
            <div className="flex items-center gap-2">
                {/* Custom Actions */}
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <i className="bi bi-sun-fill text-lg text-yellow-500"></i>
                    ) : (
                        <i className="bi bi-moon-fill text-lg text-gray-600 dark:text-gray-400"></i>
                    )}
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                    <i className="bi bi-bell text-lg text-gray-600 dark:text-gray-400"></i>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                                {session?.user?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                            {/* User Info */}
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-gray-900 dark:text-gray-100 font-bold text-sm">{session?.user?.name || 'User'}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{session?.user?.email || 'user@example.com'}</p>
                            </div>

                            {/* Menu Items */}
                            <button className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-end gap-2">
                                <span>الملف الشخصي</span>
                                <i className="bi bi-person"></i>
                            </button>

                            <button className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-end gap-2">
                                <span>الإعدادات</span>
                                <i className="bi bi-gear"></i>
                            </button>

                            {/* Logout */}
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        signOut();
                                    }}
                                    className="w-full text-right px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center justify-end gap-2"
                                >
                                    <span>تسجيل الخروج</span>
                                    <i className="bi bi-box-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
