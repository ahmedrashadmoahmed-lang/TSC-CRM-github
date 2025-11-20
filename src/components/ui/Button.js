import styles from './Button.module.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    type = 'button',
    className = ''
}) {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
