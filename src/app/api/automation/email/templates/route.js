import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all email templates
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = session.user.tenantId;

        // Mock templates (will be replaced with database)
        const templates = [
            {
                id: '1',
                name: 'ØªØ°ÙƒÙŠØ± Ø¨Ø§Ù„ÙØ§ØªÙˆØ±Ø©',
                subject: 'ØªØ°ÙƒÙŠØ±: ÙØ§ØªÙˆØ±Ø© Ø±Ù‚Ù… {{invoiceNumber}}',
                body: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Ø¹Ø²ÙŠØ²ÙŠ {{customerName}}</h2>
            <p>Ù†ÙˆØ¯ ØªØ°ÙƒÙŠØ±ÙƒÙ… Ø¨Ø£Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø±Ù‚Ù… <strong>{{invoiceNumber}}</strong> Ø¨Ù…Ø¨Ù„Øº <strong>{{amount}}</strong> Ø¬Ù†ÙŠÙ‡ Ù…Ø³ØªØ­Ù‚Ø© Ø§Ù„Ø¯ÙØ¹.</p>
            <p>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚: {{dueDate}}</p>
            <p>ÙŠØ±Ø¬Ù‰ Ø³Ø¯Ø§Ø¯ Ø§Ù„Ù…Ø¨Ù„Øº ÙÙŠ Ø£Ù‚Ø±Ø¨ ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†.</p>
            <p>Ø´ÙƒØ±Ø§Ù‹ Ù„ØªØ¹Ø§ÙˆÙ†ÙƒÙ…</p>
          </div>
        `,
                variables: ['customerName', 'invoiceNumber', 'amount', 'dueDate'],
                category: 'invoices',
                createdAt: new Date()
            },
            {
                id: '2',
                name: 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯ÙØ¹',
                subject: 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø¯ÙØ¹ØªÙƒ - ÙØ§ØªÙˆØ±Ø© {{invoiceNumber}}',
                body: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Ø´ÙƒØ±Ø§Ù‹ {{customerName}}</h2>
            <p>ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø¯ÙØ¹ØªÙƒ Ø¨Ù†Ø¬Ø§Ø­ Ù„Ù„ÙØ§ØªÙˆØ±Ø© Ø±Ù‚Ù… <strong>{{invoiceNumber}}</strong></p>
            <p>Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ù…Ø¯ÙÙˆØ¹: <strong>{{amount}}</strong> Ø¬Ù†ÙŠÙ‡</p>
            <p>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¯ÙØ¹: {{paymentDate}}</p>
            <p>Ù†Ù‚Ø¯Ø± ØªØ¹Ø§Ù…Ù„ÙƒÙ… Ù…Ø¹Ù†Ø§</p>
          </div>
        `,
                variables: ['customerName', 'invoiceNumber', 'amount', 'paymentDate'],
                category: 'payments',
                createdAt: new Date()
            },
            {
                id: '3',
                name: 'Ø¹Ø±Ø¶ Ø£Ø³Ø¹Ø§Ø± Ø¬Ø¯ÙŠØ¯',
                subject: 'Ø¹Ø±Ø¶ Ø£Ø³Ø¹Ø§Ø± Ø±Ù‚Ù… {{rfqNumber}}',
                body: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Ø¹Ø²ÙŠØ²ÙŠ {{customerName}}</h2>
            <p>Ù†Ø±Ø³Ù„ Ù„ÙƒÙ… Ø¹Ø±Ø¶ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø±Ù‚Ù… <strong>{{rfqNumber}}</strong></p>
            <p>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¹Ø±Ø¶: <strong>{{totalAmount}}</strong> Ø¬Ù†ÙŠÙ‡</p>
            <p>ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø¹Ø±Ø¶: {{validUntil}}</p>
            <p>Ù„Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ø±Ø¶ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§</p>
          </div>
        `,
                variables: ['customerName', 'rfqNumber', 'totalAmount', 'validUntil'],
                category: 'rfq',
                createdAt: new Date()
            }
        ];

        return NextResponse.json({
            success: true,
            data: templates
        });

    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

// POST create new template
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, subject, bodyContent, variables, category } = body;

        if (!name || !subject || !bodyContent) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const template = {
            id: Date.now().toString(),
            name,
            subject,
            body: bodyContent,
            variables: variables || [],
            category: category || 'general',
            tenantId: session.user.tenantId,
            createdAt: new Date()
        };

        // TODO: Save to database
        // await prisma.emailTemplate.create({ data: template });

        return NextResponse.json({
            success: true,
            data: template,
            message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}

// PATCH update template
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Template ID required' },
                { status: 400 }
            );
        }

        // TODO: Update in database
        // await prisma.emailTemplate.update({ where: { id }, data: updates });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json(
            { error: 'Failed to update template' },
            { status: 500 }
        );
    }
}

// DELETE template
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Template ID required' },
                { status: 400 }
            );
        }

        // TODO: Delete from database
        // await prisma.emailTemplate.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json(
            { error: 'Failed to delete template' },
            { status: 500 }
        );
    }
}
