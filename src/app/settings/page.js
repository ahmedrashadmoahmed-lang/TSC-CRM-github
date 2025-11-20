'use client';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './settings.module.css';

export default function Settings() {
    return (
        <MainLayout>
            <Header title="Settings" subtitle="Configure system settings and preferences" />
            <div className={styles.container}>
                <Card title="Company Information">
                    <div className={styles.form}>
                        <Input label="Company Name" value="Supply Chain ERP Co." />
                        <Input label="Tax ID" value="123-456-789" />
                        <Input label="Address" value="123 Business St, Cairo, Egypt" />
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </Card>

                <Card title="Tax Settings">
                    <div className={styles.form}>
                        <Input label="VAT Rate (%)" value="14" type="number" />
                        <Input label="Profit Tax (%)" value="1" type="number" />
                        <Button variant="primary">Update Tax Settings</Button>
                    </div>
                </Card>

                <Card title="Payment Terms">
                    <div className={styles.form}>
                        <Input label="Default Payment Terms (days)" value="30" type="number" />
                        <Input label="Early Payment Discount (%)" value="2" type="number" />
                        <Button variant="primary">Save Payment Terms</Button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
