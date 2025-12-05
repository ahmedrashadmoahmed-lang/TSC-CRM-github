// Template rendering engine using Handlebars-like syntax

export function renderTemplate(template, data) {
    let rendered = template;

    // Replace all {{variable}} with actual values
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, data[key] || '');
    });

    return rendered;
}

export function extractVariables(template) {
    const regex = /{{(\w+)}}/g;
    const variables = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
        if (!variables.includes(match[1])) {
            variables.push(match[1]);
        }
    }

    return variables;
}

export function validateTemplate(template, requiredVariables = []) {
    const variables = extractVariables(template);
    const missing = requiredVariables.filter(v => !variables.includes(v));

    return {
        valid: missing.length === 0,
        missing,
        found: variables
    };
}

// Pre-built template generators
export const templateGenerators = {
    invoiceReminder: (invoice, customer) => ({
        subject: `تذكير: فاتورة رقم ${invoice.invoiceNumber}`,
        body: renderTemplate(
            `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #1f2937;">عزيزي {{customerName}}</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            نود تذكيركم بأن الفاتورة رقم <strong style="color: #6366f1;">{{invoiceNumber}}</strong> 
            بمبلغ <strong style="color: #10b981;">{{amount}}</strong> جنيه مستحقة الدفع.
          </p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>رقم الفاتورة:</strong> {{invoiceNumber}}</p>
            <p style="margin: 5px 0;"><strong>المبلغ:</strong> {{amount}} جنيه</p>
            <p style="margin: 5px 0;"><strong>تاريخ الاستحقاق:</strong> {{dueDate}}</p>
          </div>
          <p style="color: #4b5563;">يرجى سداد المبلغ في أقرب وقت ممكن.</p>
          <p style="color: #6b7280; margin-top: 30px;">شكراً لتعاونكم</p>
        </div>
      </div>
      `,
            {
                customerName: customer.name,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total.toLocaleString('ar-EG'),
                dueDate: new Date(invoice.dueDate).toLocaleDateString('ar-EG')
            }
        )
    }),

    paymentConfirmation: (invoice, customer, payment) => ({
        subject: `تم استلام دفعتك - فاتورة ${invoice.invoiceNumber}`,
        body: renderTemplate(
            `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 30px;">✓</span>
            </div>
          </div>
          <h2 style="color: #1f2937; text-align: center;">شكراً {{customerName}}</h2>
          <p style="color: #4b5563; text-align: center;">تم استلام دفعتك بنجاح</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>رقم الفاتورة:</strong> {{invoiceNumber}}</p>
            <p style="margin: 5px 0;"><strong>المبلغ المدفوع:</strong> {{amount}} جنيه</p>
            <p style="margin: 5px 0;"><strong>تاريخ الدفع:</strong> {{paymentDate}}</p>
          </div>
          <p style="color: #6b7280; text-align: center;">نقدر تعاملكم معنا</p>
        </div>
      </div>
      `,
            {
                customerName: customer.name,
                invoiceNumber: invoice.invoiceNumber,
                amount: payment.amount.toLocaleString('ar-EG'),
                paymentDate: new Date(payment.date).toLocaleDateString('ar-EG')
            }
        )
    }),

    lowStockAlert: (product) => ({
        subject: `تنبيه: مخزون منخفض - ${product.name}`,
        body: renderTemplate(
            `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-right: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b;">⚠️ تنبيه مخزون</h2>
          <p style="color: #4b5563;">المنتج التالي وصل إلى الحد الأدنى للمخزون:</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>المنتج:</strong> {{productName}}</p>
            <p style="margin: 5px 0;"><strong>الكمية الحالية:</strong> {{currentStock}}</p>
            <p style="margin: 5px 0;"><strong>الحد الأدنى:</strong> {{minStock}}</p>
          </div>
          <p style="color: #4b5563;">يرجى إنشاء أمر شراء جديد</p>
        </div>
      </div>
      `,
            {
                productName: product.name,
                currentStock: product.quantity,
                minStock: product.minStock || 10
            }
        )
    })
};
