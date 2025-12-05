// Report Builder Component
// Create custom reports with filters

import { useState } from 'react';
import { FileText, Filter, Download, Calendar } from 'lucide-react';
import styles from './ReportBuilder.module.css';

export default function ReportBuilder({ tenantId }) {
    const [reportType, setReportType] = useState('pipeline');
    const [filters, setFilters] = useState([]);
    const [groupBy, setGroupBy] = useState('stage');
    const [dateRange, setDateRange] = useState('month');

    const reportTypes = [
        { value: 'pipeline', label: 'Pipeline Report' },
        { value: 'forecast', label: 'Revenue Forecast' },
        { value: 'rfm', label: 'RFM Analysis' },
        { value: 'velocity', label: 'Deal Velocity' },
        { value: 'lost_reasons', label: 'Lost Reasons' }
    ];

    const handleGenerate = async () => {
        const config = {
            filters,
            groupBy,
            dateRange,
            sortBy: { field: 'value', direction: 'desc' }
        };

        const response = await fetch('/api/reports/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, reportType, config })
        });

        const result = await response.json();
        if (result.success) {
            // Download or display report
            console.log('Report generated:', result.data);
        }
    };

    return (
        <div className={styles.builder}>
            <div className={styles.header}>
                <FileText size={20} />
                <h3>Report Builder</h3>
            </div>

            <div className={styles.form}>
                <div className={styles.field}>
                    <label>Report Type</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        {reportTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label>Date Range</label>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label>Group By</label>
                    <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                        <option value="stage">Stage</option>
                        <option value="rep">Sales Rep</option>
                        <option value="source">Source</option>
                        <option value="date">Date</option>
                    </select>
                </div>

                <div className={styles.actions}>
                    <button className={styles.generateBtn} onClick={handleGenerate}>
                        <FileText size={16} />
                        Generate Report
                    </button>
                    <button className={styles.downloadBtn}>
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
}
