import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFExporter {
    constructor(options = {}) {
        this.doc = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        this.isRTL = options.language === 'ar';
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 15;
    }

    // Add header
    addHeader(title, subtitle = null) {
        const x = this.isRTL ? this.pageWidth - this.margin : this.margin;
        const align = this.isRTL ? 'right' : 'left';

        // Title
        this.doc.setFontSize(18);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(title, x, 20, { align });

        // Subtitle
        if (subtitle) {
            this.doc.setFontSize(12);
            this.doc.setFont(undefined, 'normal');
            this.doc.text(subtitle, x, 28, { align });
        }

        // Line
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, 32, this.pageWidth - this.margin, 32);

        return 40; // Return Y position after header
    }

    // Add footer
    addFooter(pageNumber, totalPages) {
        const y = this.pageHeight - 10;
        const text = `${pageNumber} / ${totalPages}`;

        this.doc.setFontSize(10);
        this.doc.text(text, this.pageWidth / 2, y, { align: 'center' });
    }

    // Add table
    addTable(headers, rows, startY = 45) {
        this.doc.autoTable({
            head: [headers],
            body: rows,
            startY,
            margin: { left: this.margin, right: this.margin },
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            didDrawPage: (data) => {
                // Add page number
                const pageCount = this.doc.internal.getNumberOfPages();
                this.addFooter(data.pageNumber, pageCount);
            },
        });
    }

    // Export invoice
    exportInvoice(invoice) {
        // Header
        this.addHeader('فاتورة', `رقم: ${invoice.invoiceNumber}`);

        // Invoice details
        let y = 45;
        const details = [
            ['التاريخ:', new Date(invoice.date).toLocaleDateString('ar-EG')],
            ['العميل:', invoice.customer.name],
            ['مندوب المبيعات:', invoice.salesPerson],
            ['الوصف:', invoice.description],
        ];

        details.forEach(([label, value]) => {
            this.doc.setFontSize(11);
            this.doc.setFont(undefined, 'bold');
            this.doc.text(label, this.pageWidth - this.margin, y, { align: 'right' });

            this.doc.setFont(undefined, 'normal');
            this.doc.text(String(value), this.pageWidth - this.margin - 40, y, { align: 'right' });

            y += 8;
        });

        // Financial details table
        y += 10;
        const financialData = [
            ['قيمة المبيعات', invoice.salesValue.toFixed(2)],
            ['الخصم', invoice.discounts.toFixed(2)],
            ['ضريبة الأرباح', invoice.profitTax.toFixed(2)],
            ['ضريبة القيمة المضافة', invoice.vat.toFixed(2)],
            ['القيمة النهائية', invoice.finalValue.toFixed(2)],
            ['المحصل', invoice.collected.toFixed(2)],
            ['الرصيد', invoice.balance.toFixed(2)],
        ];

        this.addTable(['البيان', 'المبلغ'], financialData, y);

        // Save
        this.doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    }

    // Export report
    exportReport(title, headers, data, summary = null) {
        this.addHeader(title);

        // Add table
        this.addTable(headers, data);

        // Add summary if provided
        if (summary) {
            const finalY = this.doc.lastAutoTable.finalY + 10;

            this.doc.setFontSize(12);
            this.doc.setFont(undefined, 'bold');

            Object.entries(summary).forEach(([key, value], index) => {
                const y = finalY + (index * 8);
                this.doc.text(`${key}: ${value}`, this.pageWidth - this.margin, y, { align: 'right' });
            });
        }

        // Save
        const filename = `${title.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
        this.doc.save(filename);
    }

    // Save document
    save(filename) {
        this.doc.save(filename);
    }
}
