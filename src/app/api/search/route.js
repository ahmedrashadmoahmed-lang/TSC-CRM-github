import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET global search
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({
                success: true,
                data: { results: [], total: 0 }
            });
        }

        const tenantId = session.user.tenantId;
        const searchTerm = query.toLowerCase();

        // Search across multiple entities
        const [customers, invoices, products, suppliers, employees] = await Promise.all([
            // Search customers
            prisma.customer.findMany({
                where: {
                    tenantId,
                    OR: [
                        { name: { contains: searchTerm } },
                        { email: { contains: searchTerm } },
                        { phone: { contains: searchTerm } }
                    ]
                },
                take: 5
            }),

            // Search invoices
            prisma.invoice.findMany({
                where: {
                    tenantId,
                    OR: [
                        { invoiceNumber: { contains: searchTerm } },
                        { description: { contains: searchTerm } }
                    ]
                },
                include: { customer: true },
                take: 5
            }),

            // Search products
            prisma.product.findMany({
                where: {
                    tenantId,
                    OR: [
                        { name: { contains: searchTerm } },
                        { sku: { contains: searchTerm } },
                        { description: { contains: searchTerm } }
                    ]
                },
                take: 5
            }),

            // Search suppliers
            prisma.supplier.findMany({
                where: {
                    tenantId,
                    OR: [
                        { name: { contains: searchTerm } },
                        { email: { contains: searchTerm } },
                        { phone: { contains: searchTerm } }
                    ]
                },
                take: 5
            }),

            // Search employees
            prisma.employee.findMany({
                where: {
                    tenantId,
                    OR: [
                        { name: { contains: searchTerm } },
                        { email: { contains: searchTerm } },
                        { position: { contains: searchTerm } }
                    ]
                },
                take: 5
            })
        ]);

        // Format results
        const results = [
            ...customers.map(c => ({
                id: c.id,
                type: 'customer',
                title: c.name,
                subtitle: c.email || c.phone || '',
                icon: 'ðŸ‘¤',
                link: `/contacts?id=${c.id}`,
                metadata: { totalValue: c.totalValue }
            })),
            ...invoices.map(i => ({
                id: i.id,
                type: 'invoice',
                title: i.invoiceNumber,
                subtitle: i.customer?.name || '',
                icon: 'ðŸ“„',
                link: `/invoicing?id=${i.id}`,
                metadata: { total: i.total, status: i.status }
            })),
            ...products.map(p => ({
                id: p.id,
                type: 'product',
                title: p.name,
                subtitle: p.sku || '',
                icon: 'ðŸ“¦',
                link: `/inventory?id=${p.id}`,
                metadata: { price: p.price, quantity: p.quantity }
            })),
            ...suppliers.map(s => ({
                id: s.id,
                type: 'supplier',
                title: s.name,
                subtitle: s.email || s.phone || '',
                icon: 'ðŸ¢',
                link: `/contacts?type=supplier&id=${s.id}`,
                metadata: {}
            })),
            ...employees.map(e => ({
                id: e.id,
                type: 'employee',
                title: e.name,
                subtitle: e.position || '',
                icon: 'ðŸ‘¨â€ðŸ’¼',
                link: `/hr?id=${e.id}`,
                metadata: { department: e.department }
            }))
        ];

        return NextResponse.json({
            success: true,
            data: {
                results,
                total: results.length,
                query
            }
        });

    } catch (error) {
        console.error('Error searching:', error);
        return NextResponse.json(
            { error: 'Failed to search' },
            { status: 500 }
        );
    }
}
