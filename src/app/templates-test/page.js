// RFQ Templates Test Page
// Test template library and selection

'use client';

import { useState } from 'react';
import TemplateLibrary from '@/components/rfq/TemplateLibrary';
import styles from './page.module.css';

export default function TemplatesTestPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        console.log('Selected template:', template);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📋 RFQ Templates Test</h1>
                <p>Testing Feature 2: Dynamic Templates</p>
            </div>

            <div className={styles.content}>
                {/* Template Library */}
                <TemplateLibrary onSelectTemplate={handleSelectTemplate} />

                {/* Selected Template Preview */}
                {selectedTemplate && (
                    <div className={styles.preview}>
                        <h2>Selected Template</h2>
                        <div className={styles.previewCard}>
                            <h3>{selectedTemplate.name}</h3>
                            <p>{selectedTemplate.description}</p>

                            <div className={styles.meta}>
                                <span>Category: {selectedTemplate.category}</span>
                                <span>Fields: {selectedTemplate.fields?.length || 0}</span>
                                <span>Used: {selectedTemplate.usageCount} times</span>
                            </div>

                            <div className={styles.fields}>
                                <h4>Fields:</h4>
                                {selectedTemplate.fields?.map((field, idx) => (
                                    <div key={idx} className={styles.field}>
                                        <span className={styles.fieldName}>{field.label}</span>
                                        <span className={styles.fieldType}>{field.type}</span>
                                        {field.required && (
                                            <span className={styles.required}>Required</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className={styles.applyBtn}>
                                Apply Template to RFQ
                            </button>
                        </div>
                    </div>
                )}

                {/* Feature Status */}
                <div className={styles.status}>
                    <h2>✅ Feature 2 Status</h2>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Database Model</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Template Engine</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>API Endpoints</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>✅</span>
                            <span>Template Library UI</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.check}>🧪</span>
                            <span>Browser Testing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
