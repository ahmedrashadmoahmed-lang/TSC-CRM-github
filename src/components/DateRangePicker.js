'use client';

import { useState } from 'react';

export default function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    label = 'الفترة الزمنية',
    presets = true,
}) {
    const [showPresets, setShowPresets] = useState(false);

    const applyPreset = (preset) => {
        const end = new Date();
        let start = new Date();

        switch (preset) {
            case 'today':
                start = new Date();
                break;
            case 'yesterday':
                start = new Date(Date.now() - 86400000);
                end.setDate(end.getDate() - 1);
                break;
            case 'last7days':
                start.setDate(start.getDate() - 7);
                break;
            case 'last30days':
                start.setDate(start.getDate() - 30);
                break;
            case 'thisMonth':
                start = new Date(end.getFullYear(), end.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
                end = new Date(end.getFullYear(), end.getMonth(), 0);
                break;
            case 'thisYear':
                start = new Date(end.getFullYear(), 0, 1);
                break;
            default:
                break;
        }

        onStartDateChange?.(start.toISOString().split('T')[0]);
        onEndDateChange?.(end.toISOString().split('T')[0]);
        setShowPresets(false);
    };

    const presetOptions = [
        { value: 'today', label: 'اليوم' },
        { value: 'yesterday', label: 'أمس' },
        { value: 'last7days', label: 'آخر 7 أيام' },
        { value: 'last30days', label: 'آخر 30 يوم' },
        { value: 'thisMonth', label: 'هذا الشهر' },
        { value: 'lastMonth', label: 'الشهر الماضي' },
        { value: 'thisYear', label: 'هذا العام' },
    ];

    return (
        <div className="date-range-picker">
            {label && <label className="date-range-label">{label}</label>}

            <div className="date-inputs">
                <div className="date-input-group">
                    <label className="input-label">من</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange?.(e.target.value)}
                        className="date-input"
                    />
                </div>

                <div className="date-input-group">
                    <label className="input-label">إلى</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange?.(e.target.value)}
                        className="date-input"
                    />
                </div>

                {presets && (
                    <div className="preset-wrapper">
                        <button
                            onClick={() => setShowPresets(!showPresets)}
                            className="preset-btn"
                            type="button"
                        >
                            📅 فترات جاهزة
                        </button>

                        {showPresets && (
                            <>
                                <div
                                    className="preset-overlay"
                                    onClick={() => setShowPresets(false)}
                                />
                                <div className="preset-menu">
                                    {presetOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => applyPreset(option.value)}
                                            className="preset-option"
                                            type="button"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        .date-range-picker {
          width: 100%;
        }

        .date-range-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .date-inputs {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .date-input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .date-input {
          padding: 0.5rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }

        .date-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        .preset-wrapper {
          position: relative;
        }

        .preset-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .preset-btn:hover {
          background: var(--bg-tertiary);
        }

        .preset-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        .preset-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          min-width: 150px;
          overflow: hidden;
        }

        .preset-option {
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          text-align: right;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-option:hover {
          background: var(--bg-secondary);
        }

        .preset-option:not(:last-child) {
          border-bottom: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .date-inputs {
            flex-direction: column;
          }

          .preset-btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
