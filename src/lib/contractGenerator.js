// Contract Generator for RFQ System
// Automatically generates contracts from selected quotes

class ContractGenerator {
    constructor() {
        this.templates = {
            standard: 'Standard Supply Contract',
            service: 'Service Agreement Contract',
            purchase: 'Purchase Order Contract',
            framework: 'Framework Agreement',
            custom: 'Custom Contract'
        };
    }

    /**
     * Generate contract from RFQ and selected quote
     */
    generateContract(rfq, quote, supplier, options = {}) {
        const {
            templateType = 'standard',
            includeTerms = true,
            includePaymentSchedule = false,
            includeDeliverySchedule = true,
            customClauses = []
        } = options;

        const contract = {
            contractNumber: this.generateContractNumber(rfq),
            title: `Supply Contract - ${rfq.title}`,
            date: new Date(),
            parties: this.generateParties(rfq, supplier),
            scope: this.generateScope(rfq, quote),
            items: this.generateItemsList(quote),
            pricing: this.generatePricing(quote),
            deliveryTerms: this.generateDeliveryTerms(rfq, quote),
            paymentTerms: this.generatePaymentTerms(quote, includePaymentSchedule),
            terms: includeTerms ? this.generateStandardTerms() : [],
            customClauses,
            signatures: this.generateSignatureSection(),
            metadata: {
                rfqNumber: rfq.rfqNumber,
                quoteReference: quote.quoteReference,
                generatedAt: new Date(),
                templateType
            }
        };

        return contract;
    }

    /**
     * Generate unique contract number
     */
    generateContractNumber(rfq) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `CNT-${year}${month}-${random}`;
    }

    /**
     * Generate parties section
     */
    generateParties(rfq, supplier) {
        return {
            buyer: {
                name: process.env.COMPANY_NAME || 'Your Company',
                address: process.env.COMPANY_ADDRESS || 'Company Address',
                registrationNumber: process.env.COMPANY_REG || 'Registration Number',
                taxId: process.env.COMPANY_TAX_ID || 'Tax ID',
                representative: rfq.createdByUser || 'Authorized Representative'
            },
            supplier: {
                name: supplier.name,
                address: supplier.address || 'Supplier Address',
                registrationNumber: supplier.registrationNumber || 'N/A',
                taxId: supplier.taxId || 'N/A',
                contactPerson: supplier.contactPerson || supplier.name,
                phone: supplier.phone || 'N/A',
                email: supplier.email || 'N/A'
            }
        };
    }

    /**
     * Generate scope section
     */
    generateScope(rfq, quote) {
        return {
            description: rfq.description,
            purpose: `Supply of goods/services as per RFQ ${rfq.rfqNumber}`,
            specifications: rfq.items.map(item => ({
                product: item.productName,
                quantity: item.quantity,
                unit: item.unit,
                specifications: item.specifications
            })),
            deliveryLocation: rfq.deliveryLocation || 'As specified by buyer',
            contractPeriod: {
                startDate: new Date(),
                endDate: quote.deliveryTime ? this.calculateEndDate(quote.deliveryTime) : null
            }
        };
    }

    /**
     * Generate items list with pricing
     */
    generateItemsList(quote) {
        return quote.items.map((item, index) => ({
            itemNumber: index + 1,
            description: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.total,
            specifications: item.specifications || {},
            notes: item.notes || ''
        }));
    }

    /**
     * Generate pricing section
     */
    generatePricing(quote) {
        const subtotal = quote.totalPrice;
        const taxRate = 0.14; // 14% VAT (adjust as needed)
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        return {
            currency: quote.currency || 'EGP',
            subtotal,
            tax: {
                rate: taxRate * 100,
                amount: tax
            },
            total,
            paymentTerms: quote.paymentTerms || 'As agreed',
            priceValidity: quote.validityPeriod ? `${quote.validityPeriod} days` : 'As quoted'
        };
    }

    /**
     * Generate delivery terms
     */
    generateDeliveryTerms(rfq, quote) {
        return {
            deliveryTime: quote.deliveryTime,
            deliveryLocation: rfq.deliveryLocation || 'Buyer premises',
            deliveryMethod: quote.deliveryMethod || 'As per supplier standard',
            incoterms: quote.incoterms || 'DDP',
            packagingRequirements: rfq.packagingRequirements || 'Standard packaging',
            inspectionRights: 'Buyer reserves the right to inspect goods upon delivery'
        };
    }

    /**
     * Generate payment terms
     */
    generatePaymentTerms(quote, includeSchedule = false) {
        const terms = {
            method: quote.paymentMethod || 'Bank transfer',
            terms: quote.paymentTerms || 'Net 30',
            currency: quote.currency || 'EGP',
            bankDetails: 'To be provided separately'
        };

        if (includeSchedule) {
            terms.schedule = this.generatePaymentSchedule(quote);
        }

        return terms;
    }

    /**
     * Generate payment schedule
     */
    generatePaymentSchedule(quote) {
        const total = quote.totalPrice;

        // Example schedule: 50% advance, 50% on delivery
        return [
            {
                milestone: 'Contract Signing',
                percentage: 50,
                amount: total * 0.5,
                dueDate: 'Upon contract signing'
            },
            {
                milestone: 'Delivery & Acceptance',
                percentage: 50,
                amount: total * 0.5,
                dueDate: 'Upon delivery and acceptance'
            }
        ];
    }

    /**
     * Generate standard terms and conditions
     */
    generateStandardTerms() {
        return [
            {
                clause: 'Quality Assurance',
                content: 'The Supplier warrants that all goods/services shall conform to the specifications and be free from defects in material and workmanship.'
            },
            {
                clause: 'Warranty',
                content: 'The Supplier provides a warranty period of 12 months from the date of delivery for all goods supplied under this contract.'
            },
            {
                clause: 'Delivery',
                content: 'Time is of the essence. The Supplier shall deliver the goods within the agreed timeframe. Delays must be notified immediately in writing.'
            },
            {
                clause: 'Inspection and Acceptance',
                content: 'The Buyer reserves the right to inspect all goods upon delivery and reject any non-conforming items.'
            },
            {
                clause: 'Payment',
                content: 'Payment shall be made according to the agreed payment terms, subject to satisfactory delivery and acceptance of goods/services.'
            },
            {
                clause: 'Force Majeure',
                content: 'Neither party shall be liable for failure to perform due to causes beyond reasonable control, including but not limited to acts of God, war, strikes, or government restrictions.'
            },
            {
                clause: 'Confidentiality',
                content: 'Both parties agree to maintain confidentiality of all information exchanged in connection with this contract.'
            },
            {
                clause: 'Intellectual Property',
                content: 'All intellectual property rights in the goods remain with the respective party unless otherwise agreed in writing.'
            },
            {
                clause: 'Dispute Resolution',
                content: 'Any disputes arising from this contract shall be resolved through good faith negotiations. If unresolved, disputes shall be subject to arbitration under applicable law.'
            },
            {
                clause: 'Termination',
                content: 'Either party may terminate this contract with 30 days written notice for material breach, subject to cure period.'
            },
            {
                clause: 'Governing Law',
                content: 'This contract shall be governed by and construed in accordance with the laws of [Jurisdiction].'
            },
            {
                clause: 'Amendments',
                content: 'Any amendments to this contract must be made in writing and signed by both parties.'
            }
        ];
    }

    /**
     * Generate signature section
     */
    generateSignatureSection() {
        return {
            buyer: {
                signatureLabel: 'For and on behalf of Buyer',
                name: '',
                title: '',
                date: null,
                signature: null
            },
            supplier: {
                signatureLabel: 'For and on behalf of Supplier',
                name: '',
                title: '',
                date: null,
                signature: null
            }
        };
    }

    /**
     * Generate contract as HTML
     */
    generateHTML(contract) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contract ${contract.contractNumber}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .contract-number {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 2px solid #666;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .parties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        .party {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
        .party h3 {
            margin-top: 0;
            color: #2563eb;
        }
        .party p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table th {
            background: #f3f4f6;
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
        }
        table td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        .pricing-summary {
            margin-left: auto;
            width: 300px;
            border: 2px solid #333;
            padding: 15px;
        }
        .pricing-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .total-row {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
        }
        .terms .clause {
            margin: 15px 0;
        }
        .clause-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 50px;
        }
        .signature-block {
            border-top: 2px solid #333;
            padding-top: 10px;
        }
        .signature-line {
            border-bottom: 1px solid #333;
            height: 60px;
            margin: 20px 0;
        }
        @media print {
            body {
                padding: 20px;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${contract.title}</h1>
        <div class="contract-number">Contract No: ${contract.contractNumber}</div>
        <div class="contract-number">Date: ${new Date(contract.date).toLocaleDateString()}</div>
    </div>

    <div class="section">
        <div class="section-title">PARTIES TO THE CONTRACT</div>
        <div class="parties">
            <div class="party">
                <h3>BUYER</h3>
                <p><strong>${contract.parties.buyer.name}</strong></p>
                <p>${contract.parties.buyer.address}</p>
                <p>Reg: ${contract.parties.buyer.registrationNumber}</p>
                <p>Tax ID: ${contract.parties.buyer.taxId}</p>
                <p>Representative: ${contract.parties.buyer.representative}</p>
            </div>
            <div class="party">
                <h3>SUPPLIER</h3>
                <p><strong>${contract.parties.supplier.name}</strong></p>
                <p>${contract.parties.supplier.address}</p>
                <p>Reg: ${contract.parties.supplier.registrationNumber}</p>
                <p>Tax ID: ${contract.parties.supplier.taxId}</p>
                <p>Contact: ${contract.parties.supplier.contactPerson}</p>
                <p>Phone: ${contract.parties.supplier.phone}</p>
                <p>Email: ${contract.parties.supplier.email}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">SCOPE OF WORK</div>
        <p><strong>Purpose:</strong> ${contract.scope.purpose}</p>
        <p><strong>Description:</strong> ${contract.scope.description || 'As per items list below'}</p>
    </div>

    <div class="section">
        <div class="section-title">ITEMS / PRODUCTS</div>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${contract.items.map(item => `
                    <tr>
                        <td>${item.itemNumber}</td>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit}</td>
                        <td>${item.unitPrice.toFixed(2)}</td>
                        <td>${item.totalPrice.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="pricing-summary">
            <div class="pricing-row">
                <span>Subtotal:</span>
                <span>${contract.pricing.subtotal.toFixed(2)} ${contract.pricing.currency}</span>
            </div>
            <div class="pricing-row">
                <span>Tax (${contract.pricing.tax.rate}%):</span>
                <span>${contract.pricing.tax.amount.toFixed(2)} ${contract.pricing.currency}</span>
            </div>
            <div class="pricing-row total-row">
                <span>TOTAL:</span>
                <span>${contract.pricing.total.toFixed(2)} ${contract.pricing.currency}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DELIVERY TERMS</div>
        <p><strong>Delivery Time:</strong> ${contract.deliveryTerms.deliveryTime}</p>
        <p><strong>Delivery Location:</strong> ${contract.deliveryTerms.deliveryLocation}</p>
        <p><strong>Delivery Method:</strong> ${contract.deliveryTerms.deliveryMethod}</p>
        <p><strong>Incoterms:</strong> ${contract.deliveryTerms.incoterms}</p>
    </div>

    <div class="section">
        <div class="section-title">PAYMENT TERMS</div>
        <p><strong>Payment Method:</strong> ${contract.paymentTerms.method}</p>
        <p><strong>Payment Terms:</strong> ${contract.paymentTerms.terms}</p>
        <p><strong>Currency:</strong> ${contract.paymentTerms.currency}</p>
        ${contract.paymentTerms.schedule ? `
            <table>
                <thead>
                    <tr>
                        <th>Milestone</th>
                        <th>Percentage</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${contract.paymentTerms.schedule.map(item => `
                        <tr>
                            <td>${item.milestone}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.amount.toFixed(2)} ${contract.paymentTerms.currency}</td>
                            <td>${item.dueDate}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : ''}
    </div>

    ${contract.terms.length > 0 ? `
    <div class="section terms">
        <div class="section-title">TERMS AND CONDITIONS</div>
        ${contract.terms.map((term, index) => `
            <div class="clause">
                <div class="clause-title">${index + 1}. ${term.clause}</div>
                <p>${term.content}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${contract.customClauses.length > 0 ? `
    <div class="section">
        <div class="section-title">SPECIAL CONDITIONS</div>
        ${contract.customClauses.map((clause, index) => `
            <div class="clause">
                <div class="clause-title">${index + 1}. ${clause.title}</div>
                <p>${clause.content}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">SIGNATURES</div>
        <div class="signatures">
            <div class="signature-block">
                <p><strong>${contract.signatures.buyer.signatureLabel}</strong></p>
                <div class="signature-line"></div>
                <p>Name: _______________________</p>
                <p>Title: _______________________</p>
                <p>Date: _______________________</p>
            </div>
            <div class="signature-block">
                <p><strong>${contract.signatures.supplier.signatureLabel}</strong></p>
                <div class="signature-line"></div>
                <p>Name: _______________________</p>
                <p>Title: _______________________</p>
                <p>Date: _______________________</p>
            </div>
        </div>
    </div>

    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
            Print Contract
        </button>
    </div>
</body>
</html>
        `;
    }

    /**
     * Calculate end date from delivery time string
     */
    calculateEndDate(deliveryTime) {
        const days = parseInt(deliveryTime);
        if (isNaN(days)) {
            return null;
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        return endDate;
    }

    /**
     * Export contract as PDF (placeholder - requires PDF library in production)
     */
    async exportToPDF(contract) {
        // In production, use libraries like pdfmake, jsPDF, or puppeteer
        // For now, return HTML for browser printing
        return {
            format: 'html',
            content: this.generateHTML(contract),
            filename: `Contract_${contract.contractNumber}.html`
        };
    }

    /**
     * Generate contract preview
     */
    generatePreview(rfq, quote, supplier) {
        const contract = this.generateContract(rfq, quote, supplier);
        return {
            contractNumber: contract.contractNumber,
            summary: {
                buyer: contract.parties.buyer.name,
                supplier: contract.parties.supplier.name,
                value: `${contract.pricing.total.toFixed(2)} ${contract.pricing.currency}`,
                deliveryTime: contract.deliveryTerms.deliveryTime,
                itemsCount: contract.items.length
            }
        };
    }
}

// Export singleton instance
const contractGenerator = new ContractGenerator();
export default contractGenerator;
