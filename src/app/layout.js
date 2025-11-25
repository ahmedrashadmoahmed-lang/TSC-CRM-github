import { Inter } from 'next/font/google';
import "./globals.css";
import '../styles/design-system.css';
import '../styles/dark-mode.css';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata = {
  title: "Supply Chain ERP - Management System",
  description: "Comprehensive Supply Chain ERP for managing sales, procurement, inventory, and fulfillment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}


