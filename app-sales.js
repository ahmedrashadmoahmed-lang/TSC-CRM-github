// ==================== نظام إدارة المبيعات ====================
const APP_SALES = (function() {
    'use strict';

    // ==================== Create Opportunity ====================
    function createOpportunity(data) {
        const opportunity = {
            id: APP_CORE.generateId('opp'),
            title: data.title,
            customerId: data.customerId,
            salesAgent: data.salesAgent || APP_CORE.appState.currentUser?.id,
            expectedValue: parseFloat(data.expectedValue) || 0,
            probability: parseInt(data.probability) || 50,
            stage: data.stage || 'prospecting',
            expectedClose: data.expectedClose,
            priority: data.priority || 'medium',
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        APP_CORE.addItem('opportunities', opportunity);
        APP_CORE.showToast('تم إنشاء الفرصة البيعية بنجاح', 'success');
        
        return opportunity;
    }

    // ==================== Convert Opportunity to Quotation ====================
    function convertToQuotation(opportunityId) {
        const opportunities = APP_CORE.getData('opportunities') || [];
        const opportunity = opportunities.find(o => o.id === opportunityId);
        
        if (!opportunity) {
            APP_CORE.showToast('الفرصة غير موجودة', 'error');
            return null;
        }

        const quotation = {
            id: APP_CORE.generateId('quo'),
            number: generateQuotationNumber(),
            opportunityId: opportunityId,
            customerId: opportunity.customerId,
            salesAgent: opportunity.salesAgent,
            date: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            status: 'draft',
            notes: opportunity.notes,
            createdAt: new Date().toISOString()
        };

        APP_CORE.addItem('quotations', quotation);
        APP_CORE.showToast('تم تحويل الفرصة إلى عرض سعر', 'success');
        
        return quotation;
    }

    // ==================== Convert Quotation to Sales Order ====================
    function convertToSalesOrder(quotationId) {
        const quotations = APP_CORE.getData('quotations') || [];
        const quotation = quotations.find(q => q.id === quotationId);
        
        if (!quotation) {
            APP_CORE.showToast('عرض السعر غير موجود', 'error');
            return null;
        }

        if (quotation.status !== 'approved') {
            APP_CORE.showToast('يجب اعتماد عرض السعر أولاً', 'warning');
            return null;
        }

        const salesOrder = {
            id: APP_CORE.generateId('so'),
            number: generateSalesOrderNumber(),
            quotationId: quotationId,
            customerId: quotation.customerId,
            salesAgent: quotation.salesAgent,
            date: new Date().toISOString(),
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            items: quotation.items,
            subtotal: quotation.subtotal,
            tax: quotation.tax,
            totalAmount: quotation.total,
            status: 'pending',
            paymentStatus: 'pending',
            notes: quotation.notes,
            createdAt: new Date().toISOString()
        };

        APP_CORE.addItem('salesOrders', salesOrder);
        APP_CORE.showToast('تم تحويل عرض السعر إلى طلب بيع', 'success');
        
        return salesOrder;
    }

    // ==================== Create Purchase Order from Sales Order ====================
    function createPurchaseOrderFromSales(salesOrderId) {
        const salesOrders = APP_CORE.getData('salesOrders') || [];
        const salesOrder = salesOrders.find(so => so.id === salesOrderId);
        
        if (!salesOrder) {
            APP_CORE.showToast('طلب البيع غير موجود', 'error');
            return null;
        }

        const purchaseOrder = {
            id: APP_CORE.generateId('po'),
            number: generatePurchaseOrderNumber(),
            salesOrderId: salesOrderId,
            supplierId: null, // يتم تحديده لاحقاً
            requestedBy: APP_CORE.appState.currentUser?.id,
            date: new Date().toISOString(),
            expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            items: salesOrder.items,
            subtotal: 0,
            tax: 0,
            totalAmount: 0,
            status: 'draft',
            notes: `طلب شراء مرتبط بطلب البيع ${salesOrder.number}`,
            createdAt: new Date().toISOString()
        };

        APP_CORE.addItem('purchaseOrders', purchaseOrder);
        APP_CORE.showToast('تم إنشاء طلب شراء من طلب البيع', 'success');
        
        return purchaseOrder;
    }

    // ==================== Generate Numbers ====================
    function generateQuotationNumber() {
        const quotations = APP_CORE.getData('quotations') || [];
        const settings = APP_CORE.getData('settings') || {};
        const prefix = settings.financial?.quotationPrefix || 'QUO-';
        const count = quotations.length + 1;
        return `${prefix}${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    }

    function generateSalesOrderNumber() {
        const salesOrders = APP_CORE.getData('salesOrders') || [];
        const settings = APP_CORE.getData('settings') || {};
        const prefix = settings.financial?.salesOrderPrefix || 'SO-';
        const count = salesOrders.length + 1;
        return `${prefix}${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    }

    function generatePurchaseOrderNumber() {
        const purchaseOrders = APP_CORE.getData('purchaseOrders') || [];
        const settings = APP_CORE.getData('settings') || {};
        const prefix = settings.financial?.purchaseOrderPrefix || 'PO-';
        const count = purchaseOrders.length + 1;
        return `${prefix}${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    }

    // ==================== Calculate Commission ====================
    function calculateCommission(salesAgentId, amount) {
        const salesTeam = APP_CORE.getData('salesTeam') || [];
        const agent = salesTeam.find(a => a.id === salesAgentId);
        
        if (!agent) return 0;
        
        const commissionRate = agent.commissionRate || 0;
        return (amount * commissionRate) / 100;
    }

    // ==================== Update Sales Target ====================
    function updateSalesTarget(salesAgentId, amount) {
        const salesTeam = APP_CORE.getData('salesTeam') || [];
        const agentIndex = salesTeam.findIndex(a => a.id === salesAgentId);
        
        if (agentIndex !== -1) {
            salesTeam[agentIndex].achieved = (salesTeam[agentIndex].achieved || 0) + amount;
            APP_CORE.setData('salesTeam', salesTeam);
        }
    }

    // ==================== Get Sales Statistics ====================
    function getSalesStatistics(period = 'month') {
        const salesOrders = APP_CORE.getData('salesOrders') || [];
        const now = new Date();
        
        let filteredOrders = salesOrders;
        
        if (period === 'month') {
            filteredOrders = salesOrders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.getMonth() === now.getMonth() && 
                       orderDate.getFullYear() === now.getFullYear();
            });
        } else if (period === 'year') {
            filteredOrders = salesOrders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.getFullYear() === now.getFullYear();
            });
        }

        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const orderCount = filteredOrders.length;
        const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

        return {
            totalSales,
            orderCount,
            averageOrderValue,
            period
        };
    }

    // ==================== Public API ====================
    return {
        createOpportunity,
        convertToQuotation,
        convertToSalesOrder,
        createPurchaseOrderFromSales,
        calculateCommission,
        updateSalesTarget,
        getSalesStatistics,
        generateQuotationNumber,
        generateSalesOrderNumber,
        generatePurchaseOrderNumber
    };
})();