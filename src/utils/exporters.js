export * from './pdfExporter';
export * from './excelExporter';

// Helper functions for backward compatibility
export function exportToPDF(data, filename, options = {}) {
    const { PDFExporter } = require('./pdfExporter');
    const exporter = new PDFExporter(options);

    if (data.type === 'invoice') {
        exporter.exportInvoice(data);
    } else if (data.type === 'report') {
        exporter.exportReport(data.title, data.headers, data.rows, data.summary);
    } else {
        exporter.save(filename || 'document.pdf');
    }
}

export function exportToExcel(data, filename, options = {}) {
    const { ExcelExporter } = require('./excelExporter');

    if (Array.isArray(data)) {
        ExcelExporter.export(data, filename || `export-${Date.now()}`, options);
    } else if (data.type === 'invoices') {
        ExcelExporter.exportInvoices(data.items);
    } else if (data.type === 'customers') {
        ExcelExporter.exportCustomers(data.items);
    } else if (data.type === 'inventory') {
        ExcelExporter.exportInventory(data.items);
    } else {
        ExcelExporter.export(data, filename || `export-${Date.now()}`, options);
    }
}

