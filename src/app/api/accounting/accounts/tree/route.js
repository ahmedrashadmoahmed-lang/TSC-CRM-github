import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET hierarchical tree structure
export async function GET() {
    try {
        // Get all accounts
        const accounts = await prisma.account.findMany({
            include: {
                parent: true,
                children: true,
                currency: true,
            },
            orderBy: {
                code: 'asc',
            },
        });

        // Build tree structure
        const buildTree = (parentId = null) => {
            return accounts
                .filter(acc => acc.parentId === parentId)
                .map(acc => ({
                    ...acc,
                    children: buildTree(acc.id),
                }));
        };

        const tree = buildTree(null);

        return NextResponse.json({ success: true, data: tree });
    } catch (error) {
        console.error('Error building account tree:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to build account tree' },
            { status: 500 }
        );
    }
}
