import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export async function POST(request) {
    try {
        const { message, conversationHistory = [] } = await request.json();

        // Check if API key is configured
        if (!genAI) {
            return NextResponse.json({
                message: 'عذراً، لم يتم تكوين مفتاح API للذكاء الاصطناعي. يرجى إضافة GEMINI_API_KEY في ملف .env.local',
                isError: true
            });
        }

        // Get system context with real-time data
        const context = await getSystemContext();

        // Build comprehensive system prompt in Arabic
        const systemPrompt = `أنت مساعد ذكي متخصص في نظام ERP لإدارة سلسلة التوريد.

📊 **البيانات الحالية للنظام:**

**المبيعات:**
- إجمالي المبيعات: ${context.totalSales.toLocaleString('ar-EG')} جنيه
- المبلغ المحصل: ${context.totalCollected.toLocaleString('ar-EG')} جنيه
- المبلغ المعلق: ${context.pendingAmount.toLocaleString('ar-EG')} جنيه
- عدد الفواتير: ${context.totalInvoices}
- الفواتير المعلقة: ${context.pendingInvoices}

**العملاء والموردين:**
- عدد العملاء: ${context.totalCustomers}
- عدد الموردين: ${context.totalSuppliers}
- إجمالي المشتريات: ${context.totalPurchases.toLocaleString('ar-EG')} جنيه

**الموارد البشرية:**
- عدد الموظفين: ${context.employees}
- إجمالي الرواتب: ${context.totalPayroll.toLocaleString('ar-EG')} جنيه

**المصروفات:**
- إجمالي المصروفات: ${context.totalExpenses.toLocaleString('ar-EG')} جنيه

**المخزون:**
- عدد المنتجات: ${context.totalProducts}

**التحليلات:**
- هامش الربح: ${context.profitMargin}%

---

**دورك:**
- أجب على أسئلة المستخدم بناءً على هذه البيانات
- قدم تحليلات وإحصائيات مفيدة
- اقترح حلول وتوصيات
- كن واضحاً ومختصراً
- استخدم الأرقام والإحصائيات من البيانات أعلاه
- إذا سُئلت عن شيء غير متوفر، أخبر المستخدم بذلك بوضوح

**مهم:** أجب باللغة العربية دائماً.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        // Build conversation history
        const history = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: 1024,
            },
        });

        // Send message with system context
        const result = await chat.sendMessage(systemPrompt + '\n\nسؤال المستخدم: ' + message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            message: text,
            timestamp: new Date().toISOString(),
            context: {
                totalSales: context.totalSales,
                pendingAmount: context.pendingAmount
            }
        });

    } catch (error) {
        console.error('Chat error:', error);

        // Handle specific errors
        if (error.message?.includes('API key')) {
            return NextResponse.json({
                message: 'خطأ في مفتاح API. يرجى التحقق من صحة المفتاح.',
                isError: true
            }, { status: 401 });
        }

        return NextResponse.json({
            message: 'عذراً، حدث خطأ في معالجة طلبك. حاول مرة أخرى.',
            isError: true
        }, { status: 500 });
    }
}

async function getSystemContext() {
    try {
        const [invoices, customers, employees, suppliers, purchaseOrders, expenses, products, payroll] = await Promise.all([
            prisma.invoice.findMany(),
            prisma.customer.findMany(),
            prisma.employee.findMany({ where: { status: 'active' } }),
            prisma.supplier.findMany(),
            prisma.purchaseOrder.findMany(),
            prisma.expense.findMany(),
            prisma.product.findMany(),
            prisma.payroll.findMany()
        ]);

        const totalSales = invoices.reduce((sum, inv) => sum + inv.finalValue, 0);
        const totalCollected = invoices.reduce((sum, inv) => sum + inv.collected, 0);
        const pendingAmount = totalSales - totalCollected;
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
        const totalPurchases = purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
        const totalPayroll = payroll.reduce((sum, p) => sum + p.netSalary, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const profitMargin = totalSales > 0
            ? ((totalSales - totalPurchases) / totalSales * 100).toFixed(2)
            : 0;

        return {
            totalSales,
            totalCollected,
            pendingAmount,
            totalInvoices: invoices.length,
            pendingInvoices,
            totalCustomers: customers.length,
            totalSuppliers: suppliers.length,
            totalPurchases,
            employees: employees.length,
            totalPayroll,
            totalExpenses,
            totalProducts: products.length,
            profitMargin
        };
    } catch (error) {
        console.error('Error getting system context:', error);
        return {
            totalSales: 0,
            totalCollected: 0,
            pendingAmount: 0,
            totalInvoices: 0,
            pendingInvoices: 0,
            totalCustomers: 0,
            totalSuppliers: 0,
            totalPurchases: 0,
            employees: 0,
            totalPayroll: 0,
            totalExpenses: 0,
            totalProducts: 0,
            profitMargin: 0
        };
    }
}
