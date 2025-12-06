import { QueryProvider } from '@/providers/QueryProvider';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'نظام محاسبي برو - Supply Chain ERP',
  description: 'نظام إدارة متكامل لسلسلة التوريد',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable} suppressHydrationWarning>
      <body>
        <QueryProvider>
          {/* <SessionProvider> */}
          {children}
          {/* </SessionProvider> */}
        </QueryProvider>
      </body>
    </html>
  );
}
