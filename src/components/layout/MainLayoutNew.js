'use client';

import SidebarNew from './SidebarNew';
import HeaderNew from './HeaderNew';

export default function MainLayoutNew({ children, title, subtitle, actions }) {
    return (
        <div className="flex flex-row-reverse h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <SidebarNew />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <HeaderNew
                    title={title}
                    subtitle={subtitle}
                    actions={actions}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
