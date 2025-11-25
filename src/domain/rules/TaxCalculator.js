// Tax Calculator - Business logic for tax calculations
export class TaxCalculator {
    constructor(tenantSettings) {
        this.vatRate = tenantSettings?.defaultVatRate || 14.0;
        this.profitTaxRate = tenantSettings?.profitTaxRate || 2.5;
    }

    // Calculate VAT
    calculateVAT(amount) {
        return Number((amount * (this.vatRate / 100)).toFixed(2));
    }

    // Calculate Profit Tax
    calculateProfitTax(amount) {
        return Number((amount * (this.profitTaxRate / 100)).toFixed(2));
    }

    // Calculate final invoice value
    calculateInvoiceTotal({
        salesValue,
        hasDiscount = false,
        discountAmount = 0,
        discountPercentage = 0,
    }) {
        // Calculate discount
        let finalDiscount = 0;
        if (hasDiscount) {
            if (discountAmount > 0) {
                finalDiscount = discountAmount;
            } else if (discountPercentage > 0) {
                finalDiscount = salesValue * (discountPercentage / 100);
            }
        }

        // Net sales after discount
        const netSales = salesValue - finalDiscount;

        // Calculate taxes
        const profitTax = this.calculateProfitTax(netSales);
        const vat = this.calculateVAT(netSales);

        // Final value
        const finalValue = netSales + profitTax + vat;

        return {
            salesValue: Number(salesValue.toFixed(2)),
            discountAmount: Number(finalDiscount.toFixed(2)),
            netSales: Number(netSales.toFixed(2)),
            profitTax: Number(profitTax.toFixed(2)),
            vat: Number(vat.toFixed(2)),
            finalValue: Number(finalValue.toFixed(2)),
        };
    }

    // Reverse calculate - get sales value from final value
    reverseCalculate(finalValue) {
        // finalValue = netSales * (1 + profitTaxRate/100 + vatRate/100)
        const multiplier = 1 + (this.profitTaxRate / 100) + (this.vatRate / 100);
        const netSales = finalValue / multiplier;
        const profitTax = this.calculateProfitTax(netSales);
        const vat = this.calculateVAT(netSales);

        return {
            salesValue: Number(netSales.toFixed(2)),
            profitTax: Number(profitTax.toFixed(2)),
            vat: Number(vat.toFixed(2)),
            finalValue: Number(finalValue.toFixed(2)),
        };
    }

    // Calculate tax breakdown
    getTaxBreakdown(amount) {
        return {
            amount: Number(amount.toFixed(2)),
            profitTax: {
                rate: this.profitTaxRate,
                amount: this.calculateProfitTax(amount),
            },
            vat: {
                rate: this.vatRate,
                amount: this.calculateVAT(amount),
            },
            total: Number((amount + this.calculateProfitTax(amount) + this.calculateVAT(amount)).toFixed(2)),
        };
    }
}
