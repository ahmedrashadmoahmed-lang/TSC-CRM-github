import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST export data
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, format, filters } = body; // type: invoices, customers, etc.

        const tenantId = session.user.tenantId;

        // Get data based on type
        let data = [];
        let headers = [];

        switch (type) {
            case 'invoices':
                const invoices = await prisma.invoice.findMany({
                    where: { tenantId },
                    include: { customer: true }
                });
                data = invoices.map(inv => ({
                    'Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©': inv.invoiceNumber,
                    'Ø§Ù„Ø¹Ù…ÙŠÙ„': inv.customer?.name || '',
                    'Ø§Ù„ØªØ§Ø±ÙŠØ®': new Date(inv.issueDate).toLocaleDateString('ar-EG'),
                    'Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚': new Date(inv.dueDate).toLocaleDateString('ar-EG'),
                    'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ': inv.total,
                    'Ø§Ù„Ù…Ø¯ÙÙˆØ¹': inv.paidAmount,
                    'Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ': inv.total - inv.paidAmount,
                    'Ø§Ù„Ø­Ø§Ù„Ø©': inv.status === 'paid' ? 'Ù…Ø¯ÙÙˆØ¹Ø©' : 'Ù…Ø¹Ù„Ù‚Ø©'
                }));
                headers = ['Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'Ø§Ù„Ø¹Ù…ÙŠÙ„', 'Ø§Ù„ØªØ§Ø±ÙŠØ®', 'Ø§Ù„Ø§Ø³ØªØ­Ù‚Ø§Ù‚', 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ', 'Ø§Ù„Ù…Ø¯ÙÙˆØ¹', 'Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ', 'Ø§Ù„Ø­Ø§Ù„Ø©'];
                break;

            case 'customers':
                const customers = await prisma.customer.findMany({
                    where: { tenantId }
                });
                data = customers.map(c => ({
                    'Ø§Ù„Ø§Ø³Ù…': c.name,
                    'Ø§Ù„Ø¨Ø±ÙŠØ¯': c.email || '',
                    'Ø§Ù„Ù‡Ø§ØªÙ': c.phone || '',
                    'Ø§Ù„Ø¹Ù†ÙˆØ§Ù†': c.address || '',
                    'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù‚ÙŠÙ…Ø©': c.totalValue,
                    'Ø§Ù„Ù…Ø­ØµÙ„': c.totalCollected,
                    'Ø§Ù„Ø­Ø§Ù„Ø©': c.status === 'active' ? 'Ù†Ø´Ø·' : 'ØºÙŠØ± Ù†Ø´Ø·'
                }));
                headers = ['Ø§Ù„Ø§Ø³Ù…', 'Ø§Ù„Ø¨Ø±ÙŠØ¯', 'Ø§Ù„Ù‡Ø§ØªÙ', 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù†', 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù‚ÙŠÙ…Ø©', 'Ø§Ù„Ù…Ø­ØµÙ„', 'Ø§Ù„Ø­Ø§Ù„Ø©'];
                break;

            case 'expenses':
                const expenses = await prisma.expense.findMany({
                    where: { tenantId }
                });
                data = expenses.map(e => ({
                    'Ø§Ù„ØªØ§Ø±ÙŠØ®': new Date(e.date).toLocaleDateString('ar-EG'),
                    'Ø§Ù„ÙØ¦Ø©': e.category,
                    'Ø§Ù„ÙˆØµÙ': e.description,
                    'Ø§Ù„Ù…Ø¨Ù„Øº': e.amount,
                    'Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¯ÙØ¹': e.paymentMethod || ''
                }));
                headers = ['Ø§Ù„ØªØ§Ø±ÙŠØ®', 'Ø§Ù„ÙØ¦Ø©', 'Ø§Ù„ÙˆØµÙ', 'Ø§Ù„Ù…Ø¨Ù„Øº', 'Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¯ÙØ¹'];
                break;

            case 'employees':
                const employees = await prisma.employee.findMany({
                    where: { tenantId }
                });
                data = employees.map(e => ({
                    'Ø§Ù„Ø§Ø³Ù…': e.name,
                    'Ø§Ù„Ù…Ø³Ù…Ù‰': e.position,
                    'Ø§Ù„Ù‚Ø³Ù…': e.department,
                    'Ø§Ù„Ø±Ø§ØªØ¨': e.salary,
                    'ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ¹ÙŠÙŠÙ†': new Date(e.hireDate).toLocaleDateString('ar-EG'),
                    'Ø§Ù„Ø­Ø§Ù„Ø©': e.status === 'active' ? 'Ù†Ø´Ø·' : 'ØºÙŠØ± Ù†Ø´Ø·'
                }));
                headers = ['Ø§Ù„Ø§Ø³Ù…', 'Ø§Ù„Ù…Ø³Ù…Ù‰', 'Ø§Ù„Ù‚Ø³Ù…', 'Ø§Ù„Ø±Ø§ØªØ¨', 'ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ¹ÙŠÙŠÙ†', 'Ø§Ù„Ø­Ø§Ù„Ø©'];
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid export type' },
                    { status: 400 }
                );
        }

        // Format data based on requested format
        let exportData;
        let contentType;
        let filename;

        switch (format) {
            case 'csv':
                exportData = convertToCSV(data, headers);
                contentType = 'text/csv; charset=utf-8';
                filename = `${type}_${Date.now()}.csv`;
                break;

            case 'json':
                exportData = JSON.stringify(data, null, 2);
                contentType = 'application/json';
                filename = `${type}_${Date.now()}.json`;
                break;

            case 'excel':
                // For Excel, we'll return CSV for now (can be enhanced with xlsx library)
                exportData = convertToCSV(data, headers);
                contentType = 'text/csv; charset=utf-8';
                filename = `${type}_${Date.now()}.csv`;
                break;

            default:
                exportData = convertToCSV(data, headers);
                contentType = 'text/csv; charset=utf-8';
                filename = `${type}_${Date.now()}.csv`;
        }

        return NextResponse.json({
            success: true,
            data: {
                content: exportData,
                filename,
                contentType,
                recordCount: data.length
            }
        });

    } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
}

// Helper: Convert to CSV
function convertToCSV(data, headers) {
    if (data.length === 0) return '';

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';

    // Create header row
    const headerRow = headers.join(',');

    // Create data rows
    const dataRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return BOM + [headerRow, ...dataRows].join('\n');
}
