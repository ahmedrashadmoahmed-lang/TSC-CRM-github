import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Register new user
 * POST /api/auth/register
 */
export async function POST(req) {
    try {
        const { name, email, password, tenantName } = await req.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'الرجاء إدخال جميع البيانات المطلوبة' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // Create tenant first (for first user)
        let tenant;
        const tenantDomain = email.split('@')[0] + '-' + Date.now();

        tenant = await prisma.tenant.create({
            data: {
                name: tenantName || name + ' Company',
                domain: tenantDomain,
                status: 'active',
            },
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'admin', // First user is admin
                status: 'active',
                tenantId: tenant.id,
            },
        });

        console.log('New user registered:', {
            userId: user.id,
            email: user.email,
            tenantId: tenant.id,
        });

        return NextResponse.json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء الحساب: ' + error.message },
            { status: 500 }
        );
    }
}
