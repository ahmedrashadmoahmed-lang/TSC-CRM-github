// Custom Report Builder Engine
// Flexible reporting system with scheduling

export class CustomReportEngine {
    /**
     * Generate custom report
     */
    static generateReport(config, data) {
        const {
            reportType,
            filters,
            columns,
            groupBy,
            sortBy
        } = config;

        // Apply filters
        let filteredData = this.applyFilters(data, filters);

        // Apply grouping
        if (groupBy) {
            filteredData = this.groupData(filteredData, groupBy);
        }

        // Apply sorting
        if (sortBy) {
            filteredData = this.sortData(filteredData, sortBy);
        }

        // Select columns
        const reportData = this.selectColumns(filteredData, columns);

        // Calculate summary
        const summary = this.calculateSummary(reportData, reportType);

        return {
            reportType,
            data: reportData,
            summary,
            generatedAt: new Date(),
            rowCount: reportData.length
        };
    }

    /**
     * Apply filters
     */
    static applyFilters(data, filters) {
        if (!filters || filters.length === 0) return data;

        return data.filter(item => {
            return filters.every(filter => {
                const value = item[filter.field];

                switch (filter.operator) {
                    case 'equals':
                        return value === filter.value;
                    case 'contains':
                        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                    case 'greater_than':
                        return value > filter.value;
                    case 'less_than':
                        return value < filter.value;
                    case 'between':
                        return value >= filter.value[0] && value <= filter.value[1];
                    default:
                        return true;
                }
            });
        });
    }

    /**
     * Group data
     */
    static groupData(data, groupBy) {
        const grouped = {};

        data.forEach(item => {
            const key = item[groupBy];
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
        });

        return Object.entries(grouped).map(([key, items]) => ({
            group: key,
            items,
            count: items.length,
            total: items.reduce((sum, item) => sum + (item.value || 0), 0)
        }));
    }

    /**
     * Sort data
     */
    static sortData(data, sortBy) {
        return [...data].sort((a, b) => {
            const aVal = a[sortBy.field];
            const bVal = b[sortBy.field];

            if (sortBy.direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    /**
     * Select columns
     */
    static selectColumns(data, columns) {
        if (!columns || columns.length === 0) return data;

        return data.map(item => {
            const selected = {};
            columns.forEach(col => {
                selected[col] = item[col];
            });
            return selected;
        });
    }

    /**
     * Calculate summary
     */
    static calculateSummary(data, reportType) {
        const summary = {
            totalRows: data.length,
            totalValue: 0,
            avgValue: 0,
            minValue: Infinity,
            maxValue: -Infinity
        };

        data.forEach(item => {
            const value = item.value || 0;
            summary.totalValue += value;
            summary.minValue = Math.min(summary.minValue, value);
            summary.maxValue = Math.max(summary.maxValue, value);
        });

        summary.avgValue = data.length > 0 ? summary.totalValue / data.length : 0;

        return summary;
    }

    /**
     * Export to format
     */
    static exportReport(report, format) {
        switch (format) {
            case 'csv':
                return this.exportToCSV(report);
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'excel':
                return this.exportToExcel(report);
            default:
                return report;
        }
    }

    /**
     * Export to CSV
     */
    static exportToCSV(report) {
        if (report.data.length === 0) return '';

        const headers = Object.keys(report.data[0]);
        const rows = report.data.map(row =>
            headers.map(h => row[h]).join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Export to Excel (placeholder)
     */
    static exportToExcel(report) {
        // Would integrate with xlsx library
        return report;
    }

    /**
     * Schedule report
     */
    static createSchedule(reportConfig, schedule) {
        return {
            reportConfig,
            schedule: {
                frequency: schedule.frequency, // daily, weekly, monthly
                time: schedule.time,
                recipients: schedule.recipients,
                format: schedule.format || 'pdf',
                enabled: true
            },
            nextRun: this.calculateNextRun(schedule),
            lastRun: null
        };
    }

    /**
     * Calculate next run time
     */
    static calculateNextRun(schedule) {
        const now = new Date();
        const next = new Date(now);

        switch (schedule.frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
        }

        return next;
    }
}

// Dynamic Forecasting Engine
export class DynamicForecastingEngine {
    /**
     * Run what-if scenario
     */
    static runScenario(baseline, changes) {
        const forecast = {
            baseline: this.calculateBaseline(baseline),
            scenarios: []
        };

        changes.forEach(change => {
            const scenario = this.applyChange(baseline, change);
            forecast.scenarios.push({
                name: change.name,
                change: change,
                result: scenario,
                impact: this.calculateImpact(forecast.baseline, scenario)
            });
        });

        return forecast;
    }

    /**
     * Calculate baseline
     */
    static calculateBaseline(data) {
        return {
            totalDeals: data.length,
            totalValue: data.reduce((sum, d) => sum + d.value, 0),
            avgDealValue: data.length > 0 ? data.reduce((sum, d) => sum + d.value, 0) / data.length : 0,
            winRate: data.filter(d => d.stage === 'won').length / data.length,
            avgCycleTime: 30 // days
        };
    }

    /**
     * Apply change
     */
    static applyChange(data, change) {
        let modified = [...data];

        switch (change.type) {
            case 'win_rate':
                const newWinRate = change.value / 100;
                const winsNeeded = Math.round(modified.length * newWinRate);
                return {
                    totalDeals: modified.length,
                    totalValue: modified.reduce((sum, d) => sum + d.value, 0) * newWinRate,
                    winRate: newWinRate,
                    projectedRevenue: modified.reduce((sum, d) => sum + d.value, 0) * newWinRate
                };

            case 'deal_value':
                const multiplier = 1 + (change.value / 100);
                return {
                    totalDeals: modified.length,
                    avgDealValue: (modified.reduce((sum, d) => sum + d.value, 0) / modified.length) * multiplier,
                    projectedRevenue: modified.reduce((sum, d) => sum + d.value, 0) * multiplier
                };

            case 'cycle_time':
                const newCycleTime = 30 * (1 + change.value / 100);
                return {
                    avgCycleTime: newCycleTime,
                    throughput: Math.round(365 / newCycleTime * modified.length)
                };

            default:
                return this.calculateBaseline(modified);
        }
    }

    /**
     * Calculate impact
     */
    static calculateImpact(baseline, scenario) {
        return {
            revenueChange: scenario.projectedRevenue - baseline.totalValue,
            revenueChangePercent: ((scenario.projectedRevenue - baseline.totalValue) / baseline.totalValue) * 100
        };
    }
}

// RFM Analysis Engine
export class RFMAnalysisEngine {
    /**
     * Calculate RFM scores
     */
    static calculateRFM(customers, transactions) {
        return customers.map(customer => {
            const customerTransactions = transactions.filter(t => t.customerId === customer.id);

            const rfm = {
                recency: this.calculateRecency(customerTransactions),
                frequency: this.calculateFrequency(customerTransactions),
                monetary: this.calculateMonetary(customerTransactions)
            };

            const scores = this.scoreRFM(rfm);
            const segment = this.segmentCustomer(scores);

            return {
                customerId: customer.id,
                name: customer.name,
                rfm,
                scores,
                segment,
                totalValue: rfm.monetary
            };
        });
    }

    /**
     * Calculate Recency (days since last transaction)
     */
    static calculateRecency(transactions) {
        if (transactions.length === 0) return 999;

        const lastTransaction = transactions.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        )[0];

        return Math.ceil((new Date() - new Date(lastTransaction.date)) / (1000 * 60 * 60 * 24));
    }

    /**
     * Calculate Frequency (number of transactions)
     */
    static calculateFrequency(transactions) {
        return transactions.length;
    }

    /**
     * Calculate Monetary (total value)
     */
    static calculateMonetary(transactions) {
        return transactions.reduce((sum, t) => sum + t.value, 0);
    }

    /**
     * Score RFM (1-5 scale)
     */
    static scoreRFM(rfm) {
        return {
            R: this.scoreRecency(rfm.recency),
            F: this.scoreFrequency(rfm.frequency),
            M: this.scoreMonetary(rfm.monetary)
        };
    }

    static scoreRecency(days) {
        if (days <= 30) return 5;
        if (days <= 60) return 4;
        if (days <= 90) return 3;
        if (days <= 180) return 2;
        return 1;
    }

    static scoreFrequency(count) {
        if (count >= 10) return 5;
        if (count >= 7) return 4;
        if (count >= 5) return 3;
        if (count >= 3) return 2;
        return 1;
    }

    static scoreMonetary(value) {
        if (value >= 100000) return 5;
        if (value >= 50000) return 4;
        if (value >= 25000) return 3;
        if (value >= 10000) return 2;
        return 1;
    }

    /**
     * Segment customer
     */
    static segmentCustomer(scores) {
        const { R, F, M } = scores;

        if (R >= 4 && F >= 4 && M >= 4) return { name: 'Champions', color: '#10b981', icon: '🏆' };
        if (R >= 3 && F >= 3 && M >= 3) return { name: 'Loyal', color: '#3b82f6', icon: '💙' };
        if (R >= 4 && F <= 2) return { name: 'New', color: '#8b5cf6', icon: '🌟' };
        if (R <= 2 && F >= 3 && M >= 3) return { name: 'At Risk', color: '#f59e0b', icon: '⚠️' };
        if (R <= 2 && F <= 2) return { name: 'Lost', color: '#ef4444', icon: '❌' };

        return { name: 'Potential', color: '#6b7280', icon: '💡' };
    }
}
