// ==================== نظام الطباعة ====================
const APP_PRINT = (function() {
    'use strict';

    // ==================== طباعة عرض سعر ====================
    function printQuotation(quotationId) {
        const quotations = APP_CORE.getData('quotations') || [];
        const customers = APP_CORE.getData('customers') || [];
        const settings = APP_CORE.getData('settings') || {};
        
        const quotation = quotations.find(q => q.id === quotationId);
        if (!quotation) {
            APP_CORE.showToast('عرض السعر غير موجود', 'error');
            return;
        }
        
        const customer = customers.find(c => c.id === quotation.customerId);
        const company = settings.company || {};
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>عرض سعر - ${quotation.number}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        padding: 20px;
                        direction: rtl;
                    }
                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        border-bottom: 3px solid #3b82f6;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .company-info h1 { 
                        color: #3b82f6; 
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    .company-info p { 
                        color: #666; 
                        margin: 5px 0;
                    }
                    .quotation-info {
                        background: #f3f4f6;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .info-item {
                        display: flex;
                        gap: 10px;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #374151;
                    }
                    .info-value {
                        color: #6b7280;
                    }
                    .details {
                        margin: 30px 0;
                    }
                    .details h3 {
                        color: #1f2937;
                        margin-bottom: 15px;
                        font-size: 18px;
                    }
                    .details-box {
                        background: #f9fafb;
                        padding: 20px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                    }
                    .financial-summary {
                        margin-top: 30px;
                        padding: 20px;
                        background: #eff6ff;
                        border-radius: 8px;
                    }
                    .financial-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 10px 0;
                        font-size: 16px;
                    }
                    .financial-row.total {
                        font-size: 20px;
                        font-weight: bold;
                        color: #3b82f6;
                        border-top: 2px solid #3b82f6;
                        padding-top: 15px;
                        margin-top: 15px;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-info">
                        <h1>${company.name || 'شركة محاسبي برو'}</h1>
                        <p>📧 ${company.email || 'info@accounting-pro.com'}</p>
                        <p>📱 ${company.phone || '+966 50 123 4567'}</p>
                        <p>📍 ${company.address || 'الرياض، المملكة العربية السعودية'}</p>
                    </div>
                    <div style="text-align: left;">
                        <h2 style="color: #3b82f6; font-size: 24px;">عرض سعر</h2>
                        <p style="color: #6b7280; margin-top: 10px;">رقم: <strong>${quotation.number}</strong></p>
                    </div>
                </div>

                <div class="quotation-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">العميل:</span>
                            <span class="info-value">${customer?.name || 'غير محدد'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">التاريخ:</span>
                            <span class="info-value">${new Date(quotation.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">مندوب المبيعات:</span>
                            <span class="info-value">${quotation.salesPerson || 'غير محدد'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">صالح حتى:</span>
                            <span class="info-value">${new Date(quotation.validUntil).toLocaleDateString('ar-SA')}</span>
                        </div>
                    </div>
                </div>

                <div class="details">
                    <h3>تفاصيل العرض</h3>
                    <div class="details-box">
                        <p style="line-height: 1.8;">${quotation.details}</p>
                        ${quotation.suppliers ? `
                            <p style="margin-top: 15px; color: #6b7280;">
                                <strong>الموردين:</strong> ${quotation.suppliers}
                            </p>
                        ` : ''}
                    </div>
                </div>

                <div class="financial-summary">
                    <div class="financial-row">
                        <span>التكلفة:</span>
                        <span>${APP_CORE.formatCurrency(quotation.cost)}</span>
                    </div>
                    <div class="financial-row">
                        <span>الربح:</span>
                        <span style="color: #10b981;">${APP_CORE.formatCurrency(quotation.profit)}</span>
                    </div>
                    <div class="financial-row total">
                        <span>السعر النهائي:</span>
                        <span>${APP_CORE.formatCurrency(quotation.customerPrice)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>شكراً لتعاملكم معنا</p>
                    <p style="margin-top: 5px;">تم الإنشاء بواسطة نظام محاسبي برو</p>
                </div>

                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="
                        padding: 12px 30px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin-left: 10px;
                    ">🖨️ طباعة</button>
                    <button onclick="window.close()" style="
                        padding: 12px 30px;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">إغلاق</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // ==================== Public API ====================
    return {
        printQuotation
    };
})();

// ==================== تحديث APP_PAGES لاستخدام Print ====================
if (typeof APP_PAGES !== 'undefined') {
    APP_PAGES.printQuotation = APP_PRINT.printQuotation;
}