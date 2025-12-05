/**
 * Budget Checker Utility
 * Validates PO against budget constraints
 */

export async function checkBudget(poData, prisma) {
    const { totalAmount, budgetId, tenantId } = poData;

    if (!budgetId) {
        return {
            withinBudget: true,
            message: 'لا توجد ميزانية محددة'
        };
    }

    try {
        // Get budget
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId }
        });

        if (!budget) {
            return {
                withinBudget: false,
                message: 'الميزانية غير موجودة',
                exceeded: false
            };
        }

        // Get all POs using this budget
        const existingPOs = await prisma.advancedPurchaseOrder.findMany({
            where: {
                budgetId,
                tenantId,
                status: {
                    notIn: ['cancelled', 'closed']
                }
            }
        });

        const usedBudget = existingPOs.reduce((sum, po) => sum + po.totalAmount, 0);
        const remainingBudget = budget.amount - usedBudget;
        const afterPO = remainingBudget - totalAmount;

        const withinBudget = afterPO >= 0;
        const utilizationRate = ((usedBudget + totalAmount) / budget.amount) * 100;

        return {
            withinBudget,
            budgetAmount: budget.amount,
            usedBudget,
            remainingBudget,
            afterPO,
            utilizationRate: Math.round(utilizationRate),
            exceeded: !withinBudget,
            message: withinBudget
                ? `ضمن الميزانية - متبقي: ${afterPO.toLocaleString()}`
                : `تجاوز الميزانية بمقدار: ${Math.abs(afterPO).toLocaleString()}`
        };

    } catch (error) {
        console.error('Budget check error:', error);
        return {
            withinBudget: false,
            message: 'خطأ في فحص الميزانية',
            error: error.message
        };
    }
}

/**
 * Calculate estimated total cost including all fees
 */
export function calculateEstimatedCost(poData) {
    const {
        items = [],
        shippingCost = 0,
        taxRate = 0,
        customsDuty = 0,
        otherFees = 0
    } = poData;

    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
    }, 0);

    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + shippingCost + taxAmount + customsDuty + otherFees;

    return {
        subtotal,
        shippingCost,
        taxAmount,
        customsDuty,
        otherFees,
        total,
        breakdown: {
            itemsTotal: subtotal,
            shipping: shippingCost,
            tax: taxAmount,
            customs: customsDuty,
            other: otherFees
        }
    };
}

/**
 * Determine approval level based on amount
 */
export function determineApprovalLevel(amount) {
    if (amount > 100000) return 3; // CEO + CFO + Procurement Manager
    if (amount > 50000) return 2;  // CFO + Procurement Manager
    return 1;                       // Procurement Manager only
}

/**
 * Get required approvers for a PO
 */
export function getRequiredApprovers(amount, tenantId) {
    const level = determineApprovalLevel(amount);

    const approvers = [];

    if (level >= 1) {
        approvers.push({
            role: 'procurement_manager',
            level: 1,
            required: true
        });
    }

    if (level >= 2) {
        approvers.push({
            role: 'finance_manager',
            level: 2,
            required: true
        });
    }

    if (level >= 3) {
        approvers.push({
            role: 'admin',
            level: 3,
            required: true
        });
    }

    return approvers;
}

/**
 * Validate PO data before creation
 */
export function validatePOData(poData) {
    const errors = [];

    if (!poData.supplierId) {
        errors.push('المورد مطلوب');
    }

    if (!poData.items || poData.items.length === 0) {
        errors.push('يجب إضافة بند واحد على الأقل');
    }

    if (poData.items) {
        poData.items.forEach((item, index) => {
            if (!item.productName) {
                errors.push(`البند ${index + 1}: اسم المنتج مطلوب`);
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`البند ${index + 1}: الكمية يجب أن تكون أكبر من صفر`);
            }
            if (!item.unitPrice || item.unitPrice <= 0) {
                errors.push(`البند ${index + 1}: السعر يجب أن يكون أكبر من صفر`);
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Calculate delivery metrics
 */
export function calculateDeliveryMetrics(po) {
    if (!po.expectedDelivery) {
        return {
            hasExpectedDate: false,
            daysUntilDelivery: null,
            isOverdue: false,
            deliveryStatus: 'unknown'
        };
    }

    const now = new Date();
    const expected = new Date(po.expectedDelivery);
    const daysUntilDelivery = Math.ceil((expected - now) / (1000 * 60 * 60 * 24));

    let deliveryStatus = 'on_track';
    if (po.actualDelivery) {
        const actual = new Date(po.actualDelivery);
        deliveryStatus = actual <= expected ? 'on_time' : 'late';
    } else if (daysUntilDelivery < 0) {
        deliveryStatus = 'overdue';
    } else if (daysUntilDelivery <= 3) {
        deliveryStatus = 'due_soon';
    }

    return {
        hasExpectedDate: true,
        expectedDelivery: po.expectedDelivery,
        actualDelivery: po.actualDelivery,
        daysUntilDelivery,
        isOverdue: daysUntilDelivery < 0 && !po.actualDelivery,
        deliveryStatus
    };
}
