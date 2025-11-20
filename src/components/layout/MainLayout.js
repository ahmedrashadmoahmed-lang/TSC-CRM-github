'use client';

import Sidebar from './Sidebar';
import Chatbot from '../ai/Chatbot';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
            <Chatbot />
        </div>
    );
}

