import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WEBSITEJOKI.ID - Solusi Digital untuk Bisnis Anda',
  description: 'Jasa pembuatan Website, Google Ads, Aplikasi, dan SEO.',
  icons: {
    icon: '/favicon.ico', // <-- Tambahkan ?v=1 di belakangnya
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        {children}
      </body>
    </html>
  );
}