// ==================== استيراد البيانات من Google Sheets ====================
const APP_GOOGLE_SHEETS = (function() {
    'use strict';

    // معرفات الملفات من الروابط
    const SHEET_IDS = {
        accounting: '19LODEbd3povVd-yBQFSyVPNCz46GhhEF-LyB0E1eklw',
        secondSheet: '1wEmWS4972AbF_tiR01icPHBgu8uJ2Qyx3UbWu02Mwck'
    };

    // ==================== قراءة البيانات من Google Sheets ====================
    async function importFromGoogleSheets(sheetId, sheetName = 'Sheet1') {
        try {
            // استخدام Google Sheets API بدون مفتاح (للملفات العامة فقط)
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
            
            const response = await fetch(url);
            const text = await response.text();
            
            // تنظيف البيانات (إزالة google.visualization.Query.setResponse)
            const jsonString = text.substring(47, text.length - 2);
            const data = JSON.parse(jsonString);
            
            // تحويل البيانات إلى صيغة قابلة للاستخدام
            return parseGoogleSheetsData(data);
        } catch (error) {
            console.error('خطأ في قراءة Google Sheets:', error);
            APP_CORE.showToast('خطأ في قراءة البيانات من Google Sheets', 'error');
            return null;
        }
    }

    // ==================== تحويل بيانات Google Sheets ====================
    function parseGoogleSheetsData(data) {
        const rows = data.table.rows;
        const cols = data.table.cols;
        
        const headers = cols.map(col => col.label || col.id);
        const result = [];
        
        rows.forEach(row => {
            const rowData = {};
            row.c.forEach((cell, index) => {
                rowData[headers[index]] = cell ? cell.v : null;
            });
            result.push(rowData);
        });
        
        return result;
    }

    // ==================== استيراد جميع البيانات ====================
    async function importAllData() {
        APP_CORE.showToast('جاري استيراد البيانات من Google Sheets...', 'info');
        
        try {
            // استيراد الملف الأول
            const accountingData = await importFromGoogleSheets(SHEET_IDS.accounting);
            if (accountingData) {
                processAccountingData(accountingData);
            }
            
            // استيراد الملف الثاني
            const secondData = await importFromGoogleSheets(SHEET_IDS.secondSheet);
            if (secondData) {
                processSecondSheetData(secondData);
            }
            
            APP_CORE.showToast('تم استيراد البيانات بنجاح! ✅', 'success');
            
        } catch (error) {
            console.error('خطأ في الاستيراد:', error);
            APP_CORE.showToast('فشل استيراد البيانات', 'error');
        }
    }

    // ==================== معالجة بيانات المحاسبة ====================
    function processAccountingData(data) {
        // تحويل البيانات إلى عملاء وعروض أسعار
        const customers = new Map();
        const quotations = [];
        
        data.forEach((row, index) => {
            // تخطي الصف الأول (العناوين)
            if (index === 0) return;
            
            // إضافة العميل
            if (row.Client && !customers.has(row.Client)) {
                customers.set(row.Client, {
                    id: `cust_${generateSafeId(row.Client)}`,
                    name: row.Client,
                    nameEn: row.Client,
                    type: 'company',
                    contactPerson: 'غير محدد',
                    email: `info@${generateSafeId(row.Client)}.com`,
                    phone: '+966501234567',
                    address: 'الإسكندرية، مصر',
                    creditLimit: 100000,
                    currentBalance: 0,
                    salesAgent: row.Sales === 'Heba' ? 'sales_agent1' : row.Sales === 'Doaa' ? 'sales_agent2' : 'sales_agent1',
                    status: 'active',
                    createdAt: row.Date ? new Date(row.Date).toISOString() : new Date().toISOString()
                });
            }
            
            // إضافة عرض السعر
            quotations.push({
                id: `quo_import_${row.ID || index}`,
                number: `QUO-2025-${String(row.ID || index).padStart(4, '0')}`,
                date: row.Date ? new Date(row.Date).toISOString() : new Date().toISOString(),
                customerId: `cust_${generateSafeId(row.Client)}`,
                salesAgent: row.Sales === 'Heba' ? 'sales_agent1' : 'sales_agent2',
                salesPerson: row.Sales || 'غير محدد',
                details: row.Details || 'غير محدد',
                suppliers: row['name of suppliers'] || '',
                cost: parseFloat(row.Cost) || 0,
                customerPrice: parseFloat(row.Customers) || 0,
                profit: parseFloat(row.Profits) || 0,
                status: getStatusFromAvailability(row.Availability, row.Comment),
                availability: row.Availability || 'No',
                comment: row.Comment || '',
                validUntil: row.Date ? new Date(new Date(row.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString()
            });
        });
        
        // حفظ البيانات
        const existingCustomers = APP_CORE.getData('customers') || [];
        const existingQuotations = APP_CORE.getData('quotations') || [];
        
        const allCustomers = [...existingCustomers, ...Array.from(customers.values())];
        const allQuotations = [...existingQuotations, ...quotations];
        
        APP_CORE.setData('customers', allCustomers);
        APP_CORE.setData('quotations', allQuotations);
        
        console.log(`✅ تم استيراد ${customers.size} عميل و ${quotations.length} عرض سعر`);
    }

    // ==================== معالجة الملف الثاني ====================
    function processSecondSheetData(data) {
        // معالجة حسب نوع البيانات
        console.log('بيانات الملف الثاني:', data);
        // يمكن إضافة معالجة مخصصة حسب محتوى الملف
    }

    // ==================== دوال مساعدة ====================
    function generateSafeId(text) {
        return text ? text.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]+/g, '')
            .substring(0, 50) : 'unknown';
    }

    function getStatusFromAvailability(availability, comment) {
        if (comment && comment.toLowerCase().includes('closed')) return 'closed';
        if (comment && comment.toLowerCase().includes('po')) return 'po';
        if (availability === 'Yes') return 'pending';
        if (availability === 'No') return 'closed';
        return 'draft';
    }

    // ==================== Public API ====================
    return {
        importAllData,
        importFromGoogleSheets
    };
})();