import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const { query, filters } = await request.json();

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                success: false,
                error: 'Query must be at least 2 characters'
            }, { status: 400 });
        }

        const searchTerm = query.trim().toLowerCase();

        // Search across multiple entities
        const [clients, deals, tasks, tickets] = await Promise.all([
            // Search clients
            prisma.customer.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { phone: { contains: searchTerm, mode: 'insensitive' } }
                    ],
                    ...(filters?.type?.includes('client') ? {} : { id: '' })
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    status: true
                }
            }),

            // Search deals
            prisma.opportunity.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } }
                    ],
                    ...(filters?.type?.includes('deal') ? {} : { id: '' })
                },
                include: {
                    customer: {
                        select: {
                            name: true
                        }
                    }
                },
                take: 5
            }),

            // Search tasks
            prisma.task.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ],
                    ...(filters?.type?.includes('task') ? {} : { id: '' })
                },
                include: {
                    client: {
                        select: {
                            name: true
                        }
                    }
                },
                take: 5
            }),

            // Search tickets
            prisma.ticket.findMany({
                where: {
                    OR: [
                        { subject: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ],
                    ...(filters?.type?.includes('ticket') ? {} : { id: '' })
                },
                include: {
                    client: {
                        select: {
                            name: true
                        }
                    }
                },
                take: 5
            })
        ]);

        // Format results
        const results = [
            ...clients.map(c => ({
                id: c.id,
                type: 'client',
                title: c.name,
                subtitle: c.email || c.phone,
                status: c.status,
                url: `/customers/${c.id}`,
                matchScore: calculateMatchScore(searchTerm, c.name)
            })),
            ...deals.map(d => ({
                id: d.id,
                type: 'deal',
                title: d.title,
                subtitle: `${d.customer?.name} - $${d.value.toLocaleString()}`,
                status: d.stage,
                url: `/pipeline/${d.id}`,
                matchScore: calculateMatchScore(searchTerm, d.title)
            })),
            ...tasks.map(t => ({
                id: t.id,
                type: 'task',
                title: t.title,
                subtitle: t.client?.name || 'No client',
                status: t.status,
                url: `/tasks/${t.id}`,
                matchScore: calculateMatchScore(searchTerm, t.title)
            })),
            ...tickets.map(t => ({
                id: t.id,
                type: 'ticket',
                title: t.subject,
                subtitle: `${t.ticketNumber} - ${t.client?.name || 'No client'}`,
                status: t.status,
                url: `/tickets/${t.id}`,
                matchScore: calculateMatchScore(searchTerm, t.subject)
            }))
        ];

        // Sort by match score
        results.sort((a, b) => b.matchScore - a.matchScore);

        // AI next-action suggestions
        const suggestions = generateAISuggestions(results, query);

        return NextResponse.json({
            success: true,
            data: {
                results: results.slice(0, 10),
                suggestions,
                totalResults: results.length
            }
        });
    } catch (error) {
        console.error('Error in AI search:', error);
        return NextResponse.json(
            { success: false, error: 'Search failed' },
            { status: 500 }
        );
    }
}

function calculateMatchScore(query, text) {
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();

    if (lowerText === lowerQuery) return 100;
    if (lowerText.startsWith(lowerQuery)) return 90;
    if (lowerText.includes(` ${lowerQuery}`)) return 80;
    if (lowerText.includes(lowerQuery)) return 70;

    // Fuzzy matching
    const words = lowerQuery.split(' ');
    const matchedWords = words.filter(word => lowerText.includes(word)).length;
    return (matchedWords / words.length) * 60;
}

function generateAISuggestions(results, query) {
    const suggestions = [];

    if (results.length === 0) {
        suggestions.push({
            action: 'create',
            text: `Create new client "${query}"`,
            icon: '➕',
            url: `/customers/new?name=${encodeURIComponent(query)}`
        });
    } else {
        const topResult = results[0];
        if (topResult.type === 'client') {
            suggestions.push({
                action: 'view',
                text: `View ${topResult.title}'s profile`,
                icon: '👁️',
                url: topResult.url
            });
            suggestions.push({
                action: 'create_deal',
                text: `Create deal for ${topResult.title}`,
                icon: '💼',
                url: `/pipeline/new?clientId=${topResult.id}`
            });
        } else if (topResult.type === 'deal') {
            suggestions.push({
                action: 'view',
                text: `View deal details`,
                icon: '👁️',
                url: topResult.url
            });
            suggestions.push({
                action: 'create_task',
                text: `Create task for this deal`,
                icon: '📝',
                url: `/tasks/new?dealId=${topResult.id}`
            });
        }
    }

    return suggestions;
}
