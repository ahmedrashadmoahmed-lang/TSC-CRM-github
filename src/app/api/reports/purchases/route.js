import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { getTenantPrisma } from '@/lib/prisma';

// GET /api/reports/purchases
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const prisma = getTenantPrisma(request.tenantId);

        const where = {
            createdAt: {
                gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                lte: endDate ? new Date(endDate) : new Date(),
            },
        };

        // Fetch purchase order data
        const [purchaseOrders, monthlyData] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
                select: {
                    id: true,
                    total: true,
                    status: true,
                    createdAt: true,
                    supplier: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),

            // Get monthly trend data
            prisma.purchaseOrder.findMany({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), // Last 12 months
                    },
                },
                select: {
                    createdAt: true,
                    total: true,
                },
            }),
        ]);

        // Calculate metrics
        const totalSpending = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
        const totalOrders = purchaseOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalSpending / totalOrders : 0;

        const pendingOrders = purchaseOrders.filter(po => po.status === 'pending').length;
        const pendingValue = purchaseOrders
            .filter(po => po.status === 'pending')
            .reduce((sum, po) => sum + (po.total || 0), 0);

        const completedOrders = purchaseOrders.filter(po => po.status === 'received').length;
        const completedValue = purchaseOrders
            .filter(po => po.status === 'received')
            .reduce((sum, po) => sum + (po.total || 0), 0);

        // Group by month for trend
        const monthlyTrend = {};
        monthlyData.forEach((po) => {
            const monthKey = `${po.createdAt.getFullYear()}-${String(po.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyTrend[monthKey]) {
                monthlyTrend[monthKey] = 0;
            }
            monthlyTrend[monthKey] += po.total || 0;
        });

        const trendData = Object.entries(monthlyTrend)
            .map(([month, value]) => ({ month, value }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Top suppliers
        const supplierSpending = {};
        purchaseOrders.forEach((po) => {
            const supplierName = po.supplier?.name || 'Unknown';
            if (!supplierSpending[supplierName]) {
                supplierSpending[supplierName] = 0;
            }
            supplierSpending[supplierName] += po.total || 0;
        });

        const topSuppliers = Object.entries(supplierSpending)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        return NextResponse.json({
            success: true,
            data: {
                totalSpending,
                totalOrders,
                averageOrderValue,
                pendingOrders,
                pendingValue,
                completedOrders,
                completedValue,
                trendData,
                topSuppliers,
            },
        });
    } catch (error) {
        console.error('Error fetching purchase analytics:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch purchase analytics',
            },
            { status: 500 }
        );
    }
}, ['analytics:read']);
