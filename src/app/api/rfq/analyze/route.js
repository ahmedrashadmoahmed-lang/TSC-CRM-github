// RFQ Analysis API
// Comprehensive analysis including cost estimation, risk, and predictions

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import SupplierRecommendationEngine from '@/lib/supplierRecommendationEngine';
import CostEstimationEngine from '@/lib/costEstimationEngine';
import RiskAnalysisEngine from '@/lib/riskAnalysisEngine';
import PricePredictionEngine from '@/lib/pricePredictionEngine';

export async function POST(request) {
    try {
        const body = await request.json();
        const { rfqId, tenantId, analysisTypes = ['all'] } = body;

        // Fetch RFQ with all relations
        const rfq = await prisma.rFQ.findUnique({
            where: { id: rfqId },
            include: {
                items: true,
                suppliers: {
                    include: {
                        supplier: true
                    }
                },
                quotes: {
                    include: {
                        supplier: true,
                        items: true
                    }
                }
            }
        });

        if (!rfq) {
            return NextResponse.json({
                success: false,
                error: 'RFQ not found'
            }, { status: 404 });
        }

        // Fetch historical data for this tenant
        const historicalQuotes = await prisma.supplierQuote.findMany({
            where: {
                rfq: {
                    tenantId
                }
            },
            include: {
                supplier: true,
                items: true
            },
            orderBy: {
                submittedAt: 'desc'
            },
            take: 100 // Last 100 quotes for analysis
        });

        // Fetch all suppliers for recommendations
        const allSuppliers = await prisma.supplier.findMany({
            where: {
                tenantId,
                status: 'active'
            }
        });

        const analysis = {};

        // Supplier Recommendations
        if (analysisTypes.includes('all') || analysisTypes.includes('suppliers')) {
            const supplierData = rfq.suppliers.map(rs => rs.supplier);
            const historicalSupplierData = historicalQuotes.map(q => ({
                supplierId: q.supplierId,
                totalPrice: q.totalPrice,
                deliveryTime: q.deliveryTime,
                isSelected: q.isSelected,
                responded: true,
                responseTime: 2, // Default
                template: rfq.template,
                budget: rfq.budget
            }));

            analysis.supplierRecommendations = SupplierRecommendationEngine.recommendSuppliers(
                rfq,
                allSuppliers,
                historicalSupplierData
            );
        }

        // Cost Estimation
        if (analysisTypes.includes('all') || analysisTypes.includes('cost')) {
            const historicalCostData = historicalQuotes.flatMap(quote =>
                quote.items.map(item => ({
                    productName: item.productName,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.unitPrice,
                    totalPrice: item.total,
                    unitPrice: item.unitPrice,
                    date: quote.submittedAt
                }))
            );

            analysis.costEstimation = CostEstimationEngine.estimateRFQCost(
                rfq.items,
                historicalCostData,
                { currency: rfq.currency || 'EGP' }
            );

            if (rfq.budget) {
                analysis.budgetComparison = CostEstimationEngine.compareWithBudget(
                    analysis.costEstimation,
                    rfq.budget
                );
            }
        }

        // Risk Analysis
        if (analysisTypes.includes('all') || analysisTypes.includes('risk')) {
            const suppliersList = rfq.suppliers.map(rs => rs.supplier);
            const quotesList = rfq.quotes || [];

            const historicalRiskData = historicalQuotes.map(q => ({
                supplierId: q.supplierId,
                totalPrice: q.totalPrice,
                deliveryTime: q.deliveryTime,
                isSelected: q.isSelected,
                date: q.submittedAt
            }));

            analysis.riskAnalysis = RiskAnalysisEngine.analyzeRFQRisk(
                rfq,
                suppliersList,
                quotesList,
                historicalRiskData
            );
        }

        // Price Prediction
        if (analysisTypes.includes('all') || analysisTypes.includes('prediction')) {
            const historicalPriceData = historicalQuotes.flatMap(quote =>
                quote.items.map(item => ({
                    productName: item.productName,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.unitPrice,
                    totalPrice: item.total,
                    date: quote.submittedAt
                }))
            );

            analysis.pricePrediction = PricePredictionEngine.predictPrices(
                rfq.items,
                historicalPriceData,
                {
                    horizon: 30,
                    inflationRate: 5, // Default 5%
                    currency: rfq.currency || 'EGP'
                }
            );
        }

        // Summary
        analysis.summary = {
            rfqId: rfq.id,
            rfqNumber: rfq.rfqNumber,
            totalItems: rfq.items.length,
            totalSuppliers: rfq.suppliers.length,
            quotesReceived: rfq.quotes?.length || 0,
            analysisTypes: analysisTypes,
            analyzedAt: new Date()
        };

        return NextResponse.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Error analyzing RFQ:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

