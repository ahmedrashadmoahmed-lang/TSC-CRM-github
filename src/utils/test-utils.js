import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

/**
 * Custom render function with providers
 */
export function renderWithProviders(ui, { session = null, ...options } = {}) {
    const mockSession = session || {
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            tenantId: 'test-tenant-id',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    function Wrapper({ children }) {
        return (
            <SessionProvider session={mockSession}>
                {children}
            </SessionProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock Prisma client for testing
 */
export function createMockPrismaClient() {
    return {
        tenant: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        customer: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        supplier: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        invoice: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        invoiceItem: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        purchaseOrder: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        purchaseOrderItem: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        employee: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        payroll: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        account: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        journalEntry: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        notification: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(this)),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };
}

/**
 * Create mock Next.js request
 */
export function createMockRequest(options = {}) {
    const {
        method = 'GET',
        url = 'http://localhost:3000/api/test',
        headers = {},
        body = null,
        session = null,
    } = options;

    return {
        method,
        url,
        headers: new Headers(headers),
        json: async () => body,
        session,
        user: session?.user || null,
        tenantId: session?.user?.tenantId || null,
    };
}

/**
 * Create mock Next.js response
 */
export function createMockResponse() {
    const headers = new Map();

    return {
        status: 200,
        headers: {
            set: (key, value) => headers.set(key, value),
            get: (key) => headers.get(key),
        },
        json: jest.fn((data) => ({
            status: 200,
            data,
            headers,
        })),
    };
}

/**
 * Wait for async operations
 */
export function waitFor(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create test data factories
 */
export const factories = {
    customer: (overrides = {}) => ({
        id: 'customer-1',
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '1234567890',
        address: '123 Test St',
        taxNumber: 'TAX123',
        status: 'active',
        tenantId: 'test-tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    supplier: (overrides = {}) => ({
        id: 'supplier-1',
        name: 'Test Supplier',
        email: 'supplier@test.com',
        phone: '1234567890',
        address: '123 Test St',
        taxNumber: 'TAX123',
        rating: 4.5,
        onTimeDelivery: 95,
        status: 'active',
        tenantId: 'test-tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    product: (overrides = {}) => ({
        id: 'product-1',
        name: 'Test Product',
        sku: 'SKU123',
        description: 'Test product description',
        category: 'Electronics',
        price: 100,
        cost: 50,
        quantity: 10,
        unit: 'unit',
        reorderPoint: 5,
        status: 'active',
        tenantId: 'test-tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    invoice: (overrides = {}) => ({
        id: 'invoice-1',
        invoiceNumber: 'INV-001',
        customerId: 'customer-1',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 100,
        tax: 15,
        discount: 0,
        total: 115,
        paidAmount: 0,
        status: 'draft',
        notes: null,
        tenantId: 'test-tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    user: (overrides = {}) => ({
        id: 'user-1',
        email: 'user@test.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'user',
        status: 'active',
        tenantId: 'test-tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
