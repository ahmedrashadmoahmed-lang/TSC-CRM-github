import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
    prisma: {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
    },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
        data: null,
        status: 'unauthenticated',
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    SessionProvider: ({ children }) => children,
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Suppress console errors in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
}
