import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET PO KPIs
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month'; // month, quarter, year

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        if (period === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (period === 'quarter') {
            startDate.setMonth(now.getMonth() - 3);
        } else if (period === 'year') {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        // Get all POs in period
        const pos = await prisma.advancedPurchaseOrder.findMany({
            where: {
                tenantId: session.user.tenantId,
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                items: true,
                shipments: true,
                qualityChecks: true
            }
        });

        // Calculate KPIs
        const totalPOs = pos.length;
        const openPOs = pos.filter(po => !['closed', 'cancelled'].includes(po.status)).length;
        const closedPOs = pos.filter(po => po.status === 'closed').length;
        const cancelledPOs = pos.filter(po => po.status === 'cancelled').length;

        const totalValue = pos.reduce((sum, po) => sum + po.totalAmount, 0);
        const avgValue = totalPOs > 0 ? totalValue / totalPOs : 0;

        // Delayed POs (expected delivery passed but not delivered)
        const delayedPOs = pos.filter(po => {
            if (!po.expectedDelivery || po.status === 'delivered' || po.status === 'closed') {
                return false;
            }
            return new Date(po.expectedDelivery) < now;
        }).length;

        // On-time delivery rate
        const deliveredPOs = pos.filter(po => po.actualDelivery);
        const onTimeDeliveries = deliveredPOs.filter(po => {
            if (!po.expectedDelivery) return true;
            return new Date(po.actualDelivery) <= new Date(po.expectedDelivery);
        }).length;
        const onTimeRate = deliveredPOs.length > 0
            ? (onTimeDeliveries / deliveredPOs.length) * 100
            : 0;

        // Average delivery time
        const avgDeliveryTime = deliveredPOs.length > 0
            ? deliveredPOs.reduce((sum, po) => {
                const days = Math.ceil(
                    (new Date(po.actualDelivery) - new Date(po.orderDate)) / (1000 * 60 * 60 * 24)
                );
                return sum + days;
            }, 0) / deliveredPOs.length
            : 0;

        // Quality metrics
        const qualityChecks = pos.flatMap(po => po.qualityChecks || []);
        const passedChecks = qualityChecks.filter(qc => qc.status === 'passed').length;
        const qualityPassRate = qualityChecks.length > 0
            ? (passedChecks / qualityChecks.length) * 100
            : 0;

        // Shipment metrics
        const allShipments = pos.flatMap(po => po.shipments || []);
        const deliveredShipments = allShipments.filter(s => s.status === 'delivered').length;
        const delayedShipments = allShipments.filter(s => s.status === 'delayed').length;

        // Status breakdown
        const statusBreakdown = {
            draft: pos.filter(po => po.status === 'draft').length,
            pending_approval: pos.filter(po => po.status === 'pending_approval').length,
            approved: pos.filter(po => po.status === 'approved').length,
            ordered: pos.filter(po => po.status === 'ordered').length,
            shipped: pos.filter(po => po.status === 'shipped').length,
            delivered: pos.filter(po => po.status === 'delivered').length,
            closed: closedPOs,
            cancelled: cancelledPOs
        };

        // Payment metrics
        const paidPOs = pos.filter(po => po.paymentStatus === 'paid').length;
        const partialPaidPOs = pos.filter(po => po.paymentStatus === 'partial').length;
        const pendingPaymentPOs = pos.filter(po => po.paymentStatus === 'pending').length;

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalPOs,
                    openPOs,
                    closedPOs,
                    cancelledPOs,
                    delayedPOs,
                    totalValue,
                    avgValue
                },
                delivery: {
                    onTimeRate: Math.round(onTimeRate),
                    avgDeliveryTime: Math.round(avgDeliveryTime),
                    deliveredShipments,
                    delayedShipments
                },
                quality: {
                    totalChecks: qualityChecks.length,
                    passedChecks,
                    qualityPassRate: Math.round(qualityPassRate)
                },
                payment: {
                    paidPOs,
                    partialPaidPOs,
                    pendingPaymentPOs
                },
                statusBreakdown,
                period
            }
        });

    } catch (error) {
        console.error('Error fetching PO KPIs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch KPIs' },
            { status: 500 }
        );
    }
}
