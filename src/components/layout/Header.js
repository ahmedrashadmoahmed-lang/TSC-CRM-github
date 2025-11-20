'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header({ title, subtitle, actions }) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <div className={styles.headerRight}>
                    {actions}
                </div>
            </div>
            <div className={styles.userSection}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {session?.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>{session?.user?.name || 'User'}</span>
                        <span className={styles.userRole}>{session?.user?.role || 'employee'}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    🚪 خروج
                </button>
            </div>
        </header>
    );
}
