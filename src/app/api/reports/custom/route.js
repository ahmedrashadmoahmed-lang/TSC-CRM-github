import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CustomReportEngine, DynamicForecastingEngine, RFMAnalysisEngine } from '@/lib/reportingEngines';

// POST - Generate custom report
export async function POST(request) {
    try {
        const body = await request.json();
        const { tenantId, reportType, config } = body;

        if (!tenantId || !reportType) {
            return NextResponse.json({
                success: false,
                error: 'tenantId and reportType are required'
            }, { status: 400 });
        }

        let data;
        let report;

        switch (reportType) {
            case 'pipeline':
                data = await prisma.opportunity.findMany({
                    where: { tenantId },
                    include: { customer: true }
                });
                report = CustomReportEngine.generateReport(config, data);
                break;

            case 'forecast':
                data = await prisma.opportunity.findMany({
                    where: { tenantId, isArchived: false }
                });
                report = DynamicForecastingEngine.runScenario(data, config.scenarios || []);
                break;

            case 'rfm':
                const customers = await prisma.customer.findMany({
                    where: { tenantId }
                });
                const transactions = await prisma.opportunity.findMany({
                    where: { tenantId, stage: 'won' },
                    select: {
                        customerId: true,
                        value: true,
                        closedDate: true
                    }
                }).then(opps => opps.map(o => ({
                    customerId: o.customerId,
                    value: o.value,
                    date: o.closedDate
                })));
                report = RFMAnalysisEngine.calculateRFM(customers, transactions);
                break;

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid report type'
                }, { status: 400 });
        }

        // Save report if requested
        if (config.save) {
            await prisma.customReport.create({
                data: {
                    name: config.name || `${reportType} Report`,
                    reportType,
                    filters: config.filters || {},
                    tenantId,
                    createdBy: config.userId || 'system'
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET - List saved reports
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        const reports = await prisma.customReport.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

