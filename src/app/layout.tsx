import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'رفيق الصلاة',
  description: 'رفيقك لأوقات الصلاة اليومية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang, dir, and class attributes are now managed by the Header component via a hook.
    // suppressHydrationWarning is needed to avoid warnings because the theme is set on the client.
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased transition-colors duration-300">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
