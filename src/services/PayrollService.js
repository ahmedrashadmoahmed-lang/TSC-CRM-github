import { getTenantPrisma } from '@/lib/prisma';
import { logAudit, AUDIT_ACTIONS } from '@/lib/auditLogger';

export class PayrollService {
    constructor(tenantId, userId, userName, userEmail) {
        this.tenantId = tenantId;
        this.prisma = getTenantPrisma(tenantId);
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    // Create payroll entry
    async createPayroll(data, request = null) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: data.employeeId },
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Calculate deductions and net salary
        const grossSalary = data.grossSalary || employee.salary;
        const deductions = data.deductions || 0;
        const bonuses = data.bonuses || 0;
        const netSalary = grossSalary + bonuses - deductions;

        const payroll = await this.prisma.payroll.create({
            data: {
                employeeId: data.employeeId,
                month: data.month,
                year: data.year,
                grossSalary,
                deductions,
                bonuses,
                netSalary,
                status: 'pending',
                notes: data.notes || null,
            },
            include: {
                employee: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.CREATE,
            entity: 'Payroll',
            entityId: payroll.id,
            after: payroll,
            request,
        });

        return payroll;
    }

    // Update payroll
    async updatePayroll(id, data, request = null) {
        const existing = await this.prisma.payroll.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error('Payroll entry not found');
        }

        if (existing.status === 'paid') {
            throw new Error('Cannot update paid payroll');
        }

        // Recalculate net salary if any component changed
        const grossSalary = data.grossSalary ?? existing.grossSalary;
        const deductions = data.deductions ?? existing.deductions;
        const bonuses = data.bonuses ?? existing.bonuses;
        const netSalary = grossSalary + bonuses - deductions;

        const updated = await this.prisma.payroll.update({
            where: { id },
            data: {
                ...(data.grossSalary !== undefined && { grossSalary: data.grossSalary }),
                ...(data.deductions !== undefined && { deductions: data.deductions }),
                ...(data.bonuses !== undefined && { bonuses: data.bonuses }),
                netSalary,
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: {
                employee: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Payroll',
            entityId: id,
            before: existing,
            after: updated,
            request,
        });

        return updated;
    }

    // Approve payroll
    async approvePayroll(id, request = null) {
        const payroll = await this.prisma.payroll.findUnique({
            where: { id },
        });

        if (!payroll) {
            throw new Error('Payroll entry not found');
        }

        if (payroll.status !== 'pending') {
            throw new Error('Only pending payroll can be approved');
        }

        const updated = await this.prisma.payroll.update({
            where: { id },
            data: {
                status: 'approved',
                approvedBy: this.userId,
                approvedAt: new Date(),
            },
            include: {
                employee: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.APPROVE,
            entity: 'Payroll',
            entityId: id,
            before: payroll,
            after: updated,
            request,
        });

        return updated;
    }

    // Mark as paid
    async markAsPaid(id, paymentDate = null, request = null) {
        const payroll = await this.prisma.payroll.findUnique({
            where: { id },
        });

        if (!payroll) {
            throw new Error('Payroll entry not found');
        }

        if (payroll.status !== 'approved') {
            throw new Error('Only approved payroll can be marked as paid');
        }

        const updated = await this.prisma.payroll.update({
            where: { id },
            data: {
                status: 'paid',
                paidDate: paymentDate ? new Date(paymentDate) : new Date(),
            },
            include: {
                employee: true,
            },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.UPDATE,
            entity: 'Payroll',
            entityId: id,
            before: payroll,
            after: updated,
            metadata: { action: 'paid' },
            request,
        });

        return updated;
    }

    // Delete payroll
    async deletePayroll(id, request = null) {
        const payroll = await this.prisma.payroll.findUnique({
            where: { id },
            include: { employee: true },
        });

        if (!payroll) {
            throw new Error('Payroll entry not found');
        }

        if (payroll.status === 'paid') {
            throw new Error('Cannot delete paid payroll');
        }

        await this.prisma.payroll.delete({
            where: { id },
        });

        await logAudit({
            tenantId: this.tenantId,
            userId: this.userId,
            userName: this.userName,
            userEmail: this.userEmail,
            action: AUDIT_ACTIONS.DELETE,
            entity: 'Payroll',
            entityId: id,
            before: payroll,
            request,
        });

        return { success: true };
    }

    // Get payroll entries with filters
    async getPayrollEntries(filters = {}) {
        const where = {};

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        if (filters.employeeId) {
            where.employeeId = filters.employeeId;
        }

        if (filters.month) {
            where.month = filters.month;
        }

        if (filters.year) {
            where.year = filters.year;
        }

        return await this.prisma.payroll.findMany({
            where,
            include: {
                employee: true,
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
            ],
        });
    }

    // Get payroll statistics
    async getStatistics(year = null, month = null) {
        const where = {};
        if (year) where.year = year;
        if (month) where.month = month;

        const [total, pending, approved, paid] = await Promise.all([
            this.prisma.payroll.aggregate({
                where,
                _sum: { netSalary: true, grossSalary: true, deductions: true, bonuses: true },
                _count: true,
            }),
            this.prisma.payroll.aggregate({
                where: { ...where, status: 'pending' },
                _sum: { netSalary: true },
                _count: true,
            }),
            this.prisma.payroll.aggregate({
                where: { ...where, status: 'approved' },
                _sum: { netSalary: true },
                _count: true,
            }),
            this.prisma.payroll.aggregate({
                where: { ...where, status: 'paid' },
                _sum: { netSalary: true },
                _count: true,
            }),
        ]);

        return {
            totalGrossSalary: total._sum.grossSalary || 0,
            totalDeductions: total._sum.deductions || 0,
            totalBonuses: total._sum.bonuses || 0,
            totalNetSalary: total._sum.netSalary || 0,
            totalEntries: total._count,
            pendingAmount: pending._sum.netSalary || 0,
            pendingCount: pending._count,
            approvedAmount: approved._sum.netSalary || 0,
            approvedCount: approved._count,
            paidAmount: paid._sum.netSalary || 0,
            paidCount: paid._count,
        };
    }

    // Generate payroll for all employees
    async generateMonthlyPayroll(month, year, request = null) {
        const employees = await this.prisma.employee.findMany({
            where: { status: 'active' },
        });

        const payrolls = [];

        for (const employee of employees) {
            // Check if payroll already exists
            const existing = await this.prisma.payroll.findFirst({
                where: {
                    employeeId: employee.id,
                    month,
                    year,
                },
            });

            if (!existing) {
                const payroll = await this.createPayroll({
                    employeeId: employee.id,
                    month,
                    year,
                    grossSalary: employee.salary,
                    deductions: 0,
                    bonuses: 0,
                }, request);

                payrolls.push(payroll);
            }
        }

        return payrolls;
    }

    // Get employee payroll history
    async getEmployeeHistory(employeeId) {
        return await this.prisma.payroll.findMany({
            where: { employeeId },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
            ],
        });
    }
}
