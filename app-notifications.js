// ==================== نظام الإشعارات الذكية ====================
const APP_NOTIFICATIONS = (function() {
    'use strict';

    let notifications = [];

    // ==================== إضافة إشعار ====================
    function addNotification(notification) {
        const newNotification = {
            id: APP_CORE.generateId('notif'),
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info', // info, success, warning, error
            icon: notification.icon || 'bi-bell',
            read: false,
            timestamp: new Date().toISOString(),
            action: notification.action || null
        };

        notifications.unshift(newNotification);
        
        // الاحتفاظ بآخر 50 إشعار فقط
        if (notifications.length > 50) {
            notifications = notifications.slice(0, 50);
        }

        saveNotifications();
        updateNotificationBadge();
        
        return newNotification;
    }

    // ==================== تحديث شارة الإشعارات ====================
    function updateNotificationBadge() {
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notification-badge');
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    // ==================== عرض قائمة الإشعارات ====================
    function renderNotificationsList() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-4">لا توجد إشعارات جديدة</p>';
            return;
        }

        container.innerHTML = notifications.map(notif => `
            <div class="p-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors ${notif.read ? 'opacity-60' : ''}" 
                 onclick="APP_NOTIFICATIONS.markAsRead('${notif.id}')">
                <div class="flex items-start gap-3">
                    <div class="text-2xl">
                        <i class="bi ${notif.icon} text-${getNotificationColor(notif.type)}"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-sm">${notif.title}</h4>
                        <p class="text-xs opacity-70 mt-1">${notif.message}</p>
                        <p class="text-xs opacity-50 mt-1">${formatRelativeTime(notif.timestamp)}</p>
                    </div>
                    ${!notif.read ? '<div class="w-2 h-2 bg-primary rounded-full"></div>' : ''}
                </div>
            </div>
        `).join('');
    }

    // ==================== تمييز كمقروء ====================
    function markAsRead(notificationId) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            saveNotifications();
            updateNotificationBadge();
            renderNotificationsList();
        }
    }

    // ==================== تمييز الكل كمقروء ====================
    function markAllAsRead() {
        notifications.forEach(n => n.read = true);
        saveNotifications();
        updateNotificationBadge();
        renderNotificationsList();
    }

    // ==================== فحص تلقائي للإشعارات ====================
    function checkForNotifications() {
        const quotations = APP_CORE.getData('quotations') || [];
        const products = APP_CORE.getData('products') || [];
        const now = new Date();

        // إشعار بعروض الأسعار المنتهية الصلاحية
        quotations.forEach(q => {
            if (q.status === 'pending') {
                const validUntil = new Date(q.validUntil);
                const daysUntilExpiry = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
                    addNotification({
                        title: 'عرض سعر قارب على الانتهاء',
                        message: `عرض السعر ${q.number} سينتهي خلال ${daysUntilExpiry} أيام`,
                        type: 'warning',
                        icon: 'bi-clock-history'
                    });
                }
            }
        });

        // إشعار بالمنتجات منخفضة المخزون
        const lowStockProducts = products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
        if (lowStockProducts.length > 0) {
            addNotification({
                title: 'تنبيه مخزون منخفض',
                message: `${lowStockProducts.length} منتج يحتاج إعادة طلب`,
                type: 'warning',
                icon: 'bi-exclamation-triangle'
            });
        }

        // إشعار بالمنتجات نفدت من المخزون
        const outOfStockProducts = products.filter(p => p.currentStock === 0);
        if (outOfStockProducts.length > 0) {
            addNotification({
                title: 'تنبيه مخزون نفد',
                message: `${outOfStockProducts.length} منتج نفد من المخزون`,
                type: 'error',
                icon: 'bi-x-circle'
            });
        }
    }

    // ==================== دوال مساعدة ====================
    function getNotificationColor(type) {
        const colors = {
            info: 'info',
            success: 'success',
            warning: 'warning',
            error: 'error'
        };
        return colors[type] || 'info';
    }

    function formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'الآن';
        if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
        if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
        return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    }

    function saveNotifications() {
        localStorage.setItem('accounting_pro_notifications_v5', JSON.stringify(notifications));
    }

    function loadNotifications() {
        const saved = localStorage.getItem('accounting_pro_notifications_v5');
        if (saved) {
            notifications = JSON.parse(saved);
            updateNotificationBadge();
        }
    }

    // ==================== تهيئة ====================
    function initialize() {
        loadNotifications();
        renderNotificationsList();
        
        // فحص كل 5 دقائق
        setInterval(checkForNotifications, 5 * 60 * 1000);
        
        // فحص فوري
        setTimeout(checkForNotifications, 2000);
    }

    // ==================== Public API ====================
    return {
        addNotification,
        markAsRead,
        markAllAsRead,
        renderNotificationsList,
        updateNotificationBadge,
        initialize
    };
})();