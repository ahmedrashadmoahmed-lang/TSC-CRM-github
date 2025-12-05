import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET payments for a PO
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const poId = searchParams.get('poId');

        if (!poId) {
            return NextResponse.json(
                { error: 'PO ID is required' },
                { status: 400 }
            );
        }

        const payments = await prisma.pOPayment.findMany({
            where: { poId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: payments
        });

    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

// POST create payment
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            poId,
            type,
            amount,
            currency,
            paymentMethod,
            paymentDate,
            dueDate,
            bankReference,
            transactionId,
            notes
        } = body;

        if (!poId || !type || !amount) {
            return NextResponse.json(
                { error: 'PO ID, type, and amount are required' },
                { status: 400 }
            );
        }

        // Generate payment number
        const count = await prisma.pOPayment.count();
        const paymentNumber = `PAY-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

        const payment = await prisma.pOPayment.create({
            data: {
                poId,
                paymentNumber,
                type,
                amount,
                currency: currency || 'EGP',
                status: 'pending',
                paymentMethod,
                paymentDate: paymentDate ? new Date(paymentDate) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
                bankReference,
                transactionId,
                notes
            }
        });

        // Update PO payment status
        const po = await prisma.advancedPurchaseOrder.findUnique({
            where: { id: poId },
            include: { payments: true }
        });

        if (po) {
            const totalPaid = po.payments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0);

            let paymentStatus = 'pending';
            if (totalPaid >= po.totalAmount) {
                paymentStatus = 'paid';
            } else if (totalPaid > 0) {
                paymentStatus = 'partial';
            }

            await prisma.advancedPurchaseOrder.update({
                where: { id: poId },
                data: { paymentStatus }
            });
        }

        return NextResponse.json({
            success: true,
            data: payment,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯ÙØ¹Ø© Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}

// PATCH update payment status
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, paymentDate, transactionId } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Payment ID is required' },
                { status: 400 }
            );
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentDate) updateData.paymentDate = new Date(paymentDate);
        if (transactionId) updateData.transactionId = transactionId;

        const payment = await prisma.pOPayment.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            data: payment,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø¯ÙØ¹Ø©'
        });

    } catch (error) {
        console.error('Error updating payment:', error);
        return NextResponse.json(
            { error: 'Failed to update payment' },
            { status: 500 }
        );
    }
}
