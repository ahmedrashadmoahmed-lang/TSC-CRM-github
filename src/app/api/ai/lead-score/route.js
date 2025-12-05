import { NextResponse } from 'next/server';
import { leadScoringEngine } from '@/lib/leadScoringEngine';

// POST /api/ai/lead-score - Calculate lead score
export async function POST(request) {
    try {
        const { leadData } = await request.json();

        if (!leadData) {
            return NextResponse.json({
                success: false,
                error: 'Lead data is required'
            }, { status: 400 });
        }

        // Calculate score using AI engine
        const score = leadScoringEngine.calculateScore(leadData);

        return NextResponse.json({
            success: true,
            data: score
        });
    } catch (error) {
        console.error('Error calculating lead score:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// POST /api/ai/lead-score/batch - Calculate scores for multiple leads
export async function PUT(request) {
    try {
        const { leads } = await request.json();

        if (!leads || !Array.isArray(leads)) {
            return NextResponse.json({
                success: false,
                error: 'Leads array is required'
            }, { status: 400 });
        }

        // Batch score leads
        const scores = leadScoringEngine.scoreLeads(leads);

        return NextResponse.json({
            success: true,
            data: scores
        });
    } catch (error) {
        console.error('Error batch scoring leads:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
