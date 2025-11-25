'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import styles from './DateRangePicker.module.css';

export default function DateRangePicker({ startDate, endDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleApply = () => {
        onChange({ startDate: tempStartDate, endDate: tempEndDate });
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempStartDate(startDate);
        setTempEndDate(endDate);
        setIsOpen(false);
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar size={18} />
                <span className={styles.dateText}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                </span>
                <ChevronDown size={18} className={isOpen ? styles.chevronUp : ''} />
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={handleCancel} />
                    <div className={styles.dropdown}>
                        <div className={styles.header}>
                            <h3>اختر الفترة الزمنية</h3>
                        </div>

                        <div className={styles.inputs}>
                            <div className={styles.inputGroup}>
                                <label>من تاريخ</label>
                                <input
                                    type="date"
                                    value={tempStartDate}
                                    onChange={(e) => setTempStartDate(e.target.value)}
                                    className={styles.dateInput}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>إلى تاريخ</label>
                                <input
                                    type="date"
                                    value={tempEndDate}
                                    onChange={(e) => setTempEndDate(e.target.value)}
                                    className={styles.dateInput}
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.cancelButton}
                                onClick={handleCancel}
                            >
                                إلغاء
                            </button>
                            <button
                                className={styles.applyButton}
                                onClick={handleApply}
                            >
                                تطبيق
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
