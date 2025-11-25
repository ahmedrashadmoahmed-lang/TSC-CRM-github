'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        tenantName: '',
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

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('الرجاء إدخال جميع البيانات المطلوبة');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        if (formData.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    tenantName: formData.tenantName || formData.name + ' Company',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'حدث خطأ أثناء إنشاء الحساب');
                setLoading(false);
                return;
            }

            // Success - redirect to login
            alert('تم إنشاء الحساب بنجاح! سيتم تحويلك لصفحة تسجيل الدخول');
            router.push('/auth/signin');
        } catch (error) {
            setError('حدث خطأ في الاتصال بالخادم');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}></div>

            <div className={styles.formCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Supply Chain ERP</h1>
                    <p className={styles.subtitle}>إنشاء حساب جديد</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name" className={styles.label}>
                            الاسم الكامل
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="أدخل اسمك الكامل"
                            required
                        />
                    </div>

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
                        <label htmlFor="tenantName" className={styles.label}>
                            اسم الشركة (اختياري)
                        </label>
                        <input
                            type="text"
                            id="tenantName"
                            name="tenantName"
                            value={formData.tenantName}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="اسم شركتك"
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            تأكيد كلمة المرور
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
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
                        {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
                    </button>

                    <div className={styles.footer}>
                        <p>
                            لديك حساب بالفعل؟{' '}
                            <Link href="/auth/signin" className={styles.link}>
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
