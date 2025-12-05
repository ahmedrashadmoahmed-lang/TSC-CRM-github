'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        company: {
            name: 'Supply Chain ERP',
            email: 'info@erp.com',
            phone: '+20 123 456 7890',
            address: 'القاهرة، مصر'
        },
        system: {
            language: 'ar',
            timezone: 'Africa/Cairo',
            currency: 'EGP'
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90
        }
    });

    const [activeTab, setActiveTab] = useState('company');

    const handleSave = async () => {
        alert('✅ تم حفظ الإعدادات بنجاح');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>⚙️ الإعدادات</h1>
                <p>إدارة إعدادات النظام</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'company' ? styles.active : ''}`}
                    onClick={() => setActiveTab('company')}
                >
                    🏢 الشركة
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'system' ? styles.active : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    🖥️ النظام
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    🔔 الإشعارات
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    🔐 الأمان
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'company' && (
                    <Card title="معلومات الشركة">
                        <div className={styles.form}>
                            <Input
                                label="اسم الشركة"
                                value={settings.company.name}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    company: { ...settings.company, name: e.target.value }
                                })}
                            />
                            <Input
                                label="البريد الإلكتروني"
                                type="email"
                                value={settings.company.email}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    company: { ...settings.company, email: e.target.value }
                                })}
                            />
                            <Input
                                label="الهاتف"
                                value={settings.company.phone}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    company: { ...settings.company, phone: e.target.value }
                                })}
                            />
                            <Input
                                label="العنوان"
                                value={settings.company.address}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    company: { ...settings.company, address: e.target.value }
                                })}
                            />
                        </div>
                    </Card>
                )}

                {activeTab === 'system' && (
                    <Card title="إعدادات النظام">
                        <div className={styles.form}>
                            <div className={styles.field}>
                                <label>اللغة</label>
                                <select
                                    value={settings.system.language}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: { ...settings.system, language: e.target.value }
                                    })}
                                    className={styles.select}
                                >
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>المنطقة الزمنية</label>
                                <select
                                    value={settings.system.timezone}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: { ...settings.system, timezone: e.target.value }
                                    })}
                                    className={styles.select}
                                >
                                    <option value="Africa/Cairo">القاهرة</option>
                                    <option value="Asia/Dubai">دبي</option>
                                    <option value="Asia/Riyadh">الرياض</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>العملة</label>
                                <select
                                    value={settings.system.currency}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: { ...settings.system, currency: e.target.value }
                                    })}
                                    className={styles.select}
                                >
                                    <option value="EGP">جنيه مصري (EGP)</option>
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="AED">درهم إماراتي (AED)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'notifications' && (
                    <Card title="إعدادات الإشعارات">
                        <div className={styles.form}>
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailNotifications}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                                    })}
                                />
                                <label>إشعارات البريد الإلكتروني</label>
                            </div>
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.pushNotifications}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                                    })}
                                />
                                <label>الإشعارات الفورية</label>
                            </div>
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.smsNotifications}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                                    })}
                                />
                                <label>إشعارات SMS</label>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'security' && (
                    <Card title="إعدادات الأمان">
                        <div className={styles.form}>
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={settings.security.twoFactorAuth}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        security: { ...settings.security, twoFactorAuth: e.target.checked }
                                    })}
                                />
                                <label>المصادقة الثنائية (2FA)</label>
                            </div>
                            <Input
                                label="مهلة الجلسة (دقيقة)"
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                                })}
                            />
                            <Input
                                label="انتهاء صلاحية كلمة المرور (يوم)"
                                type="number"
                                value={settings.security.passwordExpiry}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                                })}
                            />
                        </div>
                    </Card>
                )}

                <div className={styles.actions}>
                    <Button onClick={handleSave}>💾 حفظ التغييرات</Button>
                    <Button variant="outline">↺ إعادة تعيين</Button>
                </div>
            </div>
        </div>
    );
}
