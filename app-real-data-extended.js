// ==================== إضافة باقي البيانات الحقيقية من CSV ====================
const APP_REAL_DATA_EXTENDED = (function() {
    'use strict';

    // ==================== المزيد من عروض الأسعار ====================
    const ADDITIONAL_QUOTATIONS = [
        {
            id: 'quo_011',
            number: 'QUO-2025-011',
            date: '2025-01-20T00:00:00Z',
            customerId: 'cust_alexfert',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Monitor',
            suppliers: 'Compuroots',
            cost: 4824.56,
            customerPrice: 5162.28,
            profit: 337.72,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-19T00:00:00Z'
        },
        {
            id: 'quo_012',
            number: 'QUO-2025-012',
            date: '2025-01-16T00:00:00Z',
            customerId: 'cust_memphis_pharma',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Solution Cameras',
            suppliers: 'Hiikvision Egypt - بكر وسط البلد',
            cost: 41320.63,
            customerPrice: 51888.51,
            profit: 10567.88,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-15T00:00:00Z'
        },
        {
            id: 'quo_013',
            number: 'QUO-2025-013',
            date: '2025-01-20T00:00:00Z',
            customerId: 'cust_electricity_alex',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Solution Cameras',
            suppliers: 'Safty Source - Peta Server - Elmasa - Speed - ATS',
            cost: 203842.11,
            customerPrice: 224226.32,
            profit: 20384.21,
            status: 'po',
            availability: 'No',
            validUntil: '2025-02-19T00:00:00Z'
        },
        {
            id: 'quo_014',
            number: 'QUO-2025-014',
            date: '2025-01-20T00:00:00Z',
            customerId: 'cust_sporting_club',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Toner - Used Monitor',
            suppliers: 'Ahbark- Kimo- Shiko- King- Elmagd',
            cost: 17739.47,
            customerPrice: 19968.42,
            profit: 2228.95,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-19T00:00:00Z'
        },
        {
            id: 'quo_015',
            number: 'QUO-2025-015',
            date: '2025-01-26T00:00:00Z',
            customerId: 'cust_oil_mixing',
            salesAgent: 'sales_agent2',
            salesPerson: 'Heba',
            details: 'Motherboard - Gaming Case- Keyboard & Mouse',
            suppliers: 'New Virsion - Kimo - El Badr',
            cost: 132240.00,
            customerPrice: 137080.00,
            profit: 4840.00,
            status: 'po',
            availability: 'No',
            validUntil: '2025-02-25T00:00:00Z'
        },
        {
            id: 'quo_016',
            number: 'QUO-2025-016',
            date: '2025-01-22T00:00:00Z',
            customerId: 'cust_vaccine_valley',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'hp Laptop',
            suppliers: 'Mest - Compu Science - East Asia',
            cost: 28728.07,
            customerPrice: 29589.91,
            profit: 861.84,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-21T00:00:00Z'
        },
        {
            id: 'quo_017',
            number: 'QUO-2025-017',
            date: '2025-01-23T00:00:00Z',
            customerId: 'cust_madar_group',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Toner - Telephon Panasonic',
            suppliers: 'United - Rahma - Fayka -Kimo - Elwy Telecom',
            cost: 22473.68,
            customerPrice: 24500.00,
            profit: 2026.32,
            status: 'po',
            availability: 'No',
            validUntil: '2025-02-22T00:00:00Z'
        },
        {
            id: 'quo_018',
            number: 'QUO-2025-018',
            date: '2025-01-22T00:00:00Z',
            customerId: 'cust_sakr_group',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Monitor - PC - Laptop',
            suppliers: 'Mest- East Asia',
            cost: 50469.30,
            customerPrice: 52250.35,
            profit: 1781.05,
            status: 'po',
            availability: 'No',
            validUntil: '2025-02-21T00:00:00Z'
        },
        {
            id: 'quo_019',
            number: 'QUO-2025-019',
            date: '2025-01-23T00:00:00Z',
            customerId: 'cust_smouha_club',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Solution Cameras',
            suppliers: 'Carnival - Peta Server - Egy Tech - Kimo - Speed',
            cost: 313663.86,
            customerPrice: 330169.94,
            profit: 16506.08,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-22T00:00:00Z'
        },
        {
            id: 'quo_020',
            number: 'QUO-2025-020',
            date: '2025-01-26T00:00:00Z',
            customerId: 'cust_pua',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Keyboard & Mouse - Power Supply',
            suppliers: 'Technology Vally - East Asia - Elhamd - Quality',
            cost: 192982.46,
            customerPrice: 194912.28,
            profit: 1929.82,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-25T00:00:00Z'
        }
    ];

    // ==================== دالة تحميل البيانات الإضافية ====================
    function loadExtendedData() {
        const existingQuotations = APP_CORE.getData('quotations') || [];
        const mergedQuotations = [...existingQuotations];
        
        ADDITIONAL_QUOTATIONS.forEach(newQuotation => {
            const exists = mergedQuotations.find(q => q.id === newQuotation.id);
            if (!exists) {
                mergedQuotations.push(newQuotation);
            }
        });
        
        APP_CORE.setData('quotations', mergedQuotations);
        
        APP_CORE.showToast(`تم إضافة ${ADDITIONAL_QUOTATIONS.length} عرض سعر إضافي ✅`, 'success');
        
        return {
            addedQuotations: ADDITIONAL_QUOTATIONS.length,
            totalQuotations: mergedQuotations.length
        };
    }

    return {
        loadExtendedData,
        ADDITIONAL_QUOTATIONS
    };
})();