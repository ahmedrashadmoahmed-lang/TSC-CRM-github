/**
 * Egyptian E-Invoice Service
 * Integration with Egyptian Tax Authority (ETA) E-Invoice System
 */

import axios from 'axios';
import crypto from 'crypto';
import logger from '@/lib/logger';
import { prisma } from '@/lib/prisma';

class EInvoiceService {
    constructor() {
        this.baseURL = process.env.EINVOICE_BASE_URL || 'https://api.invoicing.eta.gov.eg';
        this.environment = process.env.EINVOICE_ENV || 'sandbox';
    }

    /**
     * Authenticate with ETA
     */
    async authenticate(config) {
        try {
            const response = await axios.post(`${this.baseURL}/connect/token`, {
                grant_type: 'client_credentials',
                client_id: config.clientId,
                client_secret: config.clientSecret,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            logger.info('ETA authentication successful');
            return response.data.access_token;
        } catch (error) {
            logger.error('ETA authentication failed', { error: error.message });
            throw new Error('Failed to authenticate with Egyptian Tax Authority');
        }
    }

    /**
     * Convert invoice to ETA format
     */
    formatInvoiceForETA(invoice, customer, items, tenant) {
        return {
            issuer: {
                name: tenant.name,
                id: tenant.taxNumber || '000000000',
                type: 'B', // Business
                address: {
                    branchID: tenant.branchId || '0',
                    country: 'EG',
                    governate: 'Cairo',
                    regionCity: 'Cairo',
                    street: tenant.address || 'N/A',
                    buildingNumber: '1',
                },
            },
            receiver: {
                name: customer.name,
                id: customer.taxNumber || '000000000',
                type: customer.taxNumber ? 'B' : 'P', // Business or Person
                address: {
                    country: 'EG',
                    governate: 'Cairo',
                    regionCity: 'Cairo',
                    street: customer.address || 'N/A',
                    buildingNumber: '1',
                },
            },
            documentType: 'I', // Invoice
            documentTypeVersion: '1.0',
            dateTimeIssued: invoice.issueDate.toISOString(),
            taxpayerActivityCode: '1000', // Your activity code
            internalID: invoice.invoiceNumber,
            invoiceLines: items.map((item, index) => ({
                description: item.description,
                itemType: 'GS1', // Goods
                itemCode: item.productId,
                unitType: 'EA', // Each
                quantity: item.quantity,
                unitValue: {
                    currencySold: 'EGP',
                    amountEGP: item.unitPrice,
                },
                salesTotal: item.quantity * item.unitPrice,
                total: item.total,
                valueDifference: 0,
                totalTaxableFees: 0,
                netTotal: item.total,
                itemsDiscount: item.discount || 0,
                internalCode: `LINE-${index + 1}`,
                taxableItems: [
                    {
                        taxType: 'T1', // VAT
                        amount: item.tax,
                        subType: 'V009', // 14% VAT
                        rate: 14,
                    },
                ],
            })),
            totalSalesAmount: invoice.subtotal,
            totalDiscountAmount: invoice.discount,
            netAmount: invoice.subtotal - invoice.discount,
            taxTotals: [
                {
                    taxType: 'T1',
                    amount: invoice.tax,
                },
            ],
            totalAmount: invoice.total,
            extraDiscountAmount: 0,
            totalItemsDiscountAmount: invoice.discount,
        };
    }

    /**
     * Submit invoice to ETA
     */
    async submitInvoice(invoiceId, tenantId) {
        try {
            // Get invoice with all related data
            const invoice = await prisma.invoice.findUnique({
                where: { id: invoiceId, tenantId },
                include: {
                    customer: true,
                    items: true,
                    tenant: true,
                },
            });

            if (!invoice) {
                throw new Error('Invoice not found');
            }

            // Get EInvoice config
            const config = await prisma.eInvoiceConfig.findUnique({
                where: { tenantId },
            });

            if (!config || !config.isActive) {
                throw new Error('E-Invoice not configured or inactive');
            }

            // Authenticate
            const token = await this.authenticate(config);

            // Format invoice
            const etaInvoice = this.formatInvoiceForETA(
                invoice,
                invoice.customer,
                invoice.items,
                invoice.tenant
            );

            // Submit to ETA
            const response = await axios.post(
                `${this.baseURL}/api/v1/documentsubmissions`,
                {
                    documents: [etaInvoice],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            logger.info('Invoice submitted to ETA', {
                invoiceId: invoice.id,
                submissionUUID: response.data.submissionId,
            });

            // Save submission record
            const submission = await prisma.eInvoiceSubmission.create({
                data: {
                    invoiceId: invoice.id,
                    tenantId,
                    submissionUUID: response.data.submissionId,
                    internalId: invoice.invoiceNumber,
                    status: 'submitted',
                    etaResponse: response.data,
                    submittedAt: new Date(),
                },
            });

            return {
                success: true,
                submissionUUID: response.data.submissionId,
                submission,
            };
        } catch (error) {
            logger.error('Failed to submit invoice to ETA', {
                invoiceId,
                error: error.message,
                response: error.response?.data,
            });

            // Save failed submission
            try {
                await prisma.eInvoiceSubmission.create({
                    data: {
                        invoiceId,
                        tenantId,
                        submissionUUID: `FAILED-${Date.now()}`,
                        internalId: `FAILED-${invoiceId}`,
                        status: 'rejected',
                        errorMessage: error.message,
                        etaResponse: error.response?.data || null,
                    },
                });
            } catch (dbError) {
                logger.error('Failed to save error submission', { error: dbError.message });
            }

            return {
                success: false,
                error: error.message,
                details: error.response?.data,
            };
        }
    }

    /**
     * Check submission status
     */
    async checkStatus(submissionUUID, tenantId) {
        try {
            const config = await prisma.eInvoiceConfig.findUnique({
                where: { tenantId },
            });

            if (!config) {
                throw new Error('E-Invoice not configured');
            }

            const token = await this.authenticate(config);

            const response = await axios.get(
                `${this.baseURL}/api/v1/documentsubmissions/${submissionUUID}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update submission status
            await prisma.eInvoiceSubmission.update({
                where: { submissionUUID },
                data: {
                    status: response.data.status,
                    etaResponse: response.data,
                    acceptedAt: response.data.status === 'accepted' ? new Date() : null,
                    rejectedAt: response.data.status === 'rejected' ? new Date() : null,
                },
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to check submission status', {
                submissionUUID,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Cancel invoice
     */
    async cancelInvoice(submissionUUID, reason, tenantId) {
        try {
            const config = await prisma.eInvoiceConfig.findUnique({
                where: { tenantId },
            });

            if (!config) {
                throw new Error('E-Invoice not configured');
            }

            const token = await this.authenticate(config);

            const response = await axios.post(
                `${this.baseURL}/api/v1/documentsubmissions/${submissionUUID}/cancel`,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            logger.info('Invoice cancelled in ETA', { submissionUUID });

            return response.data;
        } catch (error) {
            logger.error('Failed to cancel invoice', {
                submissionUUID,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get all submissions for tenant
     */
    async getSubmissions(tenantId, filters = {}) {
        return prisma.eInvoiceSubmission.findMany({
            where: {
                tenantId,
                ...filters,
            },
            include: {
                invoice: {
                    include: {
                        customer: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export default new EInvoiceService();
