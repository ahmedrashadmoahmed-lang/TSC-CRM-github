'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-family)',
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: 'var(--success-color)',
                        secondary: '#fff',
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: 'var(--error-color)',
                        secondary: '#fff',
                    },
                },
                loading: {
                    iconTheme: {
                        primary: 'var(--primary-color)',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
