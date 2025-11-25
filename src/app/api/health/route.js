import { NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/monitoring';

export async function GET() {
    try {
        const health = await performHealthCheck();

        const status = health.status === 'healthy' ? 200 : 503;

        return NextResponse.json(health, { status });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
