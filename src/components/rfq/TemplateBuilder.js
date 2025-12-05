// Template Builder Component
// Create and customize RFQ templates

'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import styles from './TemplateBuilder.module.css';
import RFQTemplateEngine from '@/lib/rfqTemplateEngine';

export default function TemplateBuilder({ onSave, initialTemplate = null }) {
    const [template, setTemplate] = useState(initialTemplate || {
        name: '',
        description: '',
        category: 'custom',
        fields: []
    });

    const [errors, setErrors] = useState([]);

    const addField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            name: '',
            label: '',
            type: 'text',
            required: false,
            options: []
        };

        setTemplate({
            ...template,
            fields: [...template.fields, newField]
        });
    };

    const removeField = (fieldId) => {
        setTemplate({
            ...template,
            fields: template.fields.filter(f => f.id !== fieldId)
        });
    };

    const updateField = (fieldId, updates) => {
        setTemplate({
            ...template,
            fields: template.fields.map(f =>
                f.id === fieldId ? { ...f, ...updates } : f
            )
        });
    };

    const handleSave = () => {
        // Validate
        const validation = RFQTemplateEngine.validateTemplate(template);

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setErrors([]);
        if (onSave) {
            onSave(template);
        }
    };

    const loadDefaultTemplate = (category) => {
        const defaultTemplate = RFQTemplateEngine.getTemplateByCategory(category);
        if (defaultTemplate) {
            setTemplate({
                ...template,
                ...defaultTemplate,
                fields: defaultTemplate.fields.map((f, i) => ({
                    ...f,
                    id: `field_${i}`
                }))
            });
        }
    };

    return (
        <div className={styles.builder}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>Template Builder</h2>
                    <p>Create custom RFQ templates for different procurement needs</p>
                </div>
                <button className={styles.saveBtn} onClick={handleSave}>
                    <Save size={16} />
                    Save Template
                </button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className={styles.errors}>
                    {errors.map((error, i) => (
                        <div key={i} className={styles.error}>
                            {error}
                        </div>
                    ))}
                </div>
            )}

            {/* Basic Info */}
            <div className={styles.section}>
                <h3>Basic Information</h3>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>Template Name *</label>
                        <input
                            type="text"
                            value={template.name}
                            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                            placeholder="e.g., IT Equipment Purchase"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Category *</label>
                        <select
                            value={template.category}
                            onChange={(e) => {
                                setTemplate({ ...template, category: e.target.value });
                                if (e.target.value !== 'custom') {
                                    loadDefaultTemplate(e.target.value);
                                }
                            }}
                        >
                            {RFQTemplateEngine.categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                        <label>Description</label>
                        <textarea
                            value={template.description}
                            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                            placeholder="Brief description of when to use this template..."
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* Fields */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Template Fields</h3>
                    <button className={styles.addFieldBtn} onClick={addField}>
                        <Plus size={16} />
                        Add Field
                    </button>
                </div>

                {template.fields.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No fields added yet. Click "Add Field" to start building your template.</p>
                    </div>
                ) : (
                    <div className={styles.fieldsList}>
                        {template.fields.map((field, index) => (
                            <div key={field.id} className={styles.fieldCard}>
                                <div className={styles.fieldHeader}>
                                    <GripVertical size={16} className={styles.dragHandle} />
                                    <span className={styles.fieldNumber}>Field {index + 1}</span>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeField(field.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className={styles.fieldGrid}>
                                    <div className={styles.fieldInput}>
                                        <label>Field Name (internal) *</label>
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                                            placeholder="e.g., productName"
                                        />
                                    </div>

                                    <div className={styles.fieldInput}>
                                        <label>Label (displayed) *</label>
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            placeholder="e.g., Product Name"
                                        />
                                    </div>

                                    <div className={styles.fieldInput}>
                                        <label>Type *</label>
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, { type: e.target.value })}
                                        >
                                            {RFQTemplateEngine.fieldTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.fieldInput}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                            />
                                            Required field
                                        </label>
                                    </div>

                                    {field.type === 'select' && (
                                        <div className={styles.fieldInput} style={{ gridColumn: '1 / -1' }}>
                                            <label>Options (comma-separated)</label>
                                            <input
                                                type="text"
                                                value={field.options?.join(', ') || ''}
                                                onChange={(e) => updateField(field.id, {
                                                    options: e.target.value.split(',').map(o => o.trim()).filter(o => o)
                                                })}
                                                placeholder="e.g., Option 1, Option 2, Option 3"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview */}
            <div className={styles.section}>
                <h3>Preview</h3>
                <div className={styles.preview}>
                    <div className={styles.previewHeader}>
                        <h4>{template.name || 'Untitled Template'}</h4>
                        {template.description && (
                            <p>{template.description}</p>
                        )}
                    </div>

                    {template.fields.length > 0 ? (
                        <div className={styles.previewFields}>
                            {template.fields.map(field => (
                                <div key={field.id} className={styles.previewField}>
                                    <label>
                                        {field.label || field.name || 'Untitled Field'}
                                        {field.required && <span className={styles.required}>*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea placeholder={`Enter ${field.label || 'value'}...`} disabled />
                                    ) : field.type === 'select' ? (
                                        <select disabled>
                                            <option>Select...</option>
                                            {field.options?.map((opt, i) => (
                                                <option key={i}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'checkbox' ? (
                                        <input type="checkbox" disabled />
                                    ) : (
                                        <input
                                            type={field.type}
                                            placeholder={`Enter ${field.label || 'value'}...`}
                                            disabled
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyPreview}>
                            <p>Add fields to see preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
