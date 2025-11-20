import styles from './Input.module.css';

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = ''
}) {
    return (
        <div className={`${styles.inputGroup} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <input
                type={type}
                className={`${styles.input} ${error ? styles.error : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}
