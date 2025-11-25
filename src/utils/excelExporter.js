import { utils, writeFile } from 'xlsx';

export class ExcelExporter {
    // Export data to Excel
    static export(data, filename, options = {}) {
        const {
            sheetName = 'Sheet1',
            headers = null,
            columnWidths = null,
        } = options;

        // Create workbook
        const wb = utils.book_new();

        // Convert data to worksheet
        let ws;
        if (headers) {
            ws = utils.json_to_sheet(data, { header: headers });
        } else {
            ws = utils.json_to_sheet(data);
        }

        // Set column widths
        if (columnWidths) {
            ws['!cols'] = columnWidths.map(width => ({ wch: width }));
        }

        // Add worksheet to workbook
        utils.book_append_sheet(wb, ws, sheetName);

        // Generate file
        writeFile(wb, `${filename}.xlsx`);
    }

    // Export invoices
    static exportInvoices(invoices) {
        const data = invoices.map(inv => ({
            'رقم الفاتورة': inv.invoiceNumber,
            'التاريخ': new Date(inv.date).toLocaleDateString('ar-EG'),
            'العميل': inv.customer.name,
            'مندوب المبيعات': inv.salesPerson,
            'قيمة المبيعات': inv.salesValue,
            'الخصم': inv.discounts,
            'ضريبة الأرباح': inv.profitTax,
            'ضريبة القيمة المضافة': inv.vat,
            'القيمة النهائية': inv.finalValue,
            'المحصل': inv.collected,
            'الرصيد': inv.balance,
            'الحالة': inv.status,
        }));

        this.export(data, `invoices-${Date.now()}`, {
            sheetName: 'الفواتير',
            columnWidths: [15, 12, 20, 15, 12, 10, 12, 12, 12, 12, 12, 10],
        });
    }

    // Export customers
    static exportCustomers(customers) {
        const data = customers.map(cust => ({
            'الاسم': cust.name,
            'البريد الإلكتروني': cust.email || '',
            'الهاتف': cust.phone || '',
            'العنوان': cust.address || '',
            'النوع': cust.type,
            'عدد الفواتير': cust.totalInvoices,
            'إجمالي القيمة': cust.totalValue,
            'الحالة': cust.status,
        }));

        this.export(data, `customers-${Date.now()}`, {
            sheetName: 'العملاء',
            columnWidths: [20, 25, 15, 30, 12, 12, 15, 10],
        });
    }

    // Export inventory
    static exportInventory(inventory) {
        const data = inventory.map(item => ({
            'المنتج': item.product.name,
            'رمز المنتج': item.product.sku,
            'الفئة': item.product.category,
            'المخزون الحالي': item.stock,
            'الحد الأدنى': item.product.minStock,
            'الحالة': item.status,
            'التكلفة': item.product.cost,
            'السعر': item.product.price,
        }));

        this.export(data, `inventory-${Date.now()}`, {
            sheetName: 'المخزون',
            columnWidths: [25, 15, 15, 12, 12, 10, 12, 12],
        });
    }

    // Export financial report
    static exportFinancialReport(report, type) {
        let data = [];
        let sheetName = '';

        if (type === 'trial-balance') {
            sheetName = 'ميزان المراجعة';
            data = report.balances.map(item => ({
                'رمز الحساب': item.account.code,
                'اسم الحساب': item.account.nameAr,
                'النوع': item.account.type,
                'مدين': item.debit || 0,
                'دائن': item.credit || 0,
            }));

            // Add totals row
            data.push({
                'رمز الحساب': '',
                'اسم الحساب': 'الإجمالي',
                'النوع': '',
                'مدين': report.totalDebits,
                'دائن': report.totalCredits,
            });
        } else if (type === 'income-statement') {
            sheetName = 'قائمة الدخل';

            // Revenues
            data.push({ 'البيان': 'الإيرادات', 'المبلغ': '' });
            report.revenues.forEach(item => {
                data.push({
                    'البيان': `  ${item.account.nameAr}`,
                    'المبلغ': item.amount,
                });
            });
            data.push({ 'البيان': 'إجمالي الإيرادات', 'المبلغ': report.totalRevenue });

            // Expenses
            data.push({ 'البيان': '', 'المبلغ': '' });
            data.push({ 'البيان': 'المصروفات', 'المبلغ': '' });
            report.expenses.forEach(item => {
                data.push({
                    'البيان': `  ${item.account.nameAr}`,
                    'المبلغ': item.amount,
                });
            });
            data.push({ 'البيان': 'إجمالي المصروفات', 'المبلغ': report.totalExpenses });

            // Net income
            data.push({ 'البيان': '', 'المبلغ': '' });
            data.push({ 'البيان': 'صافي الدخل', 'المبلغ': report.netIncome });
        }

        this.export(data, `${type}-${Date.now()}`, {
            sheetName,
            columnWidths: [30, 15],
        });
    }

    // Export with multiple sheets
    static exportMultiSheet(sheets, filename) {
        const wb = utils.book_new();

        sheets.forEach(({ name, data, headers, columnWidths }) => {
            let ws;
            if (headers) {
                ws = utils.json_to_sheet(data, { header: headers });
            } else {
                ws = utils.json_to_sheet(data);
            }

            if (columnWidths) {
                ws['!cols'] = columnWidths.map(width => ({ wch: width }));
            }

            utils.book_append_sheet(wb, ws, name);
        });

        writeFile(wb, `${filename}.xlsx`);
    }
}
