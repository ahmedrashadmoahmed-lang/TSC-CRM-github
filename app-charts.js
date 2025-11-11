// ==================== نظام الرسوم البيانية - مُصلح ====================
const APP_CHARTS = (function() {
    'use strict';

    let salesChartInstance = null;
    let customersChartInstance = null;

    // ==================== رسم بياني للمبيعات الشهرية ====================
    function renderSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) {
            console.warn('⚠️ Canvas salesChart غير موجود');
            return;
        }

        // حذف الرسم البياني القديم
        if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null;
        }

        const quotations = APP_CORE.getData('quotations') || [];
        
        // تجميع البيانات حسب الشهر
        const monthlyData = {};
        quotations.filter(q => q.status === 'closed').forEach(q => {
            const month = new Date(q.date).toLocaleString('ar-SA', { month: 'short', year: 'numeric' });
            if (!monthlyData[month]) {
                monthlyData[month] = { sales: 0, profit: 0 };
            }
            monthlyData[month].sales += q.customerPrice || 0;
            monthlyData[month].profit += q.profit || 0;
        });

        const labels = Object.keys(monthlyData).slice(-6);
        const salesData = labels.map(l => monthlyData[l]?.sales || 0);
        const profitData = labels.map(l => monthlyData[l]?.profit || 0);

        const ctx = canvas.getContext('2d');
        
        salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'المبيعات',
                        data: salesData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'الأرباح',
                        data: profitData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('ar-SA') + ' ر.س';
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ تم رسم salesChart');
    }

    // ==================== رسم بياني دائري للعملاء ====================
    function renderCustomersChart() {
        const canvas = document.getElementById('customersChart');
        if (!canvas) {
            console.warn('⚠️ Canvas customersChart غير موجود');
            return;
        }

        // حذف الرسم البياني القديم
        if (customersChartInstance) {
            customersChartInstance.destroy();
            customersChartInstance = null;
        }

        const customers = APP_CORE.getData('customers') || [];
        const quotations = APP_CORE.getData('quotations') || [];

        // حساب المبيعات لكل عميل
        const customerSales = {};
        quotations.filter(q => q.status === 'closed').forEach(q => {
            const customer = customers.find(c => c.id === q.customerId);
            if (customer) {
                if (!customerSales[customer.name]) {
                    customerSales[customer.name] = 0;
                }
                customerSales[customer.name] += q.customerPrice || 0;
            }
        });

        // أفضل 5 عملاء
        const topCustomers = Object.entries(customerSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topCustomers.length === 0) {
            console.warn('⚠️ لا توجد بيانات للعملاء');
            return;
        }

        const ctx = canvas.getContext('2d');

        customersChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: topCustomers.map(c => c[0]),
                datasets: [{
                    data: topCustomers.map(c => c[1]),
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toLocaleString('ar-SA') + ' ر.س';
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ تم رسم customersChart');
    }

    // ==================== تهيئة الرسوم البيانية ====================
    function initializeCharts() {
        console.log('🎨 تهيئة الرسوم البيانية...');
        
        setTimeout(() => {
            try {
                renderSalesChart();
                renderCustomersChart();
                console.log('✅ تم تهيئة جميع الرسوم البيانية');
            } catch (error) {
                console.error('❌ خطأ في تهيئة الرسوم البيانية:', error);
            }
        }, 300);
    }

    // ==================== تنظيف الرسوم البيانية ====================
    function destroyCharts() {
        if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null;
        }
        if (customersChartInstance) {
            customersChartInstance.destroy();
            customersChartInstance = null;
        }
        console.log('🗑️ تم تنظيف الرسوم البيانية');
    }

    // ==================== Public API ====================
    return {
        renderSalesChart,
        renderCustomersChart,
        initializeCharts,
        destroyCharts
    };
})();

console.log('✅ APP_CHARTS جاهز');