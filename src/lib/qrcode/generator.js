import QRCode from 'qrcode';

/**
 * QR Code Generator for PO System
 */

export async function generatePOQRCode(poData) {
    const {
        id,
        poNumber,
        supplier,
        totalAmount,
        items
    } = poData;

    const qrData = {
        type: 'PO',
        id,
        number: poNumber,
        supplier: supplier?.name,
        amount: totalAmount,
        itemCount: items?.length || 0,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/po/${id}`
    };

    try {
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return {
            success: true,
            dataURL: qrCodeDataURL,
            data: qrData
        };
    } catch (error) {
        console.error('QR Code generation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate QR code for shipment tracking
 */
export async function generateShipmentQRCode(shipmentData) {
    const {
        id,
        shipmentNumber,
        trackingNumber,
        carrier,
        status
    } = shipmentData;

    const qrData = {
        type: 'SHIPMENT',
        id,
        number: shipmentNumber,
        tracking: trackingNumber,
        carrier,
        status,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/shipment/${id}`
    };

    try {
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 250,
            margin: 2
        });

        return {
            success: true,
            dataURL: qrCodeDataURL,
            data: qrData
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate QR code for product with serial number
 */
export async function generateProductQRCode(productData) {
    const {
        id,
        sku,
        name,
        serialNumber,
        batchNumber
    } = productData;

    const qrData = {
        type: 'PRODUCT',
        id,
        sku,
        name,
        serial: serialNumber,
        batch: batchNumber,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${id}`
    };

    try {
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 200,
            margin: 1
        });

        return {
            success: true,
            dataURL: qrCodeDataURL,
            data: qrData
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate barcode (Code128) for product SKU
 */
export async function generateBarcode(sku) {
    try {
        // Using QR code library to generate simple barcode representation
        const barcodeDataURL = await QRCode.toDataURL(sku, {
            width: 300,
            height: 100,
            margin: 1
        });

        return {
            success: true,
            dataURL: barcodeDataURL,
            sku
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parse scanned QR code data
 */
export function parseQRCode(qrString) {
    try {
        const data = JSON.parse(qrString);

        if (!data.type) {
            return {
                success: false,
                error: 'Invalid QR code format'
            };
        }

        return {
            success: true,
            type: data.type,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: 'Failed to parse QR code'
        };
    }
}

/**
 * Validate serial number format
 */
export function validateSerialNumber(serial) {
    // Format: PREFIX-YYYYMMDD-XXXX
    const pattern = /^[A-Z]{2,4}-\d{8}-\d{4,6}$/;
    return pattern.test(serial);
}

/**
 * Generate serial number
 */
export function generateSerialNumber(prefix = 'PRD') {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `${prefix}-${dateStr}-${random}`;
}

/**
 * Track serial number usage
 */
export async function trackSerialNumber(serialNumber, poId, itemId, prisma) {
    try {
        // Check if serial number already exists
        const existing = await prisma.serialNumberTracking.findUnique({
            where: { serialNumber }
        });

        if (existing) {
            return {
                success: false,
                error: 'Serial number already in use'
            };
        }

        // Create tracking record
        const tracking = await prisma.serialNumberTracking.create({
            data: {
                serialNumber,
                poId,
                itemId,
                status: 'active',
                scannedAt: new Date()
            }
        });

        return {
            success: true,
            data: tracking
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
