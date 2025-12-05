/**
 * Landed Cost Calculator
 * Calculates total cost including all fees and duties
 */

export function calculateLandedCost(itemData) {
    const {
        quantity,
        unitPrice,
        shippingCostPerUnit = 0,
        taxRate = 0,
        customsDutyRate = 0,
        insuranceRate = 0,
        handlingFee = 0,
        otherFees = 0
    } = itemData;

    // Base cost
    const basePrice = quantity * unitPrice;

    // Shipping
    const shippingCost = quantity * shippingCostPerUnit;

    // Insurance (usually % of base price)
    const insuranceCost = basePrice * (insuranceRate / 100);

    // Customs duty (% of base price + shipping)
    const dutiableValue = basePrice + shippingCost;
    const customsDuty = dutiableValue * (customsDutyRate / 100);

    // Tax (% of base price + shipping + duty)
    const taxableValue = basePrice + shippingCost + customsDuty;
    const taxAmount = taxableValue * (taxRate / 100);

    // Total landed cost
    const totalLandedCost = basePrice + shippingCost + insuranceCost + customsDuty + taxAmount + handlingFee + otherFees;

    // Per unit landed cost
    const landedCostPerUnit = totalLandedCost / quantity;

    // Markup percentage
    const markupPercentage = ((totalLandedCost - basePrice) / basePrice) * 100;

    return {
        basePrice,
        shippingCost,
        insuranceCost,
        customsDuty,
        taxAmount,
        handlingFee,
        otherFees,
        totalLandedCost,
        landedCostPerUnit,
        markupPercentage: Math.round(markupPercentage * 100) / 100,
        breakdown: {
            base: basePrice,
            shipping: shippingCost,
            insurance: insuranceCost,
            customs: customsDuty,
            tax: taxAmount,
            handling: handlingFee,
            other: otherFees
        },
        percentages: {
            shipping: (shippingCost / totalLandedCost) * 100,
            insurance: (insuranceCost / totalLandedCost) * 100,
            customs: (customsDuty / totalLandedCost) * 100,
            tax: (taxAmount / totalLandedCost) * 100,
            fees: ((handlingFee + otherFees) / totalLandedCost) * 100
        }
    };
}

/**
 * Calculate landed cost for entire PO
 */
export function calculatePOLandedCost(poData) {
    const {
        items = [],
        shippingCost = 0,
        insuranceCost = 0,
        customsDuty = 0,
        taxRate = 0,
        handlingFee = 0,
        otherFees = 0
    } = poData;

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Distribute shipping cost proportionally
    const itemsWithLandedCost = items.map(item => {
        const itemValue = item.quantity * item.unitPrice;
        const proportion = itemValue / subtotal;

        const itemShipping = shippingCost * proportion;
        const itemInsurance = insuranceCost * proportion;
        const itemCustoms = customsDuty * proportion;
        const itemTax = (itemValue + itemShipping + itemCustoms) * (taxRate / 100);
        const itemHandling = handlingFee * proportion;
        const itemOther = otherFees * proportion;

        const itemLandedCost = itemValue + itemShipping + itemInsurance + itemCustoms + itemTax + itemHandling + itemOther;

        return {
            ...item,
            landedCost: itemLandedCost,
            landedCostPerUnit: itemLandedCost / item.quantity,
            costBreakdown: {
                base: itemValue,
                shipping: itemShipping,
                insurance: itemInsurance,
                customs: itemCustoms,
                tax: itemTax,
                handling: itemHandling,
                other: itemOther
            }
        };
    });

    const totalLandedCost = subtotal + shippingCost + insuranceCost + customsDuty + (subtotal * (taxRate / 100)) + handlingFee + otherFees;

    return {
        items: itemsWithLandedCost,
        summary: {
            subtotal,
            shippingCost,
            insuranceCost,
            customsDuty,
            taxAmount: subtotal * (taxRate / 100),
            handlingFee,
            otherFees,
            totalLandedCost,
            additionalCosts: totalLandedCost - subtotal,
            additionalCostsPercentage: ((totalLandedCost - subtotal) / subtotal) * 100
        }
    };
}

/**
 * Compare landed costs from different suppliers
 */
export function compareLandedCosts(quotes) {
    return quotes.map(quote => {
        const landedCost = calculatePOLandedCost(quote);
        return {
            supplierId: quote.supplierId,
            supplierName: quote.supplierName,
            basePrice: landedCost.summary.subtotal,
            totalLandedCost: landedCost.summary.totalLandedCost,
            additionalCosts: landedCost.summary.additionalCosts,
            additionalCostsPercentage: landedCost.summary.additionalCostsPercentage,
            breakdown: landedCost.summary
        };
    }).sort((a, b) => a.totalLandedCost - b.totalLandedCost);
}

/**
 * Calculate break-even price considering landed cost
 */
export function calculateBreakEven(landedCostData, desiredMargin = 20) {
    const { landedCostPerUnit } = landedCostData;

    const breakEvenPrice = landedCostPerUnit;
    const sellingPrice = landedCostPerUnit * (1 + desiredMargin / 100);
    const profit = sellingPrice - landedCostPerUnit;
    const profitMargin = (profit / sellingPrice) * 100;

    return {
        landedCostPerUnit,
        breakEvenPrice,
        desiredMargin,
        sellingPrice,
        profit,
        profitMargin: Math.round(profitMargin * 100) / 100
    };
}
