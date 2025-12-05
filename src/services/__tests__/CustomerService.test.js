import * as prismaLib from '@/lib/prisma';
import { createMockPrismaClient, factories } from '@/utils/test-utils';
import { CustomerService } from '../CustomerService';

// Mock the prisma lib
jest.mock('@/lib/prisma', () => ({
  getTenantPrisma: jest.fn(),
}));

describe('CustomerService', () => {
  let mockPrisma;
  let customerService;
  const tenantId = 'test-tenant-id';
  const userId = 'user-1';
  const userName = 'Test User';
  const userEmail = 'test@example.com';

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    // Setup the mock to return our mockPrisma when getTenantPrisma is called
    prismaLib.getTenantPrisma.mockReturnValue(mockPrisma);

    // Instantiate with correct arguments: tenantId, userId, userName, userEmail
    customerService = new CustomerService(tenantId, userId, userName, userEmail);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomers', () => {
    it('should return all customers for a tenant', async () => {
      const mockCustomers = [
        factories.customer(),
        factories.customer({ id: 'customer-2', name: 'Customer 2' }),
      ];

      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);

      const result = await customerService.getCustomers({ status: 'all', type: 'all' });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          invoices: {
            take: 5,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockCustomers);
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.customer.findMany.mockRejectedValue(new Error('Database error'));

      await expect(customerService.getCustomers({ status: 'all' })).rejects.toThrow(
        'Database error'
      );
    });

    it('should search customers by query', async () => {
      const mockCustomers = [factories.customer({ name: 'Test Customer' })];
      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);

      const result = await customerService.getCustomers({ search: 'Test' });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { email: { contains: 'Test', mode: 'insensitive' } },
            { phone: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        include: {
          invoices: {
            take: 5,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockCustomers);
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by ID', async () => {
      const mockCustomer = factories.customer();
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await customerService.getCustomerById('customer-1');

      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        include: {
          invoices: {
            orderBy: { date: 'desc' },
          },
        },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should return null if customer not found', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      const result = await customerService.getCustomerById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'new@test.com',
        phone: '1234567890',
        type: 'individual',
      };

      const mockCustomer = factories.customer(customerData);
      mockPrisma.customer.create.mockResolvedValue(mockCustomer);

      const result = await customerService.createCustomer(customerData);

      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: null,
          type: customerData.type,
          status: 'active',
        },
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('updateCustomer', () => {
    it('should update an existing customer', async () => {
      const updateData = { name: 'Updated Name' };
      const mockCustomer = factories.customer(updateData);
      const existingCustomer = factories.customer();

      mockPrisma.customer.findUnique.mockResolvedValue(existingCustomer);
      mockPrisma.customer.update.mockResolvedValue(mockCustomer);

      const result = await customerService.updateCustomer('customer-1', updateData);

      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        data: { name: 'Updated Name' },
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      const mockCustomer = factories.customer();
      mockCustomer.invoices = []; // Ensure no invoices so delete can proceed

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.delete.mockResolvedValue(mockCustomer);

      const result = await customerService.deleteCustomer('customer-1');

      expect(mockPrisma.customer.delete).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
