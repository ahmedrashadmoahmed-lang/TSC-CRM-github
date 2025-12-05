import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Using DATABASE_URL from environment (SQLite for development)
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Tenant-scoped Prisma client
export function getTenantPrisma(tenantId) {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }

    return prisma.$extends({
        query: {
            $allModels: {
                async findMany({ args, query, model }) {
                    // Skip for models without tenantId
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    // Add tenantId filter
                    args.where = { ...args.where, tenantId };
                    return query(args);
                },

                async findFirst({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.where = { ...args.where, tenantId };
                    return query(args);
                },

                async findUnique({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    // For findUnique, we need to ensure tenantId is in the where clause
                    if (args.where && !args.where.tenantId) {
                        args.where = { ...args.where, tenantId };
                    }
                    return query(args);
                },

                async create({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.data = { ...args.data, tenantId };
                    return query(args);
                },

                async createMany({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    if (Array.isArray(args.data)) {
                        args.data = args.data.map(item => ({ ...item, tenantId }));
                    } else {
                        args.data = { ...args.data, tenantId };
                    }

                    return query(args);
                },

                async update({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.where = { ...args.where, tenantId };
                    return query(args);
                },

                async updateMany({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.where = { ...args.where, tenantId };
                    return query(args);
                },

                async delete({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.where = { ...args.where, tenantId };
                    return query(args);
                },

                async deleteMany({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.where = { ...args.where, tenantId };
                    return query(args);
                },

                async count({ args, query, model }) {
                    const skipModels = ['Tenant', 'Role', 'Permission', 'SeparationOfDuty'];
                    if (skipModels.includes(model)) {
                        return query(args);
                    }

                    args.where = { ...args.where, tenantId };
                    return query(args);
                },
            },
        },
    });
}

// Get tenant from request (subdomain or header)
export async function getTenantFromRequest(request) {
    try {
        // Try to get from header first (for API calls)
        const tenantHeader = request.headers.get('x-tenant-id');
        if (tenantHeader) {
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantHeader },
                include: { settings: true },
            });

            if (tenant && tenant.status === 'active') {
                return tenant;
            }
        }

        // Try to get from subdomain
        const host = request.headers.get('host') || '';
        const subdomain = host.split('.')[0];

        // Skip for localhost
        if (subdomain === 'localhost' || subdomain.includes('localhost')) {
            // For development, use demo tenant
            const tenant = await prisma.tenant.findUnique({
                where: { subdomain: 'demo' },
                include: { settings: true },
            });
            return tenant;
        }

        const tenant = await prisma.tenant.findUnique({
            where: { subdomain },
            include: { settings: true },
        });

        if (!tenant || tenant.status !== 'active') {
            throw new Error('Tenant not found or inactive');
        }

        return tenant;
    } catch (error) {
        console.error('Error getting tenant:', error);
        // For development, return demo tenant
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain: 'demo' },
            include: { settings: true },
        });
        return tenant;
    }
}
