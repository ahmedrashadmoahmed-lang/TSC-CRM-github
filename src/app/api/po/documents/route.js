import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET documents for a PO
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

        const documents = await prisma.pODocument.findMany({
            where: { poId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

// POST upload document
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
            title,
            filename,
            filepath,
            filesize,
            mimeType,
            accessLevel,
            description
        } = body;

        if (!poId || !type || !title || !filename || !filepath) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const document = await prisma.pODocument.create({
            data: {
                poId,
                type,
                title,
                filename,
                filepath,
                filesize: filesize || 0,
                mimeType,
                accessLevel: accessLevel || 'internal',
                uploadedBy: session.user.id,
                description
            }
        });

        return NextResponse.json({
            success: true,
            data: document,
            message: 'ØªÙ… Ø±ÙØ¹ Ø§Ù„Ù…Ø³ØªÙ†Ø¯ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}

// DELETE document
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
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        await prisma.pODocument.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªÙ†Ø¯ Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}
