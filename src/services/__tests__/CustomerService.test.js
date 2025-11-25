import { CustomerService } from '../CustomerService';
import { createMockPrismaClient, factories } from '@/utils/test-utils';

describe('CustomerService', () => {
    let mockPrisma;
    let customerService;
    const tenantId = 'test-tenant-id';

    beforeEach(() => {
        mockPrisma = createMockPrismaClient();
        customerService = new CustomerService(mockPrisma);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all customers for a tenant', async () => {
            const mockCustomers = [
                factories.customer(),
                factories.customer({ id: 'customer-2', name: 'Customer 2' }),
            ];

            mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);

            const result = await customerService.getAll(tenantId);

            expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
                where: { tenantId },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockCustomers);
        });

        it('should handle errors gracefully', async () => {
            mockPrisma.customer.findMany.mockRejectedValue(new Error('Database error'));

            await expect(customerService.getAll(tenantId)).rejects.toThrow('Database error');
        });
    });

    describe('getById', () => {
        it('should return a customer by ID', async () => {
            const mockCustomer = factories.customer();
            mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

            const result = await customerService.getById('customer-1', tenantId);

            expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'customer-1',
                    tenantId,
                },
            });
            expect(result).toEqual(mockCustomer);
        });

        it('should return null if customer not found', async () => {
            mockPrisma.customer.findUnique.mockResolvedValue(null);

            const result = await customerService.getById('non-existent', tenantId);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new customer', async () => {
            const customerData = {
                name: 'New Customer',
                email: 'new@test.com',
                phone: '1234567890',
            };

            const mockCustomer = factories.customer(customerData);
            mockPrisma.customer.create.mockResolvedValue(mockCustomer);

            const result = await customerService.create(customerData, tenantId);

            expect(mockPrisma.customer.create).toHaveBeenCalledWith({
                data: {
                    ...customerData,
                    tenantId,
                },
            });
            expect(result).toEqual(mockCustomer);
        });

        it('should throw error if required fields are missing', async () => {
            const invalidData = { email: 'test@test.com' }; // Missing name

            await expect(customerService.create(invalidData, tenantId))
                .rejects.toThrow();
        });
    });

    describe('update', () => {
        it('should update an existing customer', async () => {
            const updateData = { name: 'Updated Name' };
            const mockCustomer = factories.customer(updateData);

            mockPrisma.customer.update.mockResolvedValue(mockCustomer);

            const result = await customerService.update('customer-1', updateData, tenantId);

            expect(mockPrisma.customer.update).toHaveBeenCalledWith({
                where: {
                    id: 'customer-1',
                    tenantId,
                },
                data: updateData,
            });
            expect(result).toEqual(mockCustomer);
        });
    });

    describe('delete', () => {
        it('should delete a customer', async () => {
            const mockCustomer = factories.customer();
            mockPrisma.customer.delete.mockResolvedValue(mockCustomer);

            const result = await customerService.delete('customer-1', tenantId);

            expect(mockPrisma.customer.delete).toHaveBeenCalledWith({
                where: {
                    id: 'customer-1',
                    tenantId,
                },
            });
            expect(result).toEqual(mockCustomer);
        });
    });

    describe('search', () => {
        it('should search customers by query', async () => {
            const mockCustomers = [factories.customer({ name: 'Test Customer' })];
            mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);

            const result = await customerService.search('Test', tenantId);

            expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId,
                    OR: [
                        { name: { contains: 'Test', mode: 'insensitive' } },
                        { email: { contains: 'Test', mode: 'insensitive' } },
                        { phone: { contains: 'Test' } },
                    ],
                },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockCustomers);
        });
    });
});
