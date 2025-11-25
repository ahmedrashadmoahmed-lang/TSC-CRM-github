'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './signin.module.css';

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result.error) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                setLoading(false);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            setError('حدث خطأ أثناء تسجيل الدخول');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}></div>

            <div className={styles.formCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Supply Chain ERP</h1>
                    <p className={styles.subtitle}>تسجيل الدخول للنظام</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            كلمة المرور
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'جاري الدخول...' : 'دخول'}
                    </button>

                    <div className={styles.footer}>
                        <p>
                            ليس لديك حساب؟{' '}
                            <Link href="/auth/signup" className={styles.link}>
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}
