'use client';

import { useState } from 'react';
import { Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import styles from './DashboardSettings.module.css';

const DEFAULT_WIDGETS = [
    { id: 'enhanced-kpis', name: 'KPI Cards المحسنة', visible: true, order: 1 },
    { id: 'metric-cards', name: 'Metric Cards', visible: true, order: 2 },
    { id: 'quick-actions', name: 'إجراءات سريعة', visible: true, order: 3 },
    { id: 'charts', name: 'المخططات البيانية', visible: true, order: 4 },
    { id: 'activity-feed', name: 'سجل النشاط', visible: true, order: 5 },
    { id: 'top-deals', name: 'أفضل الصفقات', visible: true, order: 6 },
    { id: 'alerts', name: 'التنبيهات', visible: true, order: 7 }
];

export default function DashboardSettings({ onSettingsChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [widgets, setWidgets] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboardWidgets');
            return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
        }
        return DEFAULT_WIDGETS;
    });

    const toggleWidget = (widgetId) => {
        const updated = widgets.map(w =>
            w.id === widgetId ? { ...w, visible: !w.visible } : w
        );
        setWidgets(updated);
        saveSettings(updated);
    };

    const resetToDefault = () => {
        setWidgets(DEFAULT_WIDGETS);
        saveSettings(DEFAULT_WIDGETS);
    };

    const saveSettings = (updatedWidgets) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('dashboardWidgets', JSON.stringify(updatedWidgets));
            onSettingsChange?.(updatedWidgets);
        }
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                title="إعدادات الداش بورد"
            >
                <Settings size={18} />
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.panel}>
                        <div className={styles.header}>
                            <h3>تخصيص الداش بورد</h3>
                            <button
                                className={styles.resetButton}
                                onClick={resetToDefault}
                            >
                                إعادة تعيين
                            </button>
                        </div>

                        <div className={styles.widgets}>
                            {widgets.map((widget) => (
                                <div key={widget.id} className={styles.widget}>
                                    <div className={styles.widgetInfo}>
                                        <GripVertical size={16} className={styles.dragHandle} />
                                        <span className={styles.widgetName}>{widget.name}</span>
                                    </div>
                                    <button
                                        className={styles.toggleButton}
                                        onClick={() => toggleWidget(widget.id)}
                                    >
                                        {widget.visible ? (
                                            <Eye size={18} className={styles.iconVisible} />
                                        ) : (
                                            <EyeOff size={18} className={styles.iconHidden} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <p className={styles.hint}>
                                💡 يتم حفظ التفضيلات تلقائياً
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function useWidgetVisibility() {
    const [widgets, setWidgets] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboardWidgets');
            return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
        }
        return DEFAULT_WIDGETS;
    });

    const isVisible = (widgetId) => {
        const widget = widgets.find(w => w.id === widgetId);
        return widget?.visible ?? true;
    };

    return { widgets, isVisible, setWidgets };
}
