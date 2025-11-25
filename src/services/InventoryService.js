import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class InventoryService {
    constructor(tenantId, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Record inventory movement
    async recordMovement(data, request = null) {
        const movement = await this.prisma.inventoryMovement.create({
            data: {
                productId: data.productId,
                warehouseId: data.warehouseId,
                type: data.type, // IN, OUT, TRANSFER, ADJUSTMENT
                quantity: data.quantity,
                unitCost: data.unitCost || null,
                referenceType: data.referenceType || null,
                referenceId: data.referenceId || null,
                referenceNumber: data.referenceNumber || null,
                notes: data.notes || null,
                performedBy: this.userId,
                performedAt: new Date(),
            },
            include: {
                product: true,
                warehouse: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'InventoryMovement',
            entityId: movement.id,
            after: movement,
            metadata: {
                productId: data.productId,
                warehouseId: data.warehouseId,
                type: data.type,
                quantity: data.quantity,
            },
            request,
        });

        return movement;
    }

    // Get current stock level for a product in a warehouse
    async getStockLevel(productId, warehouseId) {
        const movements = await this.prisma.inventoryMovement.findMany({
            where: {
                productId,
                warehouseId,
            },
        });

        let stock = 0;
        for (const movement of movements) {
            if (movement.type === 'IN' || movement.type === 'ADJUSTMENT_IN') {
                stock += movement.quantity;
            } else if (movement.type === 'OUT' || movement.type === 'ADJUSTMENT_OUT') {
                stock -= movement.quantity;
            }
        }

        return stock;
    }

    // Get stock levels for all products in a warehouse
    async getWarehouseStock(warehouseId) {
        const movements = await this.prisma.inventoryMovement.findMany({
            where: { warehouseId },
            include: { product: true },
        });

        const stockMap = new Map();

        for (const movement of movements) {
            const current = stockMap.get(movement.productId) || 0;

            if (movement.type === 'IN' || movement.type === 'ADJUSTMENT_IN') {
                stockMap.set(movement.productId, current + movement.quantity);
            } else if (movement.type === 'OUT' || movement.type === 'ADJUSTMENT_OUT') {
                stockMap.set(movement.productId, current - movement.quantity);
            }
        }

        const products = await this.prisma.product.findMany({
            where: {
                id: { in: Array.from(stockMap.keys()) },
            },
        });

        return products.map(product => ({
            product,
            stock: stockMap.get(product.id) || 0,
            minStock: product.minStock,
            status: (stockMap.get(product.id) || 0) <= product.minStock ? 'low' : 'ok',
        }));
    }

    // Transfer stock between warehouses
    async transferStock(data, request = null) {
        const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = data;

        // Check if source has enough stock
        const sourceStock = await this.getStockLevel(productId, fromWarehouseId);
        if (sourceStock < quantity) {
            throw new Error('Insufficient stock in source warehouse');
        }

        // Record OUT movement from source
        await this.recordMovement({
            productId,
            warehouseId: fromWarehouseId,
            type: 'OUT',
            quantity,
            referenceType: 'TRANSFER',
            notes: `Transfer to warehouse ${toWarehouseId}`,
        }, request);

        // Record IN movement to destination
        await this.recordMovement({
            productId,
            warehouseId: toWarehouseId,
            type: 'IN',
            quantity,
            referenceType: 'TRANSFER',
            notes: `Transfer from warehouse ${fromWarehouseId}`,
        }, request);

        return { success: true };
    }

    // Adjust stock (for corrections)
    async adjustStock(data, request = null) {
        const { productId, warehouseId, newQuantity, reason } = data;

        const currentStock = await this.getStockLevel(productId, warehouseId);
        const difference = newQuantity - currentStock;

        if (difference === 0) {
            return { success: true, message: 'No adjustment needed' };
        }

        const type = difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
        const quantity = Math.abs(difference);

        await this.recordMovement({
            productId,
            warehouseId,
            type,
            quantity,
            referenceType: 'ADJUSTMENT',
            notes: reason,
        }, request);

        return { success: true, adjustment: difference };
    }

    // Get low stock products
    async getLowStockProducts(warehouseId = null) {
        const products = await this.prisma.product.findMany({
            where: {
                status: 'active',
            },
        });

        const lowStockProducts = [];

        for (const product of products) {
            if (warehouseId) {
                const stock = await this.getStockLevel(product.id, warehouseId);
                if (stock <= product.minStock) {
                    lowStockProducts.push({
                        product,
                        warehouseId,
                        currentStock: stock,
                        minStock: product.minStock,
                        shortage: product.minStock - stock,
                    });
                }
            } else {
                // Check all warehouses
                const warehouses = await this.prisma.warehouse.findMany({
                    where: { isActive: true },
                });

                for (const warehouse of warehouses) {
                    const stock = await this.getStockLevel(product.id, warehouse.id);
                    if (stock <= product.minStock) {
                        lowStockProducts.push({
                            product,
                            warehouse,
                            currentStock: stock,
                            minStock: product.minStock,
                            shortage: product.minStock - stock,
                        });
                    }
                }
            }
        }

        return lowStockProducts;
    }

    // Calculate COGS (Cost of Goods Sold) using FIFO
    async calculateCOGS(productId, quantity, method = 'FIFO') {
        const movements = await this.prisma.inventoryMovement.findMany({
            where: {
                productId,
                type: 'IN',
                unitCost: { not: null },
            },
            orderBy: {
                performedAt: method === 'FIFO' ? 'asc' : 'desc',
            },
        });

        let remainingQty = quantity;
        let totalCost = 0;

        for (const movement of movements) {
            if (remainingQty <= 0) break;

            const qtyToUse = Math.min(remainingQty, movement.quantity);
            totalCost += qtyToUse * movement.unitCost;
            remainingQty -= qtyToUse;
        }

        if (remainingQty > 0) {
            throw new Error('Insufficient inventory for COGS calculation');
        }

        return {
            quantity,
            totalCost,
            averageCost: totalCost / quantity,
            method,
        };
    }

    // Get inventory movements history
    async getMovementHistory(filters = {}) {
        const where = {};

        if (filters.productId) where.productId = filters.productId;
        if (filters.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters.type) where.type = filters.type;

        if (filters.startDate && filters.endDate) {
            where.performedAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        return await this.prisma.inventoryMovement.findMany({
            where,
            include: {
                product: true,
                warehouse: true,
            },
            orderBy: {
                performedAt: 'desc',
            },
            take: filters.limit || 100,
        });
    }

    // Get inventory valuation
    async getInventoryValuation(warehouseId = null) {
        const products = await this.prisma.product.findMany({
            where: { status: 'active' },
        });

        let totalValue = 0;
        const valuationDetails = [];

        for (const product of products) {
            if (warehouseId) {
                const stock = await this.getStockLevel(product.id, warehouseId);
                const value = stock * product.cost;
                totalValue += value;

                valuationDetails.push({
                    product,
                    stock,
                    unitCost: product.cost,
                    totalValue: value,
                });
            } else {
                const warehouses = await this.prisma.warehouse.findMany({
                    where: { isActive: true },
                });

                for (const warehouse of warehouses) {
                    const stock = await this.getStockLevel(product.id, warehouse.id);
                    const value = stock * product.cost;
                    totalValue += value;

                    valuationDetails.push({
                        product,
                        warehouse,
                        stock,
                        unitCost: product.cost,
                        totalValue: value,
                    });
                }
            }
        }

        return {
            totalValue,
            details: valuationDetails,
        };
    }
}
