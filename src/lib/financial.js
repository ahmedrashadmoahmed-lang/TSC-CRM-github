// Financial Calculations Utility using Decimal.js
import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

export class FinancialCalculator {
  /**
   * Add two numbers with precision
   */
  static add(a, b) {
    return new Decimal(a).plus(b).toNumber();
  }

  /**
   * Subtract two numbers with precision
   */
  static subtract(a, b) {
    return new Decimal(a).minus(b).toNumber();
  }

  /**
   * Multiply two numbers with precision
   */
  static multiply(a, b) {
    return new Decimal(a).times(b).toNumber();
  }

  /**
   * Divide two numbers with precision
   */
  static divide(a, b) {
    if (new Decimal(b).isZero()) {
      throw new Error('Division by zero');
    }
    return new Decimal(a).dividedBy(b).toNumber();
  }

  /**
   * Calculate percentage
   */
  static percentage(value, percent) {
    return new Decimal(value).times(percent).dividedBy(100).toNumber();
  }

  /**
   * Calculate tax amount
   */
  static calculateTax(amount, taxRate) {
    return this.percentage(amount, taxRate);
  }

  /**
   * Calculate total with tax
   */
  static calculateTotalWithTax(amount, taxRate) {
    const tax = this.calculateTax(amount, taxRate);
    return this.add(amount, tax);
  }

  /**
   * Calculate discount
   */
  static calculateDiscount(amount, discountPercent) {
    const discount = this.percentage(amount, discountPercent);
    return this.subtract(amount, discount);
  }

  /**
   * Round to 2 decimal places (for currency)
   */
  static roundCurrency(value) {
    return new Decimal(value).toDecimalPlaces(2).toNumber();
  }

  /**
   * Format as currency
   */
  static formatCurrency(value, currency = 'EGP') {
    const rounded = this.roundCurrency(value);
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
    }).format(rounded);
  }

  /**
   * Calculate line total (quantity * price)
   */
  static calculateLineTotal(quantity, price, discountPercent = 0) {
    const subtotal = this.multiply(quantity, price);
    if (discountPercent > 0) {
      return this.calculateDiscount(subtotal, discountPercent);
    }
    return subtotal;
  }

  /**
   * Calculate invoice total
   */
  static calculateInvoiceTotal(items, taxRate = 0, shippingCost = 0) {
    const subtotal = items.reduce((sum, item) => {
      const lineTotal = this.calculateLineTotal(
        item.quantity,
        item.price,
        item.discountPercent || 0
      );
      return this.add(sum, lineTotal);
    }, 0);

    const tax = this.calculateTax(subtotal, taxRate);
    const total = this.add(this.add(subtotal, tax), shippingCost);

    return {
      subtotal: this.roundCurrency(subtotal),
      tax: this.roundCurrency(tax),
      shippingCost: this.roundCurrency(shippingCost),
      total: this.roundCurrency(total),
    };
  }
}

// Export individual functions for convenience
export const {
  add,
  subtract,
  multiply,
  divide,
  percentage,
  calculateTax,
  calculateTotalWithTax,
  calculateDiscount,
  roundCurrency,
  formatCurrency,
  calculateLineTotal,
  calculateInvoiceTotal,
} = FinancialCalculator;
