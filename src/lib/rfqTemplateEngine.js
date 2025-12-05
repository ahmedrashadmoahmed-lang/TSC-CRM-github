// RFQ Template Engine
// Manages dynamic RFQ templates with customizable fields

export const RFQTemplateEngine = {
    // Default field types
    fieldTypes: [
        { id: 'text', name: 'Text', icon: 'type' },
        { id: 'textarea', name: 'Long Text', icon: 'align-left' },
        { id: 'number', name: 'Number', icon: 'hash' },
        { id: 'select', name: 'Dropdown', icon: 'chevron-down' },
        { id: 'date', name: 'Date', icon: 'calendar' },
        { id: 'file', name: 'File Upload', icon: 'upload' },
        { id: 'checkbox', name: 'Checkbox', icon: 'check-square' }
    ],

    // Template categories
    categories: [
        { id: 'equipment', name: 'Equipment', icon: 'tool', color: '#3b82f6' },
        { id: 'supplies', name: 'Office Supplies', icon: 'package', color: '#10b981' },
        { id: 'services', name: 'Services', icon: 'briefcase', color: '#8b5cf6' },
        { id: 'raw_materials', name: 'Raw Materials', icon: 'box', color: '#f59e0b' },
        { id: 'it_hardware', name: 'IT Hardware', icon: 'cpu', color: '#06b6d4' },
        { id: 'software', name: 'Software', icon: 'code', color: '#ec4899' },
        { id: 'construction', name: 'Construction', icon: 'home', color: '#f97316' },
        { id: 'custom', name: 'Custom', icon: 'star', color: '#6b7280' }
    ],

    // Default templates
    defaultTemplates: {
        equipment: {
            name: 'Equipment Purchase Template',
            description: 'Standard template for equipment procurement',
            fields: [
                { name: 'equipmentType', label: 'Equipment Type', type: 'text', required: true },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true },
                { name: 'specifications', label: 'Technical Specifications', type: 'textarea', required: true },
                { name: 'warrantyPeriod', label: 'Warranty Period (months)', type: 'number', required: false },
                { name: 'deliveryDate', label: 'Required Delivery Date', type: 'date', required: true },
                { name: 'installationRequired', label: 'Installation Required', type: 'checkbox', required: false },
                { name: 'trainingRequired', label: 'Training Required', type: 'checkbox', required: false }
            ]
        },
        supplies: {
            name: 'Office Supplies Template',
            description: 'Template for office supplies and consumables',
            fields: [
                { name: 'itemName', label: 'Item Name', type: 'text', required: true },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true },
                { name: 'unit', label: 'Unit', type: 'select', options: ['pcs', 'box', 'pack', 'ream'], required: true },
                { name: 'brand', label: 'Preferred Brand', type: 'text', required: false },
                { name: 'specifications', label: 'Specifications', type: 'textarea', required: false },
                { name: 'deliveryFrequency', label: 'Delivery Frequency', type: 'select', options: ['One-time', 'Monthly', 'Quarterly'], required: false }
            ]
        },
        services: {
            name: 'Services RFQ Template',
            description: 'Template for service procurement',
            fields: [
                { name: 'serviceType', label: 'Service Type', type: 'text', required: true },
                { name: 'scope', label: 'Scope of Work', type: 'textarea', required: true },
                { name: 'duration', label: 'Duration (days)', type: 'number', required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'location', label: 'Service Location', type: 'text', required: false },
                { name: 'certifications', label: 'Required Certifications', type: 'textarea', required: false },
                { name: 'insurance', label: 'Insurance Required', type: 'checkbox', required: false }
            ]
        }
    },

    /**
     * Create new template
     */
    createTemplate(name, category, description, fields) {
        return {
            id: this.generateId(),
            name,
            category,
            description,
            fields,
            isDefault: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date()
        };
    },

    /**
     * Get template by category
     */
    getTemplateByCategory(category) {
        return this.defaultTemplates[category] || null;
    },

    /**
     * Apply template to RFQ
     */
    applyTemplate(template, rfqData = {}) {
        const items = template.fields.map(field => ({
            fieldName: field.name,
            label: field.label,
            type: field.type,
            value: rfqData[field.name] || (field.type === 'checkbox' ? false : ''),
            required: field.required,
            options: field.options || null
        }));

        return {
            templateName: template.name,
            category: template.category,
            items,
            metadata: {
                appliedAt: new Date(),
                templateId: template.id
            }
        };
    },

    /**
     * Validate template fields
     */
    validateTemplate(template) {
        const errors = [];

        if (!template.name || template.name.trim() === '') {
            errors.push('Template name is required');
        }

        if (!template.category) {
            errors.push('Template category is required');
        }

        if (!template.fields || template.fields.length === 0) {
            errors.push('Template must have at least one field');
        }

        template.fields?.forEach((field, index) => {
            if (!field.name) {
                errors.push(`Field ${index + 1}: Name is required`);
            }
            if (!field.label) {
                errors.push(`Field ${index + 1}: Label is required`);
            }
            if (!field.type) {
                errors.push(`Field ${index + 1}: Type is required`);
            }
            if (field.type === 'select' && (!field.options || field.options.length === 0)) {
                errors.push(`Field ${index + 1}: Select field must have options`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Clone template
     */
    cloneTemplate(template, newName) {
        return {
            ...template,
            id: this.generateId(),
            name: newName || `${template.name} (Copy)`,
            isDefault: false,
            usageCount: 0,
            createdAt: new Date()
        };
    },

    /**
     * Get field by name
     */
    getField(template, fieldName) {
        return template.fields.find(f => f.name === fieldName);
    },

    /**
     * Add field to template
     */
    addField(template, field) {
        return {
            ...template,
            fields: [...template.fields, field]
        };
    },

    /**
     * Remove field from template
     */
    removeField(template, fieldName) {
        return {
            ...template,
            fields: template.fields.filter(f => f.name !== fieldName)
        };
    },

    /**
     * Update field in template
     */
    updateField(template, fieldName, updates) {
        return {
            ...template,
            fields: template.fields.map(f => 
                f.name === fieldName ? { ...f, ...updates } : f
            )
        };
    },

    /**
     * Get popular templates
     */
    getPopularTemplates(templates, limit = 5) {
        return templates
            .filter(t => t.isActive)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    },

    /**
     * Search templates
     */
    searchTemplates(templates, query) {
        const lowerQuery = query.toLowerCase();
        return templates.filter(t => 
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description?.toLowerCase().includes(lowerQuery) ||
            t.category.toLowerCase().includes(lowerQuery)
        );
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Export template as JSON
     */
    exportTemplate(template) {
        return JSON.stringify(template, null, 2);
    },

    /**
     * Import template from JSON
     */
    importTemplate(jsonString) {
        try {
            const template = JSON.parse(jsonString);
            const validation = this.validateTemplate(template);
            
            if (!validation.isValid) {
                throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
            }
            
            return {
                ...template,
                id: this.generateId(),
                createdAt: new Date()
            };
        } catch (error) {
            throw new Error(`Failed to import template: ${error.message}`);
        }
    }
};

export default RFQTemplateEngine;
