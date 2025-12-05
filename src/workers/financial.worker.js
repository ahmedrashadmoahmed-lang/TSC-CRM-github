// Financial Calculations Worker
import { expose } from 'comlink';
import { FinancialCalculator } from '../lib/financial';

const api = {
  calculateInvoiceTotal: (items, taxRate, shippingCost) => {
    return FinancialCalculator.calculateInvoiceTotal(items, taxRate, shippingCost);
  },
  calculateLineTotal: (quantity, price, discountPercent) => {
    return FinancialCalculator.calculateLineTotal(quantity, price, discountPercent);
  },
  calculateTax: (amount, taxRate) => {
    return FinancialCalculator.calculateTax(amount, taxRate);
  },
  formatCurrency: (value, currency) => {
    return FinancialCalculator.formatCurrency(value, currency);
  },
};

expose(api);
