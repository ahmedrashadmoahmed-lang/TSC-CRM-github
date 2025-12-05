// Simple PDF generation helper (placeholder for full implementation)
// In production, use libraries like pdfkit, jspdf, or puppeteer

export async function generateInvoicePDF(invoice, customer) {
    // Mock PDF generation
    const pdfData = {
        filename: `invoice_${invoice.invoiceNumber}.pdf`,
        content: generateInvoiceHTML(invoice, customer),
        size: '245 KB',
        pages: 1
    };

    return pdfData;
}

export async function generateReportPDF(reportData, title) {
    const pdfData = {
        filename: `report_${Date.now()}.pdf`,
        content: generateReportHTML(reportData, title),
        size: '180 KB',
        pages: reportData.pages || 1
    };

    return pdfData;
}

// Generate HTML for invoice (can be converted to PDF)
function generateInvoiceHTML(invoice, customer) {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      direction: rtl;
      padding: 40px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
    }
    .invoice-title {
      font-size: 24px;
      color: #6366f1;
      margin: 20px 0;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
    }
    .info-box {
      width: 45%;
    }
    .info-label {
      font-weight: bold;
      color: #4b5563;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: right;
    }
    th {
      background: #f3f4f6;
      font-weight: bold;
    }
    .total-section {
      text-align: left;
      margin-top: 30px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      font-size: 18px;
    }
    .grand-total {
      background: #6366f1;
      color: white;
      padding: 15px;
      font-size: 22px;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">⚡ Supply Chain ERP</div>
    <div class="invoice-title">فاتورة</div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <p><span class="info-label">رقم الفاتورة:</span> ${invoice.invoiceNumber}</p>
      <p><span class="info-label">التاريخ:</span> ${new Date(invoice.issueDate).toLocaleDateString('ar-EG')}</p>
      <p><span class="info-label">تاريخ الاستحقاق:</span> ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</p>
    </div>
    <div class="info-box">
      <p><span class="info-label">العميل:</span> ${customer.name}</p>
      <p><span class="info-label">العنوان:</span> ${customer.address || 'غير محدد'}</p>
      <p><span class="info-label">الهاتف:</span> ${customer.phone || 'غير محدد'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>البند</th>
        <th>الكمية</th>
        <th>السعر</th>
        <th>الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.description || 'خدمات'}</td>
        <td>1</td>
        <td>${invoice.total.toLocaleString('ar-EG')} جنيه</td>
        <td>${invoice.total.toLocaleString('ar-EG')} جنيه</td>
      </tr>
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <span>الإجمالي الفرعي:</span>
      <span>${invoice.total.toLocaleString('ar-EG')} جنيه</span>
    </div>
    <div class="total-row">
      <span>الضريبة (0%):</span>
      <span>0 جنيه</span>
    </div>
    <div class="total-row grand-total">
      <span>الإجمالي النهائي:</span>
      <span>${invoice.total.toLocaleString('ar-EG')} جنيه</span>
    </div>
  </div>

  <div class="footer">
    <p>شكراً لتعاملكم معنا</p>
    <p>© 2025 Supply Chain ERP. جميع الحقوق محفوظة</p>
  </div>
</body>
</html>
  `;
}

function generateReportHTML(reportData, title) {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      direction: rtl;
      padding: 40px;
    }
    h1 {
      color: #1f2937;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
    }
    .report-date {
      color: #6b7280;
      margin-bottom: 30px;
    }
    .data-section {
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="report-date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
  <div class="data-section">
    ${JSON.stringify(reportData, null, 2)}
  </div>
</body>
</html>
  `;
}
