import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/invoices - Get all invoices
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = status && status !== 'all' ? { status } : {};

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                customer: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(invoices);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

// POST /api/invoices - Create new invoice
export async function POST(request) {
    try {
        const body = await request.json();

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
                date: new Date(body.date),
                customerId: body.customerId,
                description: body.description,
                salesPerson: body.salesPerson,
                type: body.type,
                salesValue: parseFloat(body.salesValue),
                profitTax: parseFloat(body.profitTax),
                vat: parseFloat(body.vat),
                finalValue: parseFloat(body.finalValue),
                balance: parseFloat(body.finalValue),
                status: 'pending'
            },
            include: {
                customer: true
            }
        });

        // Update customer totals
        await prisma.customer.update({
            where: { id: body.customerId },
            data: {
                totalInvoices: { increment: 1 },
                totalValue: { increment: parseFloat(body.finalValue) }
            }
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error('Invoice creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
