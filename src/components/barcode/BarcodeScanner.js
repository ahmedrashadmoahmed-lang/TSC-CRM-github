'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './BarcodeScanner.module.css';

export default function BarcodeScanner({ onScan, mode = 'qr' }) {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [scanner]);

    const startScanning = () => {
        setScanning(true);
        setError(null);
        setResult(null);

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanError);
        setScanner(html5QrcodeScanner);
    };

    const onScanSuccess = (decodedText, decodedResult) => {
        try {
            // Parse QR code data
            const data = JSON.parse(decodedText);

            setResult({
                success: true,
                type: data.type,
                data: data
            });

            if (onScan) {
                onScan({
                    success: true,
                    data: data
                });
            }

            // Stop scanning
            if (scanner) {
                scanner.clear();
            }
            setScanning(false);

        } catch (e) {
            // If not JSON, treat as barcode/serial number
            setResult({
                success: true,
                type: 'BARCODE',
                data: { code: decodedText }
            });

            if (onScan) {
                onScan({
                    success: true,
                    data: { code: decodedText }
                });
            }

            if (scanner) {
                scanner.clear();
            }
            setScanning(false);
        }
    };

    const onScanError = (errorMessage) => {
        // Ignore continuous scanning errors
        if (!errorMessage.includes('NotFoundException')) {
            console.error('Scan error:', errorMessage);
        }
    };

    const stopScanning = () => {
        if (scanner) {
            scanner.clear();
        }
        setScanning(false);
    };

    const resetScanner = () => {
        setResult(null);
        setError(null);
    };

    return (
        <Card title="📷 ماسح الباركود/QR">
            <div className={styles.container}>
                {!scanning && !result && (
                    <div className={styles.startSection}>
                        <p>امسح رمز QR أو الباركود للمنتجات والأوامر</p>
                        <Button onClick={startScanning}>
                            📷 بدء المسح
                        </Button>
                    </div>
                )}

                {scanning && (
                    <div className={styles.scannerSection}>
                        <div id="qr-reader" className={styles.reader}></div>
                        <Button variant="error" onClick={stopScanning}>
                            ⏹️ إيقاف المسح
                        </Button>
                    </div>
                )}

                {result && (
                    <div className={styles.resultSection}>
                        <div className={styles.resultHeader}>
                            <Badge variant="success">✅ تم المسح بنجاح</Badge>
                        </div>

                        <div className={styles.resultData}>
                            <div className={styles.resultItem}>
                                <span>النوع:</span>
                                <span className={styles.resultValue}>
                                    {result.type === 'PO' ? '📦 أمر شراء' :
                                        result.type === 'SHIPMENT' ? '🚚 شحنة' :
                                            result.type === 'PRODUCT' ? '📦 منتج' :
                                                '🔢 باركود'}
                                </span>
                            </div>

                            {result.data.number && (
                                <div className={styles.resultItem}>
                                    <span>الرقم:</span>
                                    <span className={styles.resultValue}>{result.data.number}</span>
                                </div>
                            )}

                            {result.data.code && (
                                <div className={styles.resultItem}>
                                    <span>الكود:</span>
                                    <span className={styles.resultValue}>{result.data.code}</span>
                                </div>
                            )}

                            {result.data.serial && (
                                <div className={styles.resultItem}>
                                    <span>الرقم التسلسلي:</span>
                                    <span className={styles.resultValue}>{result.data.serial}</span>
                                </div>
                            )}

                            {result.data.tracking && (
                                <div className={styles.resultItem}>
                                    <span>رقم التتبع:</span>
                                    <span className={styles.resultValue}>{result.data.tracking}</span>
                                </div>
                            )}

                            {result.data.url && (
                                <div className={styles.resultItem}>
                                    <span>الرابط:</span>
                                    <a href={result.data.url} className={styles.link}>
                                        عرض التفاصيل
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className={styles.resultActions}>
                            <Button onClick={resetScanner}>
                                🔄 مسح جديد
                            </Button>
                            {result.data.url && (
                                <Button variant="primary" onClick={() => window.location.href = result.data.url}>
                                    👁️ عرض
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        <p>❌ {error}</p>
                        <Button onClick={resetScanner}>إعادة المحاولة</Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
