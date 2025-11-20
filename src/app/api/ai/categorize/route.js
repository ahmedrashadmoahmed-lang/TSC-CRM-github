import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple keyword-based categorization (can be enhanced with ML)
const categoryKeywords = {
    'انتقالات': ['مواصلات', 'تاكسي', 'اوبر', 'نقل', 'سفر'],
    'أجور ومرتبات': ['مرتب', 'راتب', 'بونص', 'حوافز', 'أجر'],
    'ايجار': ['ايجار', 'إيجار', 'rent'],
    'كهرباء': ['كهرباء', 'كهربا', 'electricity'],
    'مياه': ['مياه', 'ماء', 'water'],
    'شحن': ['شحن', 'توصيل', 'delivery'],
    'أدوات مكتبية': ['طباعة', 'ورق', 'حبر', 'قرطاسية', 'أدوات'],
    'بوفيه وضيافة': ['بوفيه', 'ضيافة', 'قهوة', 'شاي'],
    'محمول': ['محمول', 'موبايل', 'فودافون', 'اتصالات'],
    'انترنت': ['انترنت', 'نت', 'internet', 'wifi'],
    'نظافة': ['نظافة', 'تنظيف', 'cleaning'],
    'صيانة': ['صيانة', 'تصليح', 'maintenance'],
    'تامين مناقصات': ['تامين', 'مناقصة', 'ضمان'],
    'كوميشيين': ['كوميشن', 'عمولة', 'commission'],
    'ضرائب': ['ضريبة', 'ضرائب', 'tax'],
    'سفر': ['سفر', 'travel', 'رحلة'],
    'مصاريف أخرى': [] // default category
};

export async function POST(request) {
    try {
        const { description, amount } = await request.json();

        if (!description) {
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            );
        }

        // Auto-categorize based on keywords
        const category = categorizeExpense(description);

        // Get similar expenses for confidence
        const similarExpenses = await findSimilarExpenses(description, category);

        // Calculate confidence score
        const confidence = calculateConfidence(description, category, similarExpenses);

        // Get alternative suggestions
        const suggestions = getAlternativeCategories(description);

        return NextResponse.json({
            category,
            confidence,
            similarExpenses: similarExpenses.slice(0, 3),
            suggestions,
            description
        });

    } catch (error) {
        console.error('Categorization error:', error);
        return NextResponse.json(
            { error: 'Failed to categorize' },
            { status: 500 }
        );
    }
}

function categorizeExpense(description) {
    const lowerDesc = description.toLowerCase();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.length === 0) continue; // skip default

        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }

    return 'مصاريف أخرى';
}

async function findSimilarExpenses(description, category) {
    try {
        const expenses = await prisma.expense.findMany({
            where: {
                category,
                description: {
                    contains: description.split(' ')[0] // first word
                }
            },
            take: 5,
            orderBy: { date: 'desc' }
        });

        return expenses;
    } catch (error) {
        return [];
    }
}

function calculateConfidence(description, category, similarExpenses) {
    let confidence = 0.5; // base confidence

    // Increase if we found exact keyword match
    const keywords = categoryKeywords[category] || [];
    const hasExactMatch = keywords.some(kw =>
        description.toLowerCase().includes(kw.toLowerCase())
    );

    if (hasExactMatch) confidence += 0.3;

    // Increase if we found similar expenses
    if (similarExpenses.length > 0) {
        confidence += Math.min(0.2, similarExpenses.length * 0.05);
    }

    return Math.min(1, confidence);
}

function getAlternativeCategories(description) {
    const lowerDesc = description.toLowerCase();
    const matches = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.length === 0) continue;

        const matchCount = keywords.filter(kw =>
            lowerDesc.includes(kw.toLowerCase())
        ).length;

        if (matchCount > 0) {
            matches.push({ category, score: matchCount });
        }
    }

    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(m => m.category);
}
