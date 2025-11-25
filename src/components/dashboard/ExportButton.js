'use client';

import { FileDown, Printer, FileSpreadsheet } from 'lucide-react';
import styles from './ExportButton.module.css';
import { useState } from 'react';

export default function ExportButton({ dashboardData }) {
    const [isOpen, setIsOpen] = useState(false);

    const handlePrint = () => {
        window.print();
        setIsOpen(false);
    };

    const handleExportPDF = async () => {
        // Simple print to PDF
        window.print();
        setIsOpen(false);
    };

    const handleExportCSV = () => {
        if (!dashboardData) return;

        // Convert KPIs to CSV
        const csvData = [];
        csvData.push(['المؤشر', 'القيمة', 'الاتجاه']);

        Object.entries(dashboardData.kpis || {}).forEach(([key, kpi]) => {
            csvData.push([
                kpi.label || key,
                kpi.value || kpi.count || '',
                kpi.trend ? `${kpi.trend}%` : ''
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dashboard_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setIsOpen(false);
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <FileDown size={18} />
                <span>تصدير</span>
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.dropdown}>
                        <button className={styles.option} onClick={handlePrint}>
                            <Printer size={18} />
                            <span>طباعة</span>
                        </button>
                        <button className={styles.option} onClick={handleExportPDF}>
                            <FileDown size={18} />
                            <span>تصدير PDF</span>
                        </button>
                        <button className={styles.option} onClick={handleExportCSV}>
                            <FileSpreadsheet size={18} />
                            <span>تصدير CSV</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
