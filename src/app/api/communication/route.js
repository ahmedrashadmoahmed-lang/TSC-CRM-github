import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    CommunicationEngine,
    MarketingIntegrationEngine,
    PostDealAutomationEngine,
    CustomerFeedbackEngine
} from '@/lib/communicationEngines';

// POST - Send communication
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, data } = body;

        let result;

        switch (action) {
            case 'send_message':
                result = await CommunicationEngine.sendMessage(data);

                // Log communication
                await prisma.activity.create({
                    data: {
                        type: `communication_${data.channel}`,
                        description: data.subject || data.message.substring(0, 100),
                        entityType: data.entityType || 'opportunity',
                        entityId: data.entityId,
                        tenantId: data.tenantId,
                        createdBy: data.userId
                    }
                });
                break;

            case 'track_lead_source':
                result = MarketingIntegrationEngine.trackLeadSource(data.lead, data.source);
                break;

            case 'execute_workflow':
                const workflow = await prisma.workflow.findUnique({
                    where: { id: data.workflowId }
                });
                result = await PostDealAutomationEngine.executeWorkflow(workflow, data.context);
                break;

            case 'submit_feedback':
                result = await prisma.feedback.create({
                    data: {
                        type: data.type,
                        score: data.score,
                        comment: data.comment,
                        customerId: data.customerId,
                        opportunityId: data.opportunityId,
                        tenantId: data.tenantId
                    }
                });
                break;

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in communication API:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET - Get communication data
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId is required'
            }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'communication_history':
                const entityId = searchParams.get('entityId');
                result = await prisma.activity.findMany({
                    where: {
                        tenantId,
                        entityId,
                        type: { startsWith: 'communication_' }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                });
                break;

            case 'marketing_roi':
                const opportunities = await prisma.opportunity.findMany({
                    where: { tenantId }
                });
                result = MarketingIntegrationEngine.analyzeLeadSources(opportunities);
                break;

            case 'workflows':
                result = await prisma.workflow.findMany({
                    where: { tenantId },
                    orderBy: { createdAt: 'desc' }
                });
                break;

            case 'feedback_insights':
                const feedback = await prisma.feedback.findMany({
                    where: { tenantId }
                });
                result = CustomerFeedbackEngine.getFeedbackInsights(feedback);
                break;

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching communication data:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

