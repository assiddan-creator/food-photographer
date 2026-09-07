import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Virtual Food Photographer | Assi & Johnny Photobooth AI',
  description:
    'צלם מנה ← קבל תמונה שמוכרת. בלי צלם. בלי סטודיו. Turn a dish photo into a commercial food image.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
