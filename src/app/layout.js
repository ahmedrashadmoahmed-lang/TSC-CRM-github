import "./globals.css";
import '../styles/design-system.css';
import '../styles/dark-mode.css';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata = {
  title: "Supply Chain ERP - Management System",
  description: "Comprehensive Supply Chain ERP for managing sales, procurement, inventory, and fulfillment",
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#007bff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main-content" className="skip-link">
          تخطي إلى المحتوى الرئيسي
        </a>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
