import { prisma } from './src/lib/prisma.js';

async function test() {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // test low stock query
        const lowStock = await prisma.product.count({ where: { OR: [{ quantity: { lte: 10 } }, { quantity: 0 }] } });
        console.log('lowStock', lowStock);
        // test pending RFQs
        const pendingRFQs = await prisma.rfq.count({ where: { status: 'pending' } });
        console.log('pendingRFQs', pendingRFQs);
        // test revenue MTD
        const invoicesMTD = await prisma.invoice.findMany({ where: { issueDate: { gte: startOfMonth }, status: { in: ['paid', 'partial'] } } });
        const revenueMTD = invoicesMTD.reduce((sum, inv) => sum + inv.total, 0);
        console.log('revenueMTD', revenueMTD);
    } catch (e) {
        console.error('Error', e);
    }
}

test();
