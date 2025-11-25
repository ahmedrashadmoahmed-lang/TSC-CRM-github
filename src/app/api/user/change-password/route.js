import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { strictRateLimit } from '@/middleware/rateLimit';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/user/change-password
 * Change user password
 */
export const POST = strictRateLimit(
    withAuth(async (req) => {
        try {
            const userId = req.user.id;
            const body = await req.json();
            const { currentPassword, newPassword } = body;

            // Validate input
            if (!currentPassword || !newPassword) {
                return NextResponse.json(
                    { error: 'Current password and new password are required' },
                    { status: 400 }
                );
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return NextResponse.json(
                    { error: 'New password must be at least 8 characters long' },
                    { status: 400 }
                );
            }

            // Check password complexity
            const hasUpperCase = /[A-Z]/.test(newPassword);
            const hasLowerCase = /[a-z]/.test(newPassword);
            const hasNumber = /[0-9]/.test(newPassword);

            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return NextResponse.json(
                    {
                        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                    },
                    { status: 400 }
                );
            }

            // Get user with password
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 401 }
                );
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email,
                    action: 'UPDATE',
                    entity: 'User',
                    entityId: user.id,
                    newData: { action: 'password_changed' },
                    tenantId: user.tenantId,
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            return NextResponse.json(
                { error: 'Failed to change password' },
                { status: 500 }
            );
        }
    })
);
