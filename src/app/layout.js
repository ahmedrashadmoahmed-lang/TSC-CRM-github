import "./globals.css";

export const metadata = {
  title: "Supply Chain ERP - Management System",
  description: "Comprehensive Supply Chain ERP for managing sales, procurement, inventory, and fulfillment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

