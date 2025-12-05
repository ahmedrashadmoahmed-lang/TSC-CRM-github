// QR Code Utilities
import QRCode from 'qrcode';

/**
 * Generate QR code as Data URL
 */
export async function generateQRCode(data, options = {}) {
  try {
    const qrOptions = {
      errorCorrectionLevel: options.errorLevel || 'M',
      type: 'image/png',
      quality: options.quality || 0.92,
      margin: options.margin || 1,
      width: options.width || 200,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#FFFFFF',
      },
    };

    const dataUrl = await QRCode.toDataURL(data, qrOptions);
    return { success: true, dataUrl };
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate QR code as Buffer (for server-side)
 */
export async function generateQRCodeBuffer(data, options = {}) {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: options.errorLevel || 'M',
      width: options.width || 200,
      margin: options.margin || 1,
    });
    return { success: true, buffer };
  } catch (error) {
    console.error('QR Code buffer generation failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate invoice QR code
 */
export async function generateInvoiceQR(invoice) {
  const qrData = {
    type: 'invoice',
    number: invoice.number,
    total: invoice.total,
    date: invoice.date,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`,
  };

  return generateQRCode(JSON.stringify(qrData), {
    errorLevel: 'H', // High error correction for invoices
    width: 250,
  });
}

/**
 * Generate payment QR code
 */
export async function generatePaymentQR(paymentInfo) {
  const qrData = {
    type: 'payment',
    amount: paymentInfo.amount,
    currency: paymentInfo.currency || 'EGP',
    reference: paymentInfo.reference,
    paymentUrl: paymentInfo.paymentUrl,
  };

  return generateQRCode(JSON.stringify(qrData), {
    errorLevel: 'H',
    width: 300,
  });
}

/**
 * Generate product QR code
 */
export async function generateProductQR(product) {
  const qrData = {
    type: 'product',
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
  };

  return generateQRCode(JSON.stringify(qrData), {
    width: 150,
  });
}

// Example usage:
// const { dataUrl } = await generateInvoiceQR(invoice);
// <img src={dataUrl} alt="Invoice QR Code" />
