import type { Metadata, Viewport } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';

const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mplus-rounded',
});

export const metadata: Metadata = {
  title: 'wakaroo - 知育アプリポータル',
  description: '子育てに役立つ知育アプリをザッピング感覚で探せるポータルサイト',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'wakaroo',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${mPlusRounded.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-mplus-rounded), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
