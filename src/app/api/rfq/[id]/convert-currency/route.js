import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import multiCurrencyEngine from '@/lib/multiCurrencyEngine';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { targetCurrency } = await request.json();

        if (!targetCurrency) {
            return NextResponse.json({ error: 'Target currency is required' }, { status: 400 });
        }

        // Validate currency
        if (!multiCurrencyEngine.isValidCurrency(targetCurrency)) {
            return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 });
        }

        // Get RFQ with all related data
        const rfq = await prisma.rFQ.findUnique({
            where: { id },
            include: {
                items: true,
                quotes: {
                    include: {
                        items: true,
                        supplier: true
                    }
                }
            }
        });

        if (!rfq) {
            return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
        }

        // Convert RFQ to target currency
        const convertedRFQ = await multiCurrencyEngine.convertRFQ(rfq, targetCurrency);

        // Get current exchange rate
        const exchangeRate = await multiCurrencyEngine.getExchangeRate(
            rfq.currency || 'EGP',
            targetCurrency
        );

        return NextResponse.json({
            success: true,
            data: {
                rfq: convertedRFQ,
                exchangeRate,
                originalCurrency: rfq.currency || 'EGP',
                targetCurrency,
                conversionTimestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Error converting RFQ currency:', error);
        return NextResponse.json({
            error: 'Failed to convert currency',
            details: error.message
        }, { status: 500 });
    }
}

// GET endpoint for getting exchange rate only
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from') || 'EGP';
        const to = searchParams.get('to') || 'USD';

        const exchangeRate = await multiCurrencyEngine.getExchangeRate(from, to);

        return NextResponse.json({
            success: true,
            data: exchangeRate
        });

    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return NextResponse.json({
            error: 'Failed to fetch exchange rate',
            details: error.message
        }, { status: 500 });
    }
}
