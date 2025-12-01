/**
 * Advanced AI Service
 * AI-powered analytics and insights using historical data
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

class AdvancedAIService {
    constructor() {
        if (process.env.GOOGLE_GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            this.enabled = true;
        } else {
            this.enabled = false;
            logger.warn('AI service not configured - missing Gemini API key');
        }
    }

    /**
     * Analyze historical data and provide insights
     */
    async analyzeHistoricalData(tenantId, options = {}) {
        if (!this.enabled) {
            return { success: false, error: 'AI service not configured' };
        }

        try {
            const {
                months = 12,
                includeCustomers = true,
                includeProducts = true,
                includeInvoices = true,
            } = options;

            // Calculate date range
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            // Get historical data
            const data = await this.fetchHistoricalData(tenantId, startDate, {
                includeCustomers,
                includeProducts,
                includeInvoices,
            });

            // Prepare data summary
            const dataSummary = this.prepareDataSummary(data);

            // Get AI insights
            const prompt = `
أنت محلل مالي وخبير في تحليل البيانات التجارية. قم بتحليل البيانات التالية بعمق وتقديم رؤى واقتراحات عملية:

${dataSummary}

قدم تحليلاً شاملاً يتضمن:

1. **الاتجاهات الرئيسية:**
   - اتجاهات المبيعات (صاعدة/هابطة/مستقرة)
   - الأنماط الموسمية
   - معدل النمو

2. **أفضل الأداء:**
   - أفضل 5 عملاء (بالأرقام والنسب)
   - أفضل 5 منتجات (بالكميات والإيرادات)
   - الفترات الأكثر ربحية

3. **فرص التحسين:**
   - العملاء الذين يمكن زيادة مبيعاتهم
   - المنتجات التي تحتاج ترويج
   - تحسينات في الأسعار
   - تقليل التكاليف

4. **التوقعات:**
   - توقعات المبيعات للشهر القادم
   - توقعات الإيرادات للربع القادم
   - المنتجات المتوقع زيادة الطلب عليها

5. **التوصيات العملية:**
   - إجراءات محددة يمكن اتخاذها فوراً
   - استراتيجيات طويلة المدى
   - تحذيرات ومخاطر محتملة

قدم الإجابة بصيغة JSON منظمة بالشكل التالي:
{
  "trends": { "sales": "", "growth": "", "seasonal": "" },
  "topPerformers": { "customers": [], "products": [], "periods": [] },
  "opportunities": { "customers": [], "products": [], "pricing": [], "costs": [] },
  "forecasts": { "nextMonth": "", "nextQuarter": "", "products": [] },
  "recommendations": { "immediate": [], "longTerm": [], "warnings": [] }
}
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const insights = this.parseAIResponse(response.text());

            logger.info('AI analysis completed', { tenantId, months });

            return {
                success: true,
                insights,
                dataSummary: data.summary,
                analyzedPeriod: {
                    from: startDate,
                    to: new Date(),
                    months,
                },
            };
        } catch (error) {
            logger.error('AI analysis failed', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Fetch historical data
     */
    async fetchHistoricalData(tenantId, startDate, options) {
        const { includeCustomers, includeProducts, includeInvoices } = options;

        const data = {};

        if (includeInvoices) {
            data.invoices = await prisma.invoice.findMany({
                where: {
                    tenantId,
                    createdAt: { gte: startDate },
                },
                include: {
                    items: true,
                    customer: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        if (includeCustomers) {
            data.customers = await prisma.customer.findMany({
                where: { tenantId },
                take: 500,
            });
        }

        if (includeProducts) {
            data.products = await prisma.product.findMany({
                where: { tenantId },
                take: 500,
            });
        }

        // Calculate summary statistics
        data.summary = this.calculateSummaryStats(data);

        return data;
    }

    /**
     * Calculate summary statistics
     */
    calculateSummaryStats(data) {
        const { invoices = [], customers = [], products = [] } = data;

        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
        const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

        const topCustomers = this.getTopCustomers(invoices);
        const topProducts = this.getTopProducts(invoices);
        const monthlyTrends = this.getMonthlyTrends(invoices);

        return {
            invoiceCount: invoices.length,
            totalRevenue: totalRevenue.toFixed(2),
            totalPaid: totalPaid.toFixed(2),
            totalOutstanding: (totalRevenue - totalPaid).toFixed(2),
            avgInvoiceValue: avgInvoiceValue.toFixed(2),
            customerCount: customers.length,
            productCount: products.length,
            topCustomers,
            topProducts,
            monthlyTrends,
        };
    }

    /**
     * Prepare data summary for AI
     */
    prepareDataSummary(data) {
        const { summary } = data;

        return `
📊 **إحصائيات عامة:**
- عدد الفواتير: ${summary.invoiceCount}
- إجمالي الإيرادات: ${summary.totalRevenue} جنيه
- المدفوع: ${summary.totalPaid} جنيه
- المتبقي: ${summary.totalOutstanding} جنيه
- متوسط قيمة الفاتورة: ${summary.avgInvoiceValue} جنيه
- عدد العملاء: ${summary.customerCount}
- عدد المنتجات: ${summary.productCount}

👥 **أفضل 5 عملاء:**
${summary.topCustomers.map((c, i) => `${i + 1}. ${c.name}: ${c.total} جنيه (${c.invoiceCount} فاتورة)`).join('\n')}

📦 **أفضل 5 منتجات:**
${summary.topProducts.map((p, i) => `${i + 1}. ${p.name}: ${p.quantity} وحدة بقيمة ${p.total} جنيه`).join('\n')}

📈 **الاتجاهات الشهرية (آخر 6 أشهر):**
${summary.monthlyTrends.map(m => `${m.month}: ${m.revenue} جنيه (${m.count} فاتورة، متوسط: ${m.avg} جنيه)`).join('\n')}
    `;
    }

    /**
     * Get top customers
     */
    getTopCustomers(invoices) {
        const customerTotals = {};

        invoices.forEach(inv => {
            const customerId = inv.customer.id;
            if (!customerTotals[customerId]) {
                customerTotals[customerId] = {
                    name: inv.customer.name,
                    total: 0,
                    invoiceCount: 0,
                };
            }
            customerTotals[customerId].total += inv.total;
            customerTotals[customerId].invoiceCount += 1;
        });

        return Object.values(customerTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(c => ({
                ...c,
                total: c.total.toFixed(2),
            }));
    }

    /**
     * Get top products
     */
    getTopProducts(invoices) {
        const productTotals = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!productTotals[item.productId]) {
                    productTotals[item.productId] = {
                        name: item.description,
                        quantity: 0,
                        total: 0,
                    };
                }
                productTotals[item.productId].quantity += item.quantity;
                productTotals[item.productId].total += item.total;
            });
        });

        return Object.values(productTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(p => ({
                ...p,
                total: p.total.toFixed(2),
            }));
    }

    /**
     * Get monthly trends
     */
    getMonthlyTrends(invoices) {
        const monthlyData = {};

        invoices.forEach(inv => {
            const month = new Date(inv.createdAt).toISOString().slice(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { revenue: 0, count: 0 };
            }
            monthlyData[month].revenue += inv.total;
            monthlyData[month].count += 1;
        });

        return Object.entries(monthlyData)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 6)
            .map(([month, data]) => ({
                month,
                revenue: data.revenue.toFixed(2),
                count: data.count,
                avg: (data.revenue / data.count).toFixed(2),
            }));
    }

    /**
     * Parse AI response
     */
    parseAIResponse(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // If no JSON found, return raw response
            return { rawResponse: response };
        } catch (error) {
            logger.warn('Failed to parse AI response as JSON', { error: error.message });
            return { rawResponse: response };
        }
    }

    /**
     * Get smart recommendations for specific context
     */
    async getSmartRecommendations(tenantId, context = {}) {
        if (!this.enabled) {
            return { success: false, error: 'AI service not configured' };
        }

        try {
            const { type, entityId, data } = context;

            let prompt = '';

            switch (type) {
                case 'pricing':
                    prompt = `بناءً على البيانات التالية، اقترح سعراً مناسباً للمنتج:\n${JSON.stringify(data, null, 2)}`;
                    break;
                case 'inventory':
                    prompt = `بناءً على بيانات المبيعات، اقترح كمية إعادة الطلب المناسبة:\n${JSON.stringify(data, null, 2)}`;
                    break;
                case 'customer':
                    prompt = `بناءً على سجل العميل، اقترح استراتيجية للتعامل معه:\n${JSON.stringify(data, null, 2)}`;
                    break;
                default:
                    prompt = `قدم توصيات عامة بناءً على:\n${JSON.stringify(data, null, 2)}`;
            }

            const result = await this.model.generateContent(prompt);
            const response = await result.response;

            return {
                success: true,
                recommendations: response.text(),
            };
        } catch (error) {
            logger.error('Failed to get recommendations', { error: error.message });
            return { success: false, error: error.message };
        }
    }
}

const advancedAIService = new AdvancedAIService();
export default advancedAIService;
