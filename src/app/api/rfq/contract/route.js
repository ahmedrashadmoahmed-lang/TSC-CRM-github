// Contract Generation API for RFQ System
// Automatically generates contracts from selected quotes

import { NextResponse } from 'next/server';
import contractGenerator from '@/lib/contractGenerator';
import { prisma } from '@/lib/prisma';

/**
 * POST: Generate contract
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, tenantId } = body;

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId required'
            }, { status: 400 });
        }

        switch (action) {
            case 'generate': {
                // Generate contract from RFQ and selected quote
                const { rfqId, quoteId, options } = body;

                if (!rfqId || !quoteId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId and quoteId required'
                    }, { status: 400 });
                }

                // Fetch RFQ with items
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId },
                    include: {
                        items: true
                    }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                // Fetch quote with items and supplier
                const quote = await prisma.supplierQuote.findUnique({
                    where: { id: quoteId },
                    include: {
                        items: true,
                        supplier: true
                    }
                });

                if (!quote || quote.rfqId !== rfqId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Quote not found or does not belong to this RFQ'
                    }, { status: 404 });
                }

                // Generate contract
                const contract = contractGenerator.generateContract(
                    rfq,
                    quote,
                    quote.supplier,
                    options || {}
                );

                // Save contract to database
                const savedContract = await prisma.contract.create({
                    data: {
                        tenantId,
                        contractNumber: contract.contractNumber,
                        title: contract.title,
                        rfqId,
                        quoteId,
                        supplierId: quote.supplierId,
                        content: JSON.stringify(contract),
                        totalAmount: contract.pricing.total,
                        currency: contract.pricing.currency,
                        status: 'draft',
                        createdAt: new Date()
                    }
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        contract,
                        contractId: savedContract.id
                    }
                });
            }

            case 'preview': {
                // Generate contract preview
                const { rfqId, quoteId } = body;

                if (!rfqId || !quoteId) {
                    return NextResponse.json({
                        success: false,
                        error: 'rfqId and quoteId required'
                    }, { status: 400 });
                }

                // Fetch RFQ
                const rfq = await prisma.rFQ.findUnique({
                    where: { id: rfqId },
                    include: { items: true }
                });

                if (!rfq || rfq.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'RFQ not found or unauthorized'
                    }, { status: 404 });
                }

                // Fetch quote with supplier
                const quote = await prisma.supplierQuote.findUnique({
                    where: { id: quoteId },
                    include: {
                        items: true,
                        supplier: true
                    }
                });

                if (!quote || quote.rfqId !== rfqId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Quote not found'
                    }, { status: 404 });
                }

                const preview = contractGenerator.generatePreview(rfq, quote, quote.supplier);

                return NextResponse.json({
                    success: true,
                    data: preview
                });
            }

            case 'export-html': {
                // Export contract as HTML
                const { contractId } = body;

                if (!contractId) {
                    return NextResponse.json({
                        success: false,
                        error: 'contractId required'
                    }, { status: 400 });
                }

                // Fetch contract
                const savedContract = await prisma.contract.findUnique({
                    where: { id: contractId }
                });

                if (!savedContract || savedContract.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Contract not found or unauthorized'
                    }, { status: 404 });
                }

                const contract = JSON.parse(savedContract.content);
                const html = contractGenerator.generateHTML(contract);

                return NextResponse.json({
                    success: true,
                    data: {
                        html,
                        filename: `Contract_${contract.contractNumber}.html`
                    }
                });
            }

            case 'update-status': {
                // Update contract status
                const { contractId, status } = body;

                if (!contractId || !status) {
                    return NextResponse.json({
                        success: false,
                        error: 'contractId and status required'
                    }, { status: 400 });
                }

                const validStatuses = ['draft', 'pending_approval', 'approved', 'signed', 'active', 'completed', 'terminated'];
                if (!validStatuses.includes(status)) {
                    return NextResponse.json({
                        success: false,
                        error: 'Invalid status'
                    }, { status: 400 });
                }

                // Update contract
                const updated = await prisma.contract.update({
                    where: {
                        id: contractId,
                        tenantId // Ensure tenant owns the contract
                    },
                    data: {
                        status,
                        updatedAt: new Date()
                    }
                });

                return NextResponse.json({
                    success: true,
                    data: updated
                });
            }

            case 'add-signature': {
                // Add signature to contract
                const { contractId, party, signatureData } = body;

                if (!contractId || !party || !signatureData) {
                    return NextResponse.json({
                        success: false,
                        error: 'contractId, party, and signatureData required'
                    }, { status: 400 });
                }

                // Fetch contract
                const savedContract = await prisma.contract.findUnique({
                    where: { id: contractId }
                });

                if (!savedContract || savedContract.tenantId !== tenantId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Contract not found or unauthorized'
                    }, { status: 404 });
                }

                const contract = JSON.parse(savedContract.content);

                // Update signature
                if (party === 'buyer' || party === 'supplier') {
                    contract.signatures[party] = {
                        ...contract.signatures[party],
                        ...signatureData,
                        date: new Date()
                    };
                }

                // Check if both parties have signed
                const bothSigned = contract.signatures.buyer.signature && contract.signatures.supplier.signature;
                const newStatus = bothSigned ? 'signed' : savedContract.status;

                // Update contract
                const updated = await prisma.contract.update({
                    where: { id: contractId },
                    data: {
                        content: JSON.stringify(contract),
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        contract: JSON.parse(updated.content),
                        status: updated.status
                    }
                });
            }

            default: {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
            }
        }

    } catch (error) {
        console.error('Error in contract API:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * GET: Fetch contracts
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const contractId = searchParams.get('contractId');
        const rfqId = searchParams.get('rfqId');
        const status = searchParams.get('status');

        if (!tenantId) {
            return NextResponse.json({
                success: false,
                error: 'tenantId required'
            }, { status: 400 });
        }

        // Fetch single contract
        if (contractId) {
            const contract = await prisma.contract.findUnique({
                where: { id: contractId },
                include: {
                    rfq: true,
                    quote: true,
                    supplier: true
                }
            });

            if (!contract || contract.tenantId !== tenantId) {
                return NextResponse.json({
                    success: false,
                    error: 'Contract not found or unauthorized'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: {
                    ...contract,
                    content: JSON.parse(contract.content)
                }
            });
        }

        // Build query
        const where = { tenantId };
        if (rfqId) where.rfqId = rfqId;
        if (status) where.status = status;

        // Fetch contracts list
        const contracts = await prisma.contract.findMany({
            where,
            include: {
                rfq: true,
                supplier: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: contracts.map(c => ({
                ...c,
                content: undefined, // Don't send full content in list
                summary: JSON.parse(c.content).metadata
            }))
        });

    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

