import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET PO reports
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const reportType = searchParams.get('type') || 'summary';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const supplierId = searchParams.get('supplierId');

        const where = {
            tenantId: session.user.tenantId
        };

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (supplierId) {
            where.supplierId = supplierId;
        }

        const pos = await prisma.advancedPurchaseOrder.findMany({
            where,
            include: {
                supplier: true,
                items: true,
                shipments: true,
                payments: true,
                qualityChecks: true
            },
            orderBy: { createdAt: 'desc' }
        });

        let reportData = {};

        switch (reportType) {
            case 'summary':
                reportData = generateSummaryReport(pos);
                break;
            case 'supplier':
                reportData = generateSupplierReport(pos);
                break;
            case 'financial':
                reportData = generateFinancialReport(pos);
                break;
            case 'delivery':
                reportData = generateDeliveryReport(pos);
                break;
            case 'quality':
                reportData = generateQualityReport(pos);
                break;
            default:
                reportData = generateSummaryReport(pos);
        }

        return NextResponse.json({
            success: true,
            data: reportData,
            reportType,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}

function generateSummaryReport(pos) {
    return {
        totalOrders: pos.length,
        totalValue: pos.reduce((sum, po) => sum + po.totalAmount, 0),
        avgOrderValue: pos.length > 0 ? pos.reduce((sum, po) => sum + po.totalAmount, 0) / pos.length : 0,
        byStatus: {
            draft: pos.filter(po => po.status === 'draft').length,
            pending: pos.filter(po => po.status === 'pending_approval').length,
            approved: pos.filter(po => po.status === 'approved').length,
            ordered: pos.filter(po => po.status === 'ordered').length,
            shipped: pos.filter(po => po.status === 'shipped').length,
            delivered: pos.filter(po => po.status === 'delivered').length,
            closed: pos.filter(po => po.status === 'closed').length
        },
        topSuppliers: getTopSuppliers(pos, 5)
    };
}

function generateSupplierReport(pos) {
    const supplierStats = {};

    pos.forEach(po => {
        const supplierId = po.supplierId;
        if (!supplierStats[supplierId]) {
            supplierStats[supplierId] = {
                supplier: po.supplier,
                orderCount: 0,
                totalValue: 0,
                onTimeDeliveries: 0,
                totalDeliveries: 0,
                avgDeliveryTime: 0
            };
        }

        supplierStats[supplierId].orderCount++;
        supplierStats[supplierId].totalValue += po.totalAmount;

        if (po.actualDelivery) {
            supplierStats[supplierId].totalDeliveries++;
            if (po.expectedDelivery && new Date(po.actualDelivery) <= new Date(po.expectedDelivery)) {
                supplierStats[supplierId].onTimeDeliveries++;
            }
        }
    });

    return Object.values(supplierStats).map(stat => ({
        ...stat,
        avgOrderValue: stat.orderCount > 0 ? stat.totalValue / stat.orderCount : 0,
        onTimeRate: stat.totalDeliveries > 0 ? (stat.onTimeDeliveries / stat.totalDeliveries) * 100 : 0
    }));
}

function generateFinancialReport(pos) {
    const totalValue = pos.reduce((sum, po) => sum + po.totalAmount, 0);
    const paidAmount = pos
        .filter(po => po.paymentStatus === 'paid')
        .reduce((sum, po) => sum + po.totalAmount, 0);
    const pendingAmount = pos
        .filter(po => po.paymentStatus === 'pending')
        .reduce((sum, po) => sum + po.totalAmount, 0);

    return {
        totalValue,
        paidAmount,
        pendingAmount,
        partialAmount: totalValue - paidAmount - pendingAmount,
        byMonth: getMonthlyFinancials(pos)
    };
}

function generateDeliveryReport(pos) {
    const deliveredPOs = pos.filter(po => po.actualDelivery);
    const onTime = deliveredPOs.filter(po =>
        po.expectedDelivery && new Date(po.actualDelivery) <= new Date(po.expectedDelivery)
    ).length;

    return {
        totalDelivered: deliveredPOs.length,
        onTimeDeliveries: onTime,
        lateDeliveries: deliveredPOs.length - onTime,
        onTimeRate: deliveredPOs.length > 0 ? (onTime / deliveredPOs.length) * 100 : 0,
        avgDeliveryTime: calculateAvgDeliveryTime(deliveredPOs)
    };
}

function generateQualityReport(pos) {
    const allChecks = pos.flatMap(po => po.qualityChecks || []);
    const passed = allChecks.filter(qc => qc.status === 'passed').length;
    const failed = allChecks.filter(qc => qc.status === 'failed').length;
    const partial = allChecks.filter(qc => qc.status === 'partial').length;

    return {
        totalChecks: allChecks.length,
        passed,
        failed,
        partial,
        passRate: allChecks.length > 0 ? (passed / allChecks.length) * 100 : 0,
        avgScore: allChecks.length > 0
            ? allChecks.reduce((sum, qc) => sum + (qc.overallScore || 0), 0) / allChecks.length
            : 0
    };
}

function getTopSuppliers(pos, limit) {
    const supplierTotals = {};
    pos.forEach(po => {
        if (!supplierTotals[po.supplierId]) {
            supplierTotals[po.supplierId] = {
                supplier: po.supplier,
                totalValue: 0,
                orderCount: 0
            };
        }
        supplierTotals[po.supplierId].totalValue += po.totalAmount;
        supplierTotals[po.supplierId].orderCount++;
    });

    return Object.values(supplierTotals)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, limit);
}

function getMonthlyFinancials(pos) {
    const monthly = {};
    pos.forEach(po => {
        const month = new Date(po.createdAt).toISOString().slice(0, 7);
        if (!monthly[month]) {
            monthly[month] = { totalValue: 0, orderCount: 0 };
        }
        monthly[month].totalValue += po.totalAmount;
        monthly[month].orderCount++;
    });
    return monthly;
}

function calculateAvgDeliveryTime(deliveredPOs) {
    if (deliveredPOs.length === 0) return 0;
    const totalDays = deliveredPOs.reduce((sum, po) => {
        const days = Math.ceil(
            (new Date(po.actualDelivery) - new Date(po.orderDate)) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
    }, 0);
    return Math.round(totalDays / deliveredPOs.length);
}
