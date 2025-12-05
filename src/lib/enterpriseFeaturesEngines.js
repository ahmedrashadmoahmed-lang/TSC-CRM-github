// Enterprise Features Engines
// Advanced Permissions, Multi-Currency, Custom Fields, Webhooks

// Advanced Permissions Engine
export class AdvancedPermissionsEngine {
    /**
     * Check permission
     */
    static checkPermission(user, resource, action) {
        const userRole = user.role || 'user';
        const permissions = this.getRolePermissions(userRole);

        const resourcePermissions = permissions[resource] || {};
        return resourcePermissions[action] === true;
    }

    /**
     * Get role permissions
     */
    static getRolePermissions(role) {
        const permissionsMap = {
            'admin': {
                'opportunity': { read: true, create: true, update: true, delete: true },
                'customer': { read: true, create: true, update: true, delete: true },
                'user': { read: true, create: true, update: true, delete: true },
                'settings': { read: true, create: true, update: true, delete: true }
            },
            'manager': {
                'opportunity': { read: true, create: true, update: true, delete: false },
                'customer': { read: true, create: true, update: true, delete: false },
                'user': { read: true, create: false, update: false, delete: false },
                'settings': { read: true, create: false, update: false, delete: false }
            },
            'sales_rep': {
                'opportunity': { read: true, create: true, update: true, delete: false },
                'customer': { read: true, create: true, update: true, delete: false },
                'user': { read: false, create: false, update: false, delete: false },
                'settings': { read: false, create: false, update: false, delete: false }
            },
            'user': {
                'opportunity': { read: true, create: false, update: false, delete: false },
                'customer': { read: true, create: false, update: false, delete: false },
                'user': { read: false, create: false, update: false, delete: false },
                'settings': { read: false, create: false, update: false, delete: false }
            }
        };

        return permissionsMap[role] || permissionsMap['user'];
    }

    /**
     * Field-level security
     */
    static canAccessField(user, resource, field) {
        const restrictedFields = {
            'opportunity': {
                'sales_rep': ['internalNotes', 'cost'],
                'user': ['internalNotes', 'cost', 'probability']
            }
        };

        const userRole = user.role || 'user';
        const restricted = restrictedFields[resource]?.[userRole] || [];

        return !restricted.includes(field);
    }

    /**
     * Create audit log
     */
    static createAuditLog(user, action, resource, resourceId, changes = {}) {
        return {
            userId: user.id,
            userName: user.name,
            action, // create, update, delete, view
            resource,
            resourceId,
            changes,
            timestamp: new Date(),
            ipAddress: user.ipAddress || 'unknown'
        };
    }
}

// Multi-Currency Engine
export class MultiCurrencyEngine {
    /**
     * Convert currency
     */
    static convert(amount, fromCurrency, toCurrency, rates) {
        if (fromCurrency === toCurrency) return amount;

        const rate = rates[`${fromCurrency}_${toCurrency}`];
        if (!rate) {
            // Fallback: convert through USD
            const toUSD = rates[`${fromCurrency}_USD`] || 1;
            const fromUSD = rates[`USD_${toCurrency}`] || 1;
            return amount * toUSD * fromUSD;
        }

        return amount * rate;
    }

    /**
     * Get exchange rates
     */
    static getExchangeRates() {
        // Mock rates - would integrate with real API (e.g., exchangerate-api.com)
        return {
            'USD_EUR': 0.92,
            'USD_GBP': 0.79,
            'USD_EGP': 30.90,
            'USD_SAR': 3.75,
            'EUR_USD': 1.09,
            'GBP_USD': 1.27,
            'EGP_USD': 0.032,
            'SAR_USD': 0.27
        };
    }

    /**
     * Format currency
     */
    static formatCurrency(amount, currency) {
        const formats = {
            'USD': { symbol: '$', position: 'before', decimals: 2 },
            'EUR': { symbol: '€', position: 'after', decimals: 2 },
            'GBP': { symbol: '£', position: 'before', decimals: 2 },
            'EGP': { symbol: 'ج.م', position: 'after', decimals: 2 },
            'SAR': { symbol: 'ر.س', position: 'after', decimals: 2 }
        };

        const format = formats[currency] || formats['USD'];
        const formatted = amount.toFixed(format.decimals);

        return format.position === 'before'
            ? `${format.symbol}${formatted}`
            : `${formatted} ${format.symbol}`;
    }

    /**
     * Calculate multi-currency totals
     */
    static calculateTotals(deals, baseCurrency = 'USD') {
        const rates = this.getExchangeRates();

        let total = 0;
        const breakdown = {};

        deals.forEach(deal => {
            const currency = deal.currency || 'USD';
            const converted = this.convert(deal.value, currency, baseCurrency, rates);
            total += converted;

            if (!breakdown[currency]) {
                breakdown[currency] = { count: 0, total: 0 };
            }
            breakdown[currency].count++;
            breakdown[currency].total += deal.value;
        });

        return {
            baseCurrency,
            total,
            formatted: this.formatCurrency(total, baseCurrency),
            breakdown
        };
    }
}

// Custom Fields Engine
export class CustomFieldsEngine {
    /**
     * Create custom field
     */
    static createCustomField(config) {
        return {
            id: `field_${Date.now()}`,
            name: config.name,
            label: config.label,
            type: config.type, // text, number, date, select, multiselect, checkbox
            entity: config.entity, // opportunity, customer, etc.
            required: config.required || false,
            options: config.options || [], // for select/multiselect
            defaultValue: config.defaultValue,
            validation: config.validation || {},
            createdAt: new Date()
        };
    }

    /**
     * Validate custom field value
     */
    static validateValue(field, value) {
        if (field.required && !value) {
            return { valid: false, error: 'Field is required' };
        }

        switch (field.type) {
            case 'number':
                if (isNaN(value)) {
                    return { valid: false, error: 'Must be a number' };
                }
                if (field.validation.min && value < field.validation.min) {
                    return { valid: false, error: `Must be at least ${field.validation.min}` };
                }
                if (field.validation.max && value > field.validation.max) {
                    return { valid: false, error: `Must be at most ${field.validation.max}` };
                }
                break;

            case 'select':
                if (!field.options.includes(value)) {
                    return { valid: false, error: 'Invalid option' };
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return { valid: false, error: 'Invalid email format' };
                }
                break;
        }

        return { valid: true };
    }

    /**
     * Create custom object
     */
    static createCustomObject(config) {
        return {
            id: `object_${Date.now()}`,
            name: config.name,
            label: config.label,
            pluralLabel: config.pluralLabel,
            fields: config.fields || [],
            relationships: config.relationships || [],
            createdAt: new Date()
        };
    }
}

// Webhooks Engine
export class WebhooksEngine {
    /**
     * Create webhook
     */
    static createWebhook(config) {
        return {
            id: `webhook_${Date.now()}`,
            url: config.url,
            events: config.events, // ['opportunity.created', 'opportunity.updated', etc.]
            secret: this.generateSecret(),
            enabled: true,
            createdAt: new Date()
        };
    }

    static generateSecret() {
        return `whsec_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Trigger webhook
     */
    static async triggerWebhook(webhook, event, data) {
        const payload = {
            event,
            data,
            timestamp: new Date().toISOString(),
            webhookId: webhook.id
        };

        const signature = this.generateSignature(payload, webhook.secret);

        try {
            // Mock implementation - would use fetch in production
            console.log('Triggering webhook:', webhook.url, event);

            return {
                success: true,
                webhookId: webhook.id,
                event,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static generateSignature(payload, secret) {
        // Would use crypto.createHmac in production
        return `sha256=${secret}`;
    }

    /**
     * Get webhook events
     */
    static getAvailableEvents() {
        return [
            'opportunity.created',
            'opportunity.updated',
            'opportunity.deleted',
            'opportunity.won',
            'opportunity.lost',
            'customer.created',
            'customer.updated',
            'deal.stage_changed',
            'feedback.received'
        ];
    }

    /**
     * Retry failed webhook
     */
    static async retryWebhook(webhookLog) {
        const webhook = webhookLog.webhook;
        return await this.triggerWebhook(webhook, webhookLog.event, webhookLog.data);
    }
}
