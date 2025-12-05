// Web Worker for Heavy Calculations
import { wrap } from 'comlink';

// Worker for financial calculations
export function createFinancialWorker() {
  const worker = new Worker(new URL('../workers/financial.worker.js', import.meta.url), {
    type: 'module',
  });
  return wrap(worker);
}

// Example usage:
// const worker = createFinancialWorker();
// const result = await worker.calculateInvoiceTotal(items, taxRate, shipping);
