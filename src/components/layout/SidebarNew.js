'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SidebarNew() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: 'bi-speedometer2', label: 'لوحة التحكم', href: '/dashboard-new' },
    { icon: 'bi-funnel', label: 'مسار المبيعات', href: '/pipeline' },
    { icon: 'bi-file-earmark-text', label: 'طلبات العروض', href: '/rfq' },
    { icon: 'bi-cart', label: 'أوامر الشراء', href: '/po' },
    { icon: 'bi-box-seam', label: 'المخزون', href: '/inventory' },
    { icon: 'bi-truck', label: 'التوصيل', href: '/fulfillment' },
    { icon: 'bi-receipt', label: 'الفواتير', href: '/invoicing' },
    { icon: 'bi-journal-text', label: 'المحاسبة', href: '/accounting/chart-of-accounts' },
    { icon: 'bi-people', label: 'جهات الاتصال', href: '/contacts' },
    { icon: 'bi-person-badge', label: 'الموارد البشرية', href: '/hr' },
    { icon: 'bi-graph-up', label: 'التحليلات', href: '/analytics' },
    { icon: 'bi-file-bar-graph', label: 'التقارير', href: '/reports' },
    { icon: 'bi-gear', label: 'الإعدادات', href: '/settings' },
  ];

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen sticky top-0 transition-all duration-300 flex flex-col z-40 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600">
        {!collapsed && (
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <i className="bi bi-lightning-charge-fill"></i>
            <span>نظام محاسبي برو</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <i className={`bi bi-chevron-${collapsed ? 'left' : 'right'} text-lg text-white`}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : ''}
                >
                  <i
                    className={`bi ${item.icon} text-xl ${isActive ? 'text-white' : 'text-blue-500'}`}
                  ></i>
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Summary (Bottom) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-xl font-bold">A</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate text-gray-900 dark:text-gray-100">
                Ahmed Rashad
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
