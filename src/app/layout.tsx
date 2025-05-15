
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/core/Header';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/core/AppProviders';
import { translations } from '@/lib/translations'; // Import translations

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Default metadata to German initially
export const metadata: Metadata = {
  title: translations.de.appTitle,
  description: translations.de.appDescription,
};

export const viewport: Viewport = {
  themeColor: [ // For theme switching PWA support
    { media: '(prefers-color-scheme: light)', color: 'hsl(40 30% 96%)' }, // Corresponds to light theme --background
    { media: '(prefers-color-scheme: dark)', color: 'hsl(225 50% 4.7%)' }, // Corresponds to dark theme --background
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang attribute will be set dynamically by SettingsContext on the client
    // The class (for theme) will also be set dynamically by SettingsContext
    <html lang="de" className="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow dynamic-wavy-gradient-background">
              <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Toaster />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
