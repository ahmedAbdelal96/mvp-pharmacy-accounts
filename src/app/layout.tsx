import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "صيدلية حسابات - Pharmacy Accounts Lite",
  description: "إدارة حسابات الأطراف والحركات المالية للصيدلية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col bg-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}