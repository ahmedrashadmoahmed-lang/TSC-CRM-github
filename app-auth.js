// ==================== نظام المصادقة والصلاحيات ====================
const APP_AUTH = (function() {
    'use strict';

    // ==================== Users Database ====================
    const USERS = {
        accountant: {
            id: 'accountant',
            username: 'accountant',
            password: '123456',
            name: 'أحمد محمود',
            fullName: 'أحمد محمود - المحاسب الرئيسي',
            role: 'accountant',
            email: 'ahmed@accounting-pro.com',
            phone: '+966501234567',
            avatar: 'أ',
            department: 'المحاسبة',
            permissions: ['all'],
            canAccess: ['dashboard', 'accounting', 'invoices', 'customers', 'suppliers', 'reports', 'settings']
        },
        sales_manager: {
            id: 'sales_manager',
            username: 'sales_manager',
            password: '123456',
            name: 'محمد عبدالله',
            fullName: 'محمد عبدالله - مدير المبيعات',
            role: 'sales_manager',
            email: 'mohamed@accounting-pro.com',
            phone: '+966502345678',
            avatar: 'م',
            department: 'المبيعات',
            permissions: ['sales', 'customers', 'reports'],
            canAccess: ['dashboard', 'customers', 'opportunities', 'quotations', 'sales_orders', 'sales_team', 'reports']
        },
        sales_agent1: {
            id: 'sales_agent1',
            username: 'sales_agent1',
            password: '123456',
            name: 'خالد سعيد',
            fullName: 'خالد سعيد - مندوب مبيعات',
            role: 'sales_agent',
            email: 'khaled@accounting-pro.com',
            phone: '+966503456789',
            avatar: 'خ',
            department: 'المبيعات',
            manager: 'sales_manager',
            permissions: ['sales'],
            canAccess: ['dashboard', 'customers', 'opportunities', 'quotations', 'sales_orders']
        },
        sales_agent2: {
            id: 'sales_agent2',
            username: 'sales_agent2',
            password: '123456',
            name: 'سارة علي',
            fullName: 'سارة علي - مندوبة مبيعات',
            role: 'sales_agent',
            email: 'sara@accounting-pro.com',
            phone: '+966504567890',
            avatar: 'س',
            department: 'المبيعات',
            manager: 'sales_manager',
            permissions: ['sales'],
            canAccess: ['dashboard', 'customers', 'opportunities', 'quotations', 'sales_orders']
        },
        purchase_manager: {
            id: 'purchase_manager',
            username: 'purchase_manager',
            password: '123456',
            name: 'محسن كمال',
            fullName: 'محسن كمال - مدير المشتريات',
            role: 'purchase_manager',
            email: 'mohsen@accounting-pro.com',
            phone: '+966505678901',
            avatar: 'م',
            department: 'المشتريات',
            permissions: ['purchases'],
            canAccess: ['dashboard', 'suppliers', 'purchase_orders', 'inventory', 'reports']
        }
    };

    // ==================== Role Names ====================
    const ROLE_NAMES = {
        accountant: 'المحاسب الرئيسي',
        sales_manager: 'مدير المبيعات',
        sales_agent: 'مندوب مبيعات',
        purchase_manager: 'مدير المشتريات'
    };

    // ==================== Check Login Status ====================
    function checkLoginStatus() {
        const savedUser = localStorage.getItem('accounting_pro_current_user_v5');
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                APP_CORE.appState.currentUser = user;
                showMainApp(user);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                showLoginPage();
            }
        } else {
            showLoginPage();
        }
    }

    // ==================== Show Login Page ====================
    function showLoginPage() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';

        // Setup form handler
        const form = document.getElementById('login-form');
        if (form) {
            form.onsubmit = handleLogin;
        }
    }

    // ==================== Handle Login ====================
    function handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        const user = USERS[username];

        if (!user) {
            APP_CORE.showToast('المستخدم غير موجود', 'error');
            return false;
        }

        if (user.password !== password) {
            APP_CORE.showToast('كلمة المرور غير صحيحة', 'error');
            return false;
        }

        // Successful login
        const userData = {
            ...user,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
        };

        APP_CORE.appState.currentUser = userData;
        localStorage.setItem('accounting_pro_current_user_v5', JSON.stringify(userData));

        APP_CORE.showToast(`مرحباً ${user.name}!`, 'success');
        
        setTimeout(() => {
            showMainApp(userData);
        }, 500);

        return false;
    }

    // ==================== Show Main App ====================
    function showMainApp(user) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';

        // Update UI with user info
        updateUserInterface(user);

        // Initialize theme
        initializeTheme();

        // Load navigation
        loadNavigation(user);

        // Navigate to dashboard
        APP_PAGES.navigateTo('dashboard');

        // Update stats
        updateQuickStats();
    }

    // ==================== Update User Interface ====================
    function updateUserInterface(user) {
        // Avatar
        const avatars = document.querySelectorAll('#user-avatar, #user-avatar-menu');
        avatars.forEach(el => el.textContent = user.avatar);

        // Name
        document.getElementById('user-name-menu').textContent = user.name;
        
        // Role
        document.getElementById('user-role-menu').textContent = ROLE_NAMES[user.role] || user.role;
    }

    // ==================== Load Navigation ====================
    function loadNavigation(user) {
        const menu = document.getElementById('sidebar-menu');
        if (!menu) return;

        const menuItems = [
            { id: 'dashboard', icon: 'bi-speedometer2', title: 'لوحة التحكم', roles: ['all'] },
            
            { divider: true, title: 'المبيعات والعملاء' },
            { id: 'customers', icon: 'bi-people', title: 'العملاء', roles: ['accountant', 'sales_manager', 'sales_agent'] },
            { id: 'opportunities', icon: 'bi-briefcase', title: 'الفرص البيعية', roles: ['accountant', 'sales_manager', 'sales_agent'] },
            { id: 'quotations', icon: 'bi-file-earmark-text', title: 'عروض الأسعار', roles: ['accountant', 'sales_manager', 'sales_agent'] },
            { id: 'sales_orders', icon: 'bi-cart-check', title: 'طلبات البيع', roles: ['accountant', 'sales_manager', 'sales_agent'] },
            { id: 'sales_team', icon: 'bi-person-badge', title: 'فريق المبيعات', roles: ['accountant', 'sales_manager'] },
            
            { divider: true, title: 'المشتريات والمخزون' },
            { id: 'suppliers', icon: 'bi-truck', title: 'الموردون', roles: ['accountant', 'purchase_manager'] },
            { id: 'purchase_orders', icon: 'bi-cart-plus', title: 'طلبات الشراء', roles: ['accountant', 'purchase_manager'] },
            { id: 'inventory', icon: 'bi-box-seam', title: 'المخزون', roles: ['accountant', 'purchase_manager'] },
            
            { divider: true, title: 'المحاسبة والتقارير' },
            { id: 'accounting', icon: 'bi-calculator', title: 'المحاسبة', roles: ['accountant'] },
            { id: 'invoices', icon: 'bi-receipt', title: 'الفواتير', roles: ['accountant'] },
            { id: 'reports', icon: 'bi-graph-up', title: 'التقارير', roles: ['all'] },
            
            { divider: true, title: 'الإعدادات' },
            { id: 'settings', icon: 'bi-gear', title: 'الإعدادات', roles: ['accountant'] }
        ];

        let html = '';
        
        menuItems.forEach(item => {
            if (item.divider) {
                html += `<li class="menu-title mt-4"><span>${item.title}</span></li>`;
            } else if (canAccessPage(user, item.id, item.roles)) {
                html += `
                    <li>
                        <a class="nav-link" data-page="${item.id}" onclick="APP_PAGES.navigateTo('${item.id}')">
                            <i class="bi ${item.icon}"></i>
                            <span>${item.title}</span>
                        </a>
                    </li>
                `;
            }
        });

        menu.innerHTML = html;
    }

    // ==================== Check Permissions ====================
    function canAccessPage(user, pageId, allowedRoles) {
        if (!user) return false;
        
        if (allowedRoles.includes('all')) return true;
        
        if (user.permissions.includes('all')) return true;
        
        return allowedRoles.includes(user.role);
    }

    function hasPermission(permission) {
        const user = APP_CORE.appState.currentUser;
        if (!user) return false;
        
        if (user.permissions.includes('all')) return true;
        
        return user.permissions.includes(permission);
    }

    // ==================== Theme Management ====================
    function initializeTheme() {
        const savedTheme = localStorage.getItem('accounting_pro_theme') || 'light';
        APP_CORE.appState.currentTheme = savedTheme;
        applyTheme(savedTheme);
    }

    function toggleTheme() {
        const newTheme = APP_CORE.appState.currentTheme === 'light' ? 'dark' : 'light';
        APP_CORE.appState.currentTheme = newTheme;
        applyTheme(newTheme);
        localStorage.setItem('accounting_pro_theme', newTheme);
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }

    // ==================== Logout ====================
    function logout() {
        if (confirm('هل تريد تسجيل الخروج من النظام؟')) {
            localStorage.removeItem('accounting_pro_current_user_v5');
            APP_CORE.appState.currentUser = null;
            
            APP_CORE.showToast('تم تسجيل الخروج بنجاح', 'success');
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    // ==================== Update Quick Stats ====================
    function updateQuickStats() {
        const customers = APP_CORE.getData('customers') || [];
        const invoices = APP_CORE.getData('invoices') || [];
        const salesOrders = APP_CORE.getData('salesOrders') || [];

        // Active customers
        const activeCustomers = customers.filter(c => c.status === 'active').length;
        document.getElementById('stat-customers').textContent = activeCustomers;

        // Pending invoices
        const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
        document.getElementById('stat-invoices').textContent = pendingInvoices;

        // Monthly sales
        const now = new Date();
        const monthlySales = salesOrders
            .filter(so => {
                const orderDate = new Date(so.date);
                return orderDate.getMonth() === now.getMonth() && 
                       orderDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, so) => sum + (so.totalAmount || 0), 0);
        
        document.getElementById('stat-sales').textContent = APP_CORE.formatCurrency(monthlySales);
    }

    // ==================== Password Visibility Toggle ====================
    window.togglePasswordVisibility = function() {
        const input = document.getElementById('login-password');
        const icon = document.getElementById('password-toggle-icon');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    };

    // ==================== Public API ====================
    return {
        checkLoginStatus,
        handleLogin,
        logout,
        toggleTheme,
        hasPermission,
        canAccessPage,
        getRoleName: (role) => ROLE_NAMES[role] || role,
        getCurrentUser: () => APP_CORE.appState.currentUser
    };
})();