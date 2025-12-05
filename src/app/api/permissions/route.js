import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Permissions structure
const PERMISSIONS = {
    dashboard: {
        view: 'Ø¹Ø±Ø¶ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
        export: 'ØªØµØ¯ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª'
    },
    customers: {
        view: 'Ø¹Ø±Ø¶ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡',
        create: 'Ø¥Ø¶Ø§ÙØ© Ø¹Ù…ÙŠÙ„',
        edit: 'ØªØ¹Ø¯ÙŠÙ„ Ø¹Ù…ÙŠÙ„',
        delete: 'Ø­Ø°Ù Ø¹Ù…ÙŠÙ„'
    },
    invoices: {
        view: 'Ø¹Ø±Ø¶ Ø§Ù„ÙÙˆØ§ØªÙŠØ±',
        create: 'Ø¥Ù†Ø´Ø§Ø¡ ÙØ§ØªÙˆØ±Ø©',
        edit: 'ØªØ¹Ø¯ÙŠÙ„ ÙØ§ØªÙˆØ±Ø©',
        delete: 'Ø­Ø°Ù ÙØ§ØªÙˆØ±Ø©',
        approve: 'Ø§Ø¹ØªÙ…Ø§Ø¯ ÙØ§ØªÙˆØ±Ø©'
    },
    products: {
        view: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
        create: 'Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬',
        edit: 'ØªØ¹Ø¯ÙŠÙ„ Ù…Ù†ØªØ¬',
        delete: 'Ø­Ø°Ù Ù…Ù†ØªØ¬'
    },
    reports: {
        view: 'Ø¹Ø±Ø¶ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±',
        create: 'Ø¥Ù†Ø´Ø§Ø¡ ØªÙ‚Ø±ÙŠØ±',
        export: 'ØªØµØ¯ÙŠØ± ØªÙ‚Ø±ÙŠØ±'
    },
    settings: {
        view: 'Ø¹Ø±Ø¶ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª',
        edit: 'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª'
    },
    users: {
        view: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†',
        create: 'Ø¥Ø¶Ø§ÙØ© Ù…Ø³ØªØ®Ø¯Ù…',
        edit: 'ØªØ¹Ø¯ÙŠÙ„ Ù…Ø³ØªØ®Ø¯Ù…',
        delete: 'Ø­Ø°Ù Ù…Ø³ØªØ®Ø¯Ù…'
    }
};

// Role-based default permissions
const ROLE_PERMISSIONS = {
    admin: {
        // Admin has all permissions
        ...Object.keys(PERMISSIONS).reduce((acc, module) => {
            acc[module] = Object.keys(PERMISSIONS[module]);
            return acc;
        }, {})
    },
    manager: {
        dashboard: ['view', 'export'],
        customers: ['view', 'create', 'edit'],
        invoices: ['view', 'create', 'edit', 'approve'],
        products: ['view', 'create', 'edit'],
        reports: ['view', 'create', 'export'],
        settings: ['view'],
        users: ['view']
    },
    user: {
        dashboard: ['view'],
        customers: ['view'],
        invoices: ['view', 'create'],
        products: ['view'],
        reports: ['view'],
        settings: ['view']
    }
};

// GET permissions for user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Get user role
        const role = userId ? 'user' : session.user.role; // Simplified

        // Get permissions for role
        const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

        return NextResponse.json({
            success: true,
            data: {
                permissions,
                allPermissions: PERMISSIONS,
                role
            }
        });

    } catch (error) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch permissions' },
            { status: 500 }
        );
    }
}

// POST update permissions
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, permissions } = body;

        // TODO: Save custom permissions to database
        // await prisma.userPermissions.upsert({
        //   where: { userId },
        //   update: { permissions },
        //   create: { userId, permissions }
        // });

        return NextResponse.json({
            success: true,
            message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø¨Ù†Ø¬Ø§Ø­'
        });

    } catch (error) {
        console.error('Error updating permissions:', error);
        return NextResponse.json(
            { error: 'Failed to update permissions' },
            { status: 500 }
        );
    }
}
