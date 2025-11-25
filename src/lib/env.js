/**
 * Environment Variables Validation
 * Validates all required environment variables at startup
 */

import { z } from 'zod';

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // NextAuth
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
    NEXTAUTH_SECRET: z
        .string()
        .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),

    // Node Environment
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    // Optional: Google Gemini
    GOOGLE_GEMINI_API_KEY: z.string().optional(),

    // Optional: Redis
    REDIS_URL: z.string().url().optional(),

    // Optional: Logging
    LOG_LEVEL: z
        .enum(['error', 'warn', 'info', 'debug'])
        .default('info')
        .optional(),

    // Optional: Email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
});

/**
 * Validate environment variables
 */
export function validateEnv() {
    try {
        const env = envSchema.parse(process.env);
        console.log('✅ Environment variables validated successfully');
        return env;
    } catch (error) {
        console.error('❌ Invalid environment variables:');
        if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        process.exit(1);
    }
}

/**
 * Get validated environment variables
 */
export const env = validateEnv();

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';
