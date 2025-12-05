const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

async function runTest() {
    console.log('🚀 Starting API Integration Test...\n');

    // 1. Load Environment Variables
    const envPath = path.resolve(__dirname, '../.env');
    const envConfig = require('dotenv').config({ path: envPath });

    if (envConfig.error) {
        console.error('❌ Could not load .env file');
        process.exit(1);
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        console.error('❌ NEXTAUTH_SECRET not found in .env');
        process.exit(1);
    }

    // 2. Generate Session Token
    console.log('🔑 Generating Session Token...');
    // We need to match the token payload structure expected by NextAuth
    const token = await encode({
        token: {
            name: 'Test Admin',
            email: 'admin@testcompany.local',
            picture: null,
            sub: 'test-user-id', // We might need real ID, but let's try
            tenantId: 'test-tenant-id', // We need real tenant ID
            role: 'admin',
        },
        secret,
    });

    // We need real User and Tenant IDs for the API to work (it queries DB)
    // Let's fetch them from DB first
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({ where: { email: 'admin@testcompany.local' } });
    if (!user) {
        console.error('❌ Test user not found in DB');
        process.exit(1);
    }

    // Re-generate token with real IDs
    const validToken = await encode({
        token: {
            name: user.name,
            email: user.email,
            picture: null,
            sub: user.id,
            id: user.id,
            tenantId: user.tenantId,
            role: user.role,
        },
        secret,
    });

    console.log('✅ Token generated.');

    // Verify token locally
    const { decode } = require('next-auth/jwt');
    const decoded = await decode({ token: validToken, secret });
    console.log('🔍 Decoded Token Check:', decoded ? 'Valid' : 'Invalid');
    if (decoded) {
        console.log('   User:', decoded.email);
        console.log('   Tenant:', decoded.tenantId);
    }

    // 3. Test GET /api/opportunities
    console.log('Testing GET /api/opportunities...');
    const resOps = await fetch('http://localhost:3000/api/opportunities', {
        headers: {
            'Cookie': `next-auth.session-token=${validToken}`
        }
    });

    if (resOps.status === 200) {
        const ops = await resOps.json();
        console.log(`✅ Success! Found ${ops.length} opportunities.`);
        if (ops.length > 0) {
            console.log(`   - First Deal: ${ops[0].title} ($${ops[0].value})`);

            // 4. Test POST /api/rfq (Create RFQ from Opportunity)
            // We need to implement this API first? Or does it exist?
            // User asked to test "Sales -> RFQ".
            // Usually this means creating an RFQ linked to the opportunity.
            // Let's check if /api/rfq exists.
        }
    } else {
        console.error(`❌ Failed: ${resOps.status} ${resOps.statusText}`);
        const text = await resOps.text();
        console.error('   Response:', text);
    }

    await prisma.$disconnect();
}

runTest().catch(console.error);
