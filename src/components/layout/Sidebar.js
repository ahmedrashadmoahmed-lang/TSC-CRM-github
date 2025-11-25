'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { icon: '📊', label: 'Dashboard', href: '/' },
        { icon: '🎯', label: 'Sales Pipeline', href: '/pipeline' },
        { icon: '📝', label: 'RFQ', href: '/rfq' },
        { icon: '🛒', label: 'Purchase Orders', href: '/po' },
        { icon: '📦', label: 'Inventory', href: '/inventory' },
        { icon: '🚚', label: 'Fulfillment', href: '/fulfillment' },
        { icon: '💰', label: 'Invoicing', href: '/invoicing' },
        { icon: '📚', label: 'Accounting', href: '/accounting/chart-of-accounts' },
        { icon: '👥', label: 'Contacts', href: '/contacts' },
        { icon: '💼', label: 'HR & Payroll', href: '/hr' },
        { icon: '🤖', label: 'AI Analytics', href: '/analytics' },
        { icon: '📈', label: 'Reports', href: '/reports' },
        { icon: '⚙️', label: 'Settings', href: '/settings' },
    ];

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>⚡</span>
                    {!collapsed && <span className={styles.logoText}>Supply Chain ERP</span>}
                </div>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={styles.navItem}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {!collapsed && <span className={styles.label}>{item.label}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
