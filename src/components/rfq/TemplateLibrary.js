// Template Library Component
// Browse and select RFQ templates

'use client';

import { useState, useEffect } from 'react';
import { Package, Briefcase, Tool, Box, Cpu, Code, Home, Star, Search } from 'lucide-react';
import styles from './TemplateLibrary.module.css';

const categoryIcons = {
    equipment: Tool,
    supplies: Package,
    services: Briefcase,
    raw_materials: Box,
    it_hardware: Cpu,
    software: Code,
    construction: Home,
    custom: Star
};

export default function TemplateLibrary({ onSelectTemplate, tenantId = 'default' }) {
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, [selectedCategory]);

    const fetchTemplates = async () => {
        try {
            const url = `/api/rfq/templates?tenantId=${tenantId}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
                }`;

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setTemplates(result.data.templates || []);
                setCategories(result.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectTemplate = async (template) => {
        // Increment usage count
        await fetch('/api/rfq/templates', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: template.id,
                action: 'increment_usage'
            })
        });

        onSelectTemplate && onSelectTemplate(template);
    };

    if (loading) {
        return <div className={styles.loading}>Loading templates...</div>;
    }

    return (
        <div className={styles.library}>
            <div className={styles.header}>
                <h2>Template Library</h2>
                <p>Choose a template to get started quickly</p>
            </div>

            {/* Search */}
            <div className={styles.searchBar}>
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Categories */}
            <div className={styles.categories}>
                <button
                    className={selectedCategory === 'all' ? styles.active : ''}
                    onClick={() => setSelectedCategory('all')}
                >
                    All Templates
                </button>
                {categories.map(category => {
                    const Icon = categoryIcons[category.id] || Star;
                    return (
                        <button
                            key={category.id}
                            className={selectedCategory === category.id ? styles.active : ''}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{ borderColor: category.color }}
                        >
                            <Icon size={16} />
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {/* Templates Grid */}
            <div className={styles.grid}>
                {filteredTemplates.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No templates found</p>
                    </div>
                ) : (
                    filteredTemplates.map(template => {
                        const Icon = categoryIcons[template.category] || Star;
                        const category = categories.find(c => c.id === template.category);

                        return (
                            <div
                                key={template.id}
                                className={styles.templateCard}
                                onClick={() => handleSelectTemplate(template)}
                            >
                                <div className={styles.cardHeader}>
                                    <div
                                        className={styles.icon}
                                        style={{ backgroundColor: category?.color || '#6b7280' }}
                                    >
                                        <Icon size={24} />
                                    </div>
                                    {template.isDefault && (
                                        <span className={styles.defaultBadge}>Default</span>
                                    )}
                                </div>

                                <h3>{template.name}</h3>
                                <p>{template.description}</p>

                                <div className={styles.cardFooter}>
                                    <span className={styles.fieldCount}>
                                        {template.fields?.length || 0} fields
                                    </span>
                                    <span className={styles.usageCount}>
                                        Used {template.usageCount} times
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
