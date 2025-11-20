'use client';

import styles from './Header.module.css';
import Button from '../ui/Button';

export default function Header({ title, subtitle, actions }) {
    return (
        <header className={styles.header}>
            <div className={styles.titleSection}>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {actions && (
                <div className={styles.actions}>
                    {actions}
                </div>
            )}

            <div className={styles.userSection}>
                <div className={styles.notifications}>
                    <button className={styles.iconBtn}>
                        🔔
                        <span className={styles.badge}>3</span>
                    </button>
                </div>
                <div className={styles.user}>
                    <div className={styles.avatar}>👤</div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>Admin User</div>
                        <div className={styles.userRole}>Administrator</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
