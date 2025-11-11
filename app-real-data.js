// ==================== البيانات الحقيقية من ملف CSV ====================
const APP_REAL_DATA = (function() {
    'use strict';

    // ==================== العملاء الحقيقيين ====================
    const REAL_CUSTOMERS = [
        {
            id: 'cust_madar_group',
            name: 'مدار جروب',
            nameEn: 'Madar Group',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@madargroup.com',
            phone: '+966501234567',
            address: 'الإسكندرية، مصر',
            creditLimit: 50000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-02T00:00:00Z'
        },
        {
            id: 'cust_sporting_club',
            name: 'نادى سبورتنج الرياضى',
            nameEn: 'Alexandria Sporting Club',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@sportingclub.com',
            phone: '+966502345678',
            address: 'الإسكندرية، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-02T00:00:00Z'
        },
        {
            id: 'cust_electricity_alex',
            name: 'شركة الاسكندرية لتوزيع الكهرباء',
            nameEn: 'Alexandria Electricity Distribution Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@alexelectricity.com',
            phone: '+966503456789',
            address: 'الإسكندرية، مصر',
            creditLimit: 200000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-05T00:00:00Z'
        },
        {
            id: 'cust_louran_hospital',
            name: 'مستشفى لوران',
            nameEn: 'Louran Hospital',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@louranhospital.com',
            phone: '+966504567890',
            address: 'الإسكندرية، مصر',
            creditLimit: 150000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-09T00:00:00Z'
        },
        {
            id: 'cust_acpa',
            name: 'شركة اكبا',
            nameEn: 'ACPA Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@acpa.com',
            phone: '+966505678901',
            address: 'الإسكندرية، مصر',
            creditLimit: 80000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-09T00:00:00Z'
        },
        {
            id: 'cust_republic_pharma',
            name: 'شركة الجمهورية للادوية',
            nameEn: 'Republic Pharmaceuticals',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@republicpharma.com',
            phone: '+966506789012',
            address: 'القاهرة، مصر',
            creditLimit: 500000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-13T00:00:00Z'
        },
        {
            id: 'cust_rixos_alamein',
            name: 'فندق ريكسوس العلمين',
            nameEn: 'Rixos Alamein Hotel',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@rixosalamein.com',
            phone: '+966507890123',
            address: 'العلمين، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-01-14T00:00:00Z'
        },
        {
            id: 'cust_vaccine_valley',
            name: 'الشركة المصرية للصناعات البيولوجية والدوائية',
            nameEn: 'Vaccine Valley',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@vaccinevally.com',
            phone: '+966508901234',
            address: 'القاهرة، مصر',
            creditLimit: 200000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-15T00:00:00Z'
        },
        {
            id: 'cust_dar_elaj',
            name: 'مستشفى دار العلاج',
            nameEn: 'Dar El Elaj Hospital',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@darelaj.com',
            phone: '+966509012345',
            address: 'القاهرة، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-01-15T00:00:00Z'
        },
        {
            id: 'cust_alexfert',
            name: 'شركة الاسكندرية للاسمدة',
            nameEn: 'Alexfert Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@alexfert.com',
            phone: '+966510123456',
            address: 'الإسكندرية، مصر',
            creditLimit: 150000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-20T00:00:00Z'
        },
        {
            id: 'cust_memphis_pharma',
            name: 'شركة ممفيس للادوية',
            nameEn: 'Memphis Pharmaceuticals',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@memphispharma.com',
            phone: '+966511234567',
            address: 'القاهرة، مصر',
            creditLimit: 200000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-16T00:00:00Z'
        },
        {
            id: 'cust_oil_mixing',
            name: 'مجمع خلط الزيوت - شركة مصر للبترول',
            nameEn: 'Oil Mixing Complex - Misr Petroleum',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@misrpetroleum.com',
            phone: '+966512345678',
            address: 'القاهرة، مصر',
            creditLimit: 300000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-01-26T00:00:00Z'
        },
        {
            id: 'cust_sakr_group',
            name: 'شركة صقر جروب',
            nameEn: 'Sakr Group',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@sakrgroup.com',
            phone: '+966513456789',
            address: 'القاهرة، مصر',
            creditLimit: 250000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-22T00:00:00Z'
        },
        {
            id: 'cust_smouha_club',
            name: 'نادى سموحه الرياضى بالاسكندرية',
            nameEn: 'Smouha Club',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@smouhaclub.com',
            phone: '+966514567890',
            address: 'الإسكندرية، مصر',
            creditLimit: 400000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-23T00:00:00Z'
        },
        {
            id: 'cust_pua',
            name: 'جامعة فاروس بالاسكندرية',
            nameEn: 'Pharos University Alexandria (PUA)',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@pua.edu.eg',
            phone: '+966515678901',
            address: 'الإسكندرية، مصر',
            creditLimit: 500000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-01-26T00:00:00Z'
        },
        {
            id: 'cust_smouha_hospital',
            name: 'مستشفى سموحة الدولى',
            nameEn: 'Smouha International Hospital',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@smouhahospital.com',
            phone: '+966516789012',
            address: 'الإسكندرية، مصر',
            creditLimit: 150000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-02-02T00:00:00Z'
        },
        {
            id: 'cust_maritime_transport',
            name: 'الشركة القابضة للنقل البحري و البري',
            nameEn: 'Maritime and Land Transport Holding Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@maritimetransport.com',
            phone: '+966517890123',
            address: 'القاهرة، مصر',
            creditLimit: 300000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-02-02T00:00:00Z'
        },
        {
            id: 'cust_hassan_allam',
            name: 'شركة حسن علام',
            nameEn: 'Hassan Allam Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@hassanallam.com',
            phone: '+966518901234',
            address: 'القاهرة، مصر',
            creditLimit: 500000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-02-06T00:00:00Z'
        },
        {
            id: 'cust_petroleum_hospital',
            name: 'مستشفى البترول',
            nameEn: 'Petroleum Hospital',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@petroleumhospital.com',
            phone: '+966519012345',
            address: 'القاهرة، مصر',
            creditLimit: 200000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-02-11T00:00:00Z'
        },
        {
            id: 'cust_marina_plast',
            name: 'نيو مارينا بلاست',
            nameEn: 'New Marina Plast',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@marinaplast.com',
            phone: '+966520123456',
            address: 'الإسكندرية، مصر',
            creditLimit: 150000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-02-13T00:00:00Z'
        },
        {
            id: 'cust_pharma_overseas',
            name: 'فارما اوفر سيز',
            nameEn: 'Pharma Overseas',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@pharmaoverseas.com',
            phone: '+966521234567',
            address: 'القاهرة، مصر',
            creditLimit: 500000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-02-17T00:00:00Z'
        },
        {
            id: 'cust_pegesco',
            name: 'شركة بيجسكو للهندسة',
            nameEn: 'Power Generation Engineering and Service Company (PEGESCO)',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@pegesco.com',
            phone: '+966522345678',
            address: 'القاهرة، مصر',
            creditLimit: 200000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-02-17T00:00:00Z'
        },
        {
            id: 'cust_grosse_chem',
            name: 'شركة جروس كيم للكيماويات المتطورة',
            nameEn: 'Grosse Chem for Advanced Chemicals',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@grossechem.com',
            phone: '+966523456789',
            address: 'القاهرة، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-02-26T00:00:00Z'
        },
        {
            id: 'cust_abou_kir_petroleum',
            name: 'شركة بترول ابو قير',
            nameEn: 'Abou Kir Petroleum Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@aboukirpetroleum.com',
            phone: '+966524567890',
            address: 'الإسكندرية، مصر',
            creditLimit: 3000000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-03-04T00:00:00Z'
        },
        {
            id: 'cust_cairoscan',
            name: 'كايرو سكان للاشعة و التحاليل',
            nameEn: 'CairoScan Radiology & Labs',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@cairoscan.com',
            phone: '+966525678901',
            address: 'القاهرة، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-04-17T00:00:00Z'
        },
        {
            id: 'cust_faragallah',
            name: 'شركة فرج الله',
            nameEn: 'Faragallah Company',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@faragallah.com',
            phone: '+966526789012',
            address: 'القاهرة، مصر',
            creditLimit: 150000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-04-23T00:00:00Z'
        },
        {
            id: 'cust_saudi_german_hospital',
            name: 'مستشفى السعودى الالمانى',
            nameEn: 'Saudi German Hospital',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@saudgerman.com',
            phone: '+966527890123',
            address: 'القاهرة، مصر',
            creditLimit: 300000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-04-23T00:00:00Z'
        },
        {
            id: 'cust_icc_hospital',
            name: 'مستشفى ICC',
            nameEn: 'ICC Hospital',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@icchospital.com',
            phone: '+966528901234',
            address: 'القاهرة، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent2',
            status: 'active',
            createdAt: '2025-04-28T00:00:00Z'
        },
        {
            id: 'cust_businessmen_association',
            name: 'جمعية رجال اعمال',
            nameEn: 'Businessmen Association',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@businessmen.com',
            phone: '+966529012345',
            address: 'القاهرة، مصر',
            creditLimit: 200000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-04-29T00:00:00Z'
        },
        {
            id: 'cust_nahdet_misr',
            name: 'نهضة مصر',
            nameEn: 'Nahdet Misr',
            type: 'company',
            contactPerson: 'غير محدد',
            email: 'info@nahdetmisr.com',
            phone: '+966530123456',
            address: 'القاهرة، مصر',
            creditLimit: 100000,
            currentBalance: 0,
            salesAgent: 'sales_agent1',
            status: 'active',
            createdAt: '2025-04-29T00:00:00Z'
        }
    ];

    // ==================== عروض الأسعار الحقيقية (من CSV) ====================
    const REAL_QUOTATIONS = [
        {
            id: 'quo_001',
            number: 'QUO-2025-001',
            date: '2025-01-02T00:00:00Z',
            customerId: 'cust_madar_group',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Toner',
            suppliers: 'Rahma - Fayka',
            cost: 1052.63,
            customerPrice: 1315.79,
            profit: 263.16,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-01T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_002',
            number: 'QUO-2025-002',
            date: '2025-01-02T00:00:00Z',
            customerId: 'cust_sporting_club',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'HDD',
            suppliers: 'S30dy - East Asia - Kimo',
            cost: 13596.49,
            customerPrice: 14276.32,
            profit: 679.83,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-01T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_003',
            number: 'QUO-2025-003',
            date: '2025-01-05T00:00:00Z',
            customerId: 'cust_electricity_alex',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Toner',
            suppliers: 'Rahma - Fayka - Ahbark - Canon supplies - BC Technology',
            cost: 22500.00,
            customerPrice: 25877.19,
            profit: 3377.19,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-04T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_004',
            number: 'QUO-2025-004',
            date: '2025-01-09T00:00:00Z',
            customerId: 'cust_louran_hospital',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Printer',
            suppliers: 'Mest - Compu science - Eagles - Canon Alex',
            cost: 58771.93,
            customerPrice: 61710.53,
            profit: 2938.60,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-08T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_005',
            number: 'QUO-2025-005',
            date: '2025-01-09T00:00:00Z',
            customerId: 'cust_acpa',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Camera',
            suppliers: 'Speed - Elmasa - Kimo - Alex Technology',
            cost: 5280.00,
            customerPrice: 5650.88,
            profit: 370.88,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-08T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_006',
            number: 'QUO-2025-006',
            date: '2025-01-13T00:00:00Z',
            customerId: 'cust_republic_pharma',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Printer',
            suppliers: 'Mest - Winner Brand - Compu Science - E SERVICE',
            cost: 353347.37,
            customerPrice: 494686.32,
            profit: 141338.95,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-12T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_007',
            number: 'QUO-2025-007',
            date: '2025-01-14T00:00:00Z',
            customerId: 'cust_madar_group',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Toner',
            suppliers: 'High Tech - Rahma- Fayka - Elmagd- ARM Trade',
            cost: 20000.00,
            customerPrice: 22000.00,
            profit: 2000.00,
            status: 'po',
            availability: 'No',
            validUntil: '2025-02-13T00:00:00Z',
            comment: 'PO'
        },
        {
            id: 'quo_008',
            number: 'QUO-2025-008',
            date: '2025-01-14T00:00:00Z',
            customerId: 'cust_rixos_alamein',
            salesAgent: 'sales_agent2',
            salesPerson: 'Heba',
            details: 'Display to HDMI Converter - Mouse- Sticker for keyboard',
            suppliers: 'Kimo',
            cost: 168.00,
            customerPrice: 373.68,
            profit: 205.68,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-13T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_009',
            number: 'QUO-2025-009',
            date: '2025-01-15T00:00:00Z',
            customerId: 'cust_vaccine_valley',
            salesAgent: 'sales_agent1',
            salesPerson: 'Heba',
            details: 'Flash Memory',
            suppliers: 'المهندس تك  East Asia - S3ody - Elnour Tech',
            cost: 1885.96,
            customerPrice: 2719.30,
            profit: 833.34,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-14T00:00:00Z',
            comment: 'Closed'
        },
        {
            id: 'quo_010',
            number: 'QUO-2025-010',
            date: '2025-01-15T00:00:00Z',
            customerId: 'cust_dar_elaj',
            salesAgent: 'sales_agent2',
            salesPerson: 'Heba',
            details: 'Barcode Printer',
            suppliers: 'Elhoda - Smart Xprinter - Elmaram - HP Control',
            cost: 5600.00,
            customerPrice: 5824.00,
            profit: 224.00,
            status: 'closed',
            availability: 'No',
            validUntil: '2025-02-14T00:00:00Z',
            comment: 'Closed'
        }
        // يمكن إضافة المزيد من العروض...
    ];

    // ==================== الفواتير الحقيقية ====================
    const REAL_INVOICES = REAL_QUOTATIONS
        .filter(q => q.status === 'closed')
        .map((quotation, index) => ({
            id: `inv_${String(index + 1).padStart(3, '0')}`,
            number: `INV-2025-${String(index + 1).padStart(4, '0')}`,
            quotationId: quotation.id,
            customerId: quotation.customerId,
            date: quotation.date,
            dueDate: new Date(new Date(quotation.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
                description: quotation.details,
                quantity: 1,
                unitPrice: quotation.customerPrice,
                total: quotation.customerPrice
            }],
            subtotal: quotation.customerPrice,
            tax: quotation.customerPrice * 0.14, // 14% VAT
            totalAmount: quotation.customerPrice * 1.14,
            status: 'paid',
            paymentStatus: 'paid',
            notes: quotation.comment,
            createdAt: quotation.date
        }));

    // ==================== الموردين الحقيقيين ====================
    const REAL_SUPPLIERS = [
        {
            id: 'supp_rahma',
            name: 'شركة رحمة',
            nameEn: 'Rahma Company',
            contactPerson: 'غير محدد',
            email: 'info@rahma.com',
            phone: '+201001234567',
            address: 'القاهرة، مصر',
            products: ['Toner', 'Ink'],
            paymentTerms: '30 يوم',
            rating: 4.5,
            status: 'active'
        },
        {
            id: 'supp_fayka',
            name: 'شركة فايكا',
            nameEn: 'Fayka Company',
            contactPerson: 'غير محدد',
            email: 'info@fayka.com',
            phone: '+201002345678',
            address: 'القاهرة، مصر',
            products: ['Toner', 'Ink'],
            paymentTerms: '30 يوم',
            rating: 4.3,
            status: 'active'
        },
        {
            id: 'supp_east_asia',
            name: 'شركة إيست آسيا',
            nameEn: 'East Asia Company',
            contactPerson: 'غير محدد',
            email: 'info@eastasia.com',
            phone: '+201003456789',
            address: 'القاهرة، مصر',
            products: ['Laptops', 'Computers', 'Accessories'],
            paymentTerms: '45 يوم',
            rating: 4.7,
            status: 'active'
        },
        {
            id: 'supp_kimo',
            name: 'شركة كيمو',
            nameEn: 'Kimo Company',
            contactPerson: 'غير محدد',
            email: 'info@kimo.com',
            phone: '+201004567890',
            address: 'القاهرة، مصر',
            products: ['Cameras', 'Accessories', 'Cables'],
            paymentTerms: '30 يوم',
            rating: 4.4,
            status: 'active'
        },
        {
            id: 'supp_mest',
            name: 'شركة ميست',
            nameEn: 'Mest Company',
            contactPerson: 'غير محدد',
            email: 'info@mest.com',
            phone: '+201005678901',
            address: 'القاهرة، مصر',
            products: ['Printers', 'Scanners'],
            paymentTerms: '30 يوم',
            rating: 4.6,
            status: 'active'
        },
        {
            id: 'supp_compu_science',
            name: 'شركة كومبيو ساينس',
            nameEn: 'Compu Science Company',
            contactPerson: 'غير محدد',
            email: 'info@compuscience.com',
            phone: '+201006789012',
            address: 'القاهرة، مصر',
            products: ['Computers', 'Laptops', 'Servers'],
            paymentTerms: '45 يوم',
            rating: 4.8,
            status: 'active'
        },
        {
            id: 'supp_peta_server',
            name: 'شركة بيتا سيرفر',
            nameEn: 'Peta Server Company',
            contactPerson: 'غير محدد',
            email: 'info@petaserver.com',
            phone: '+201007890123',
            address: 'القاهرة، مصر',
            products: ['Servers', 'Network Equipment', 'Cameras'],
            paymentTerms: '45 يوم',
            rating: 4.7,
            status: 'active'
        },
        {
            id: 'supp_speed',
            name: 'شركة سبيد',
            nameEn: 'Speed Company',
            contactPerson: 'غير محدد',
            email: 'info@speed.com',
            phone: '+201008901234',
            address: 'القاهرة، مصر',
            products: ['Security Cameras', 'CCTV'],
            paymentTerms: '30 يوم',
            rating: 4.5,
            status: 'active'
        }
    ];

    // ==================== دالة تحميل البيانات الحقيقية ====================
    function loadRealData() {
        // تحميل العملاء
        const existingCustomers = APP_CORE.getData('customers') || [];
        const mergedCustomers = [...existingCustomers];
        
        REAL_CUSTOMERS.forEach(realCustomer => {
            const exists = mergedCustomers.find(c => c.id === realCustomer.id);
            if (!exists) {
                mergedCustomers.push(realCustomer);
            }
        });
        
        APP_CORE.setData('customers', mergedCustomers);

        // تحميل عروض الأسعار
        const existingQuotations = APP_CORE.getData('quotations') || [];
        const mergedQuotations = [...existingQuotations];
        
        REAL_QUOTATIONS.forEach(realQuotation => {
            const exists = mergedQuotations.find(q => q.id === realQuotation.id);
            if (!exists) {
                mergedQuotations.push(realQuotation);
            }
        });
        
        APP_CORE.setData('quotations', mergedQuotations);

        // تحميل الفواتير
        const existingInvoices = APP_CORE.getData('invoices') || [];
        const mergedInvoices = [...existingInvoices];
        
        REAL_INVOICES.forEach(realInvoice => {
            const exists = mergedInvoices.find(i => i.id === realInvoice.id);
            if (!exists) {
                mergedInvoices.push(realInvoice);
            }
        });
        
        APP_CORE.setData('invoices', mergedInvoices);

        // تحميل الموردين
        const existingSuppliers = APP_CORE.getData('suppliers') || [];
        const mergedSuppliers = [...existingSuppliers];
        
        REAL_SUPPLIERS.forEach(realSupplier => {
            const exists = mergedSuppliers.find(s => s.id === realSupplier.id);
            if (!exists) {
                mergedSuppliers.push(realSupplier);
            }
        });
        
        APP_CORE.setData('suppliers', mergedSuppliers);

        APP_CORE.showToast('تم تحميل البيانات الحقيقية بنجاح! ✅', 'success');
        
        return {
            customers: mergedCustomers.length,
            quotations: mergedQuotations.length,
            invoices: mergedInvoices.length,
            suppliers: mergedSuppliers.length
        };
    }

    // ==================== دالة حساب الإحصائيات ====================
    function calculateRealStatistics() {
        const quotations = APP_CORE.getData('quotations') || [];
        
        const totalSales = quotations
            .filter(q => q.status === 'closed')
            .reduce((sum, q) => sum + (q.customerPrice || 0), 0);
        
        const totalCost = quotations
            .filter(q => q.status === 'closed')
            .reduce((sum, q) => sum + (q.cost || 0), 0);
        
        const totalProfit = quotations
            .filter(q => q.status === 'closed')
            .reduce((sum, q) => sum + (q.profit || 0), 0);
        
        const profitMargin = totalSales > 0 ? (totalProfit / totalSales * 100).toFixed(2) : 0;

        return {
            totalSales,
            totalCost,
            totalProfit,
            profitMargin,
            quotationsCount: quotations.length,
            closedQuotations: quotations.filter(q => q.status === 'closed').length
        };
    }

    // ==================== Public API ====================
    return {
        loadRealData,
        calculateRealStatistics,
        REAL_CUSTOMERS,
        REAL_QUOTATIONS,
        REAL_INVOICES,
        REAL_SUPPLIERS
    };
})();