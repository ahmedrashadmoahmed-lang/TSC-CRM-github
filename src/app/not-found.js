'use client';

import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.title}>Page Not Found</h1>
                <p className={styles.message}>
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                <div className={styles.illustration}>
                    <svg viewBox="0 0 200 200" className={styles.svg}>
                        <circle cx="100" cy="100" r="80" fill="#f0f4f8" />
                        <path d="M70 80 Q100 60 130 80" stroke="#667eea" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <circle cx="75" cy="90" r="8" fill="#667eea" />
                        <circle cx="125" cy="90" r="8" fill="#667eea" />
                        <path d="M70 130 Q100 150 130 130" stroke="#667eea" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                </div>

                <div className={styles.actions}>
                    <Link href="/" className={styles.primaryButton}>
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className={styles.secondaryButton}
                    >
                        Go Back
                    </button>
                </div>

                <div className={styles.suggestions}>
                    <h3>You might want to:</h3>
                    <ul>
                        <li><Link href="/">Visit the Dashboard</Link></li>
                        <li><Link href="/customers">View Customers</Link></li>
                        <li><Link href="/products">Browse Products</Link></li>
                        <li><Link href="/invoices">Check Invoices</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
