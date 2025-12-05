// RFQ API Route
// Handles RFQ CRUD operations and workflow management

import { prisma } from '@/lib/prisma';
import RFQWorkflowEngine from '@/lib/rfqWorkflowEngine';
import { NextResponse } from 'next/server';

// GET - Fetch all RFQs or single RFQ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default';
    const rfqId = searchParams.get('id');
    const stage = searchParams.get('stage');

    if (rfqId) {
      // Fetch single RFQ with all relations
      const rfq = await prisma.rFQ.findUnique({
        where: { id: rfqId },
        include: {
          items: true,
          suppliers: {
            include: {
              supplier: true,
            },
          },
          quotes: {
            include: {
              supplier: true,
              items: true,
              attachments: true,
            },
          },
          timeline: {
            orderBy: { createdAt: 'desc' },
          },
          attachments: true,
        },
      });

      if (!rfq) {
        return NextResponse.json(
          {
            success: false,
            error: 'RFQ not found',
          },
          { status: 404 }
        );
      }

      // Add alerts and progress
      const alerts = RFQWorkflowEngine.getAlerts(rfq);
      const progress = RFQWorkflowEngine.calculateProgress(rfq);
      const nextAction = RFQWorkflowEngine.getNextAction(rfq);

      return NextResponse.json({
        success: true,
        data: {
          ...rfq,
          alerts,
          progress,
          nextAction,
        },
      });
    }

    // Fetch all RFQs
    const where = { tenantId };
    if (stage) {
      where.stage = stage;
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        items: true,
        suppliers: {
          include: {
            supplier: true,
          },
        },
        quotes: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add alerts and progress to each RFQ
    const enhancedRFQs = rfqs.map((rfq) => ({
      ...rfq,
      alerts: RFQWorkflowEngine.getAlerts(rfq),
      progress: RFQWorkflowEngine.calculateProgress(rfq),
      nextAction: RFQWorkflowEngine.getNextAction(rfq),
    }));

    // Get statistics
    const stats = RFQWorkflowEngine.getStageStatistics(rfqs);
    const overdueRFQs = RFQWorkflowEngine.getOverdueRFQs(rfqs);
    const noResponseRFQs = RFQWorkflowEngine.getNoResponseRFQs(rfqs);

    return NextResponse.json({
      success: true,
      data: {
        rfqs: enhancedRFQs,
        stats,
        overdueCount: overdueRFQs.length,
        noResponseCount: noResponseRFQs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new RFQ
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tenantId,
      createdBy,
      title,
      description,
      items,
      suppliers,
      deadline,
      budget,
      template,
      opportunityId,
    } = body;

    // Generate RFQ number
    const count = await prisma.rFQ.count({ where: { tenantId } });
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Create RFQ with items
    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber,
        title,
        description,
        tenantId,
        createdBy,
        deadline: deadline ? new Date(deadline) : null,
        budget,
        template,
        opportunityId, // Link to opportunity
        stage: 'draft',
        status: 'active',
        items: {
          create: items || [],
        },
      },
      include: {
        items: true,
      },
    });

    // Add suppliers if provided
    if (suppliers && suppliers.length > 0) {
      await prisma.rFQSupplier.createMany({
        data: suppliers.map((supplierId) => ({
          rfqId: rfq.id,
          supplierId,
          status: 'invited',
        })),
      });
    }

    // Create timeline entry
    await prisma.rFQTimeline.create({
      data: {
        rfqId: rfq.id,
        action: 'created',
        description: `RFQ ${rfqNumber} created`,
        userId: createdBy,
      },
    });

    return NextResponse.json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update RFQ or change stage
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { rfqId, action, userId, ...updateData } = body;

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { suppliers: true, quotes: true },
    });

    if (!rfq) {
      return NextResponse.json(
        {
          success: false,
          error: 'RFQ not found',
        },
        { status: 404 }
      );
    }

    let updates = {};
    let timelineAction = '';
    let timelineDescription = '';

    switch (action) {
      case 'send':
        // Move to sent stage
        updates = {
          stage: 'sent',
          sentAt: new Date(),
        };
        timelineAction = 'sent';
        timelineDescription = `RFQ sent to ${rfq.suppliers.length} suppliers`;
        break;

      case 'move_to_comparing':
        updates = { stage: 'comparing' };
        timelineAction = 'comparing';
        timelineDescription = 'Started comparing quotes';
        break;

      case 'select_supplier':
        const { quoteId } = updateData;
        // Mark quote as selected
        await prisma.supplierQuote.update({
          where: { id: quoteId },
          data: {
            isSelected: true,
            selectedAt: new Date(),
          },
        });
        updates = { stage: 'selected' };
        timelineAction = 'selected';
        timelineDescription = 'Supplier selected';
        break;

      case 'create_po':
        updates = { stage: 'po_created' };
        timelineAction = 'po_created';
        timelineDescription = 'Purchase order created';
        break;

      case 'close':
        updates = {
          stage: 'closed',
          closedAt: new Date(),
        };
        timelineAction = 'closed';
        timelineDescription = 'RFQ closed';
        break;

      case 'update':
        updates = updateData;
        timelineAction = 'updated';
        timelineDescription = 'RFQ updated';
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }

    // Update RFQ
    const updatedRFQ = await prisma.rFQ.update({
      where: { id: rfqId },
      data: updates,
      include: {
        items: true,
        suppliers: {
          include: { supplier: true },
        },
        quotes: {
          include: { supplier: true, items: true },
        },
        timeline: true,
      },
    });

    // Create timeline entry
    if (timelineAction) {
      await prisma.rFQTimeline.create({
        data: {
          rfqId,
          action: timelineAction,
          description: timelineDescription,
          userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedRFQ,
    });
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete RFQ
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('id');

    if (!rfqId) {
      return NextResponse.json(
        {
          success: false,
          error: 'RFQ ID required',
        },
        { status: 400 }
      );
    }

    await prisma.rFQ.delete({
      where: { id: rfqId },
    });

    return NextResponse.json({
      success: true,
      message: 'RFQ deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting RFQ:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

