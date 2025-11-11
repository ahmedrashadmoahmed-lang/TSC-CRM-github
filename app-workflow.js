// ==================== نظام سير العمل المتكامل ====================
const APP_WORKFLOW = (function() {
    'use strict';

    // ==================== Workflow Steps ====================
    const WORKFLOW_STEPS = [
        { 
            id: 'customers', 
            name: 'العملاء', 
            icon: 'bi-people', 
            description: 'إدارة قاعدة العملاء',
            order: 1
        },
        { 
            id: 'opportunities', 
            name: 'الفرص البيعية', 
            icon: 'bi-briefcase', 
            description: 'تتبع الفرص المحتملة',
            order: 2
        },
        { 
            id: 'quotations', 
            name: 'عروض الأسعار', 
            icon: 'bi-file-earmark-text', 
            description: 'إنشاء وإرسال العروض',
            order: 3
        },
        { 
            id: 'sales_orders', 
            name: 'طلبات البيع', 
            icon: 'bi-cart-check', 
            description: 'إدارة طلبات البيع',
            order: 4
        },
        { 
            id: 'purchase_orders', 
            name: 'طلبات الشراء', 
            icon: 'bi-cart-plus', 
            description: 'توفير المنتجات',
            order: 5
        },
        { 
            id: 'inventory', 
            name: 'المخزون', 
            icon: 'bi-box-seam', 
            description: 'تحديث المخزون',
            order: 6
        },
        { 
            id: 'invoices', 
            name: 'الفواتير', 
            icon: 'bi-receipt', 
            description: 'إصدار الفواتير',
            order: 7
        },
        { 
            id: 'accounting', 
            name: 'المحاسبة', 
            icon: 'bi-calculator', 
            description: 'القيود المحاسبية',
            order: 8
        }
    ];

    // ==================== Initialize Workflow Tabs ====================
    function initializeWorkflowTabs() {
        const container = document.getElementById('workflow-tabs');
        if (!container) return;

        const user = APP_CORE.appState.currentUser;
        if (!user) return;

        let html = '';
        
        WORKFLOW_STEPS.forEach(step => {
            if (APP_AUTH.canAccessPage(user, step.id, ['all'])) {
                html += `
                    <a class="tab tab-bordered" data-step="${step.id}" onclick="APP_WORKFLOW.navigateToStep('${step.id}')" title="${step.description}">
                        <i class="bi ${step.icon}"></i>
                        <span class="hidden lg:inline ml-2">${step.name}</span>
                    </a>
                `;
            }
        });

        container.innerHTML = html;
    }

    // ==================== Navigate to Workflow Step ====================
    function navigateToStep(stepId) {
        // Update active tab
        document.querySelectorAll('#workflow-tabs .tab').forEach(tab => {
            if (tab.dataset.step === stepId) {
                tab.classList.add('tab-active');
            } else {
                tab.classList.remove('tab-active');
            }
        });

        // Navigate to page
        APP_PAGES.navigateTo(stepId);
    }

    // ==================== Get Next Step ====================
    function getNextStep(currentStepId) {
        const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStepId);
        if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) {
            return null;
        }
        return WORKFLOW_STEPS[currentIndex + 1];
    }

    // ==================== Get Previous Step ====================
    function getPreviousStep(currentStepId) {
        const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStepId);
        if (currentIndex <= 0) {
            return null;
        }
        return WORKFLOW_STEPS[currentIndex - 1];
    }

    // ==================== Workflow Progress ====================
    function calculateWorkflowProgress(recordId, recordType) {
        // Calculate progress based on record status and type
        // This is a simplified version
        let progress = 0;
        
        switch(recordType) {
            case 'opportunity':
                progress = 25;
                break;
            case 'quotation':
                progress = 50;
                break;
            case 'salesOrder':
                progress = 75;
                break;
            case 'invoice':
                progress = 100;
                break;
        }
        
        return progress;
    }

    // ==================== Render Workflow Diagram ====================
    function renderWorkflowDiagram() {
        return `
            <div class="card bg-white dark:bg-gray-800 shadow-lg">
                <div class="card-body">
                    <h3 class="card-title mb-6">
                        <i class="bi bi-diagram-3 text-primary"></i>
                        مخطط سير العمل المتكامل
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${WORKFLOW_STEPS.map((step, index) => `
                            <div class="workflow-step ${index === 0 ? 'active' : ''}" onclick="APP_WORKFLOW.navigateToStep('${step.id}')">
                                <div class="text-3xl mb-2">
                                    <i class="bi ${step.icon}"></i>
                                </div>
                                <h4 class="font-bold text-sm mb-1">${step.name}</h4>
                                <p class="text-xs opacity-80">${step.description}</p>
                                <div class="badge badge-sm bg-white/20 mt-2">${step.order}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="alert alert-info mt-6">
                        <i class="bi bi-info-circle"></i>
                        <span class="text-sm">
                            يتكون سير العمل من ${WORKFLOW_STEPS.length} خطوات رئيسية تبدأ من إدارة العملاء وتنتهي بالقيود المحاسبية
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Track Workflow Event ====================
    function trackWorkflowEvent(eventType, data) {
        const event = {
            id: APP_CORE.generateId('event'),
            type: eventType,
            data: data,
            userId: APP_CORE.appState.currentUser?.id,
            timestamp: new Date().toISOString()
        };

        // Here you can save events to a log or analytics system
        console.log('Workflow Event:', event);
    }

    // ==================== Validate Workflow Transition ====================
    function validateTransition(fromStep, toStep, record) {
        // Validate if transition is allowed
        const fromIndex = WORKFLOW_STEPS.findIndex(s => s.id === fromStep);
        const toIndex = WORKFLOW_STEPS.findIndex(s => s.id === toStep);

        if (fromIndex === -1 || toIndex === -1) {
            return { valid: false, message: 'خطوة غير صالحة' };
        }

        if (toIndex !== fromIndex + 1) {
            return { valid: false, message: 'يجب اتباع ترتيب سير العمل' };
        }

        // Add more validation logic here based on record status, etc.

        return { valid: true, message: 'الانتقال صالح' };
    }

    // ==================== Public API ====================
    return {
        initializeWorkflowTabs,
        navigateToStep,
        getNextStep,
        getPreviousStep,
        calculateWorkflowProgress,
        renderWorkflowDiagram,
        trackWorkflowEvent,
        validateTransition,
        WORKFLOW_STEPS
    };
})();