import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notificationService';

// POST /api/alerts/evaluate - Evaluate all alerts
export async function POST(request) {
    try {
        await notificationService.evaluateAlerts();

        return NextResponse.json({
            success: true,
            message: 'Alerts evaluated successfully'
        });
    } catch (error) {
        console.error('Error evaluating alerts:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET /api/alerts/evaluate - Get evaluation status
export async function GET(request) {
    try {
        // Return last evaluation time and next scheduled time
        return NextResponse.json({
            success: true,
            data: {
                lastEvaluation: new Date().toISOString(),
                nextEvaluation: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
                status: 'active'
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
