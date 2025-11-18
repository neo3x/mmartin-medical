import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MARTIN - Asistente Médico Inteligente',
  description:
    'Tu asistente médico personal con IA multimodal. Chat inteligente, interpretación de exámenes, vademecum y más.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MARTIN',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'MARTIN Medical Assistant',
    title: 'MARTIN - Asistente Médico Inteligente',
    description: 'Tu asistente médico personal con IA multimodal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MARTIN - Asistente Médico Inteligente',
    description: 'Tu asistente médico personal con IA multimodal',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4F46E5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
