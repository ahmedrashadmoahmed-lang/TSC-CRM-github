# External Integrations Setup Guide

## 🔌 Required Integrations

### 1. SendGrid (Email) ✉️

**Purpose**: Email communication

**Setup Steps**:
1. Create account at https://sendgrid.com
2. Generate API key
3. Add to `.env.local`:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company
```

**Integration Code**:
```javascript
// src/lib/integrations/sendgrid.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html, text }) {
    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME
        },
        subject,
        text,
        html
    };

    try {
        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        console.error('SendGrid error:', error);
        return { success: false, error: error.message };
    }
}
```

**Install Package**:
```bash
npm install @sendgrid/mail
```

---

### 2. Twilio (SMS) 📱

**Purpose**: SMS communication

**Setup Steps**:
1. Create account at https://twilio.com
2. Get Account SID and Auth Token
3. Get phone number
4. Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Integration Code**:
```javascript
// src/lib/integrations/twilio.js
import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS({ to, message }) {
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
        return { success: true, messageId: result.sid };
    } catch (error) {
        console.error('Twilio error:', error);
        return { success: false, error: error.message };
    }
}
```

**Install Package**:
```bash
npm install twilio
```

---

### 3. WhatsApp Business API 💬

**Purpose**: WhatsApp communication

**Setup Steps**:
1. Apply for WhatsApp Business API
2. Get API credentials
3. Add to `.env.local`:
```env
WHATSAPP_API_URL=https://api.whatsapp.com/v1
WHATSAPP_API_KEY=xxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxx
```

**Integration Code**:
```javascript
// src/lib/integrations/whatsapp.js
export async function sendWhatsApp({ to, message, templateId }) {
    const url = `${process.env.WHATSAPP_API_URL}/messages`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();
        return { success: true, messageId: data.messages[0].id };
    } catch (error) {
        console.error('WhatsApp error:', error);
        return { success: false, error: error.message };
    }
}
```

---

### 4. Exchange Rate API 💱

**Purpose**: Currency conversion rates

**Setup Steps**:
1. Create account at https://exchangerate-api.com
2. Get API key
3. Add to `.env.local`:
```env
EXCHANGE_RATE_API_KEY=xxxxxxxxxxxxx
```

**Integration Code**:
```javascript
// src/lib/integrations/exchangeRate.js
export async function getExchangeRates(baseCurrency = 'USD') {
    const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return {
            success: true,
            rates: data.conversion_rates,
            lastUpdate: data.time_last_update_utc
        };
    } catch (error) {
        console.error('Exchange rate error:', error);
        return { success: false, error: error.message };
    }
}
```

---

### 5. Google Analytics (Optional) 📊

**Purpose**: User behavior tracking

**Setup Steps**:
1. Create GA4 property
2. Get Measurement ID
3. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Integration Code**:
```javascript
// src/lib/integrations/analytics.js
export const pageview = (url) => {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
    });
};

export const event = ({ action, category, label, value }) => {
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};
```

---

## 📝 Complete .env.local Template

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm"

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp
WHATSAPP_API_URL=https://api.whatsapp.com/v1
WHATSAPP_API_KEY=xxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxx

# Exchange Rate
EXCHANGE_RATE_API_KEY=xxxxxxxxxxxxx

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Integration Checklist

- [ ] SendGrid account created
- [ ] SendGrid API key added
- [ ] Twilio account created
- [ ] Twilio credentials added
- [ ] WhatsApp Business API approved
- [ ] WhatsApp credentials added
- [ ] Exchange Rate API key obtained
- [ ] All environment variables set
- [ ] Integration files created
- [ ] Test emails sent
- [ ] Test SMS sent
- [ ] Test WhatsApp sent
- [ ] Currency conversion tested

---

## 🧪 Testing Integrations

```javascript
// Test SendGrid
import { sendEmail } from '@/lib/integrations/sendgrid';
await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    text: 'This is a test',
    html: '<p>This is a test</p>'
});

// Test Twilio
import { sendSMS } from '@/lib/integrations/twilio';
await sendSMS({
    to: '+1234567890',
    message: 'Test SMS'
});

// Test Exchange Rates
import { getExchangeRates } from '@/lib/integrations/exchangeRate';
const rates = await getExchangeRates('USD');
console.log(rates);
```

---

**Status**: Ready for setup  
**Estimated Time**: 2-3 hours
