import { Inter } from 'next/font/google';
import Script from 'next/script'; // 1. Impor komponen Script
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const GA_TRACKING_ID = "G-X1F87S6FBB"; // <-- ID Anda dari screenshot

export const metadata = {
  title: 'WebsiteJokiID: Jasa Website, Aplikasi, & Digital Marketing',
  description: 'Butuh website profesional, aplikasi custom, atau jasa Google Ads? WebsiteJokiID hadir sebagai solusi digital untuk level up bisnis Anda. Konsultasi gratis!',
};


export default function RootLayout({ children }) {  
  return (
    <html lang="id">
      {/* 2. Tambahkan dua komponen Script ini di dalam <html>, di atas <body> */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      
  <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        {/* Navbar dan Footer akan dirender di sini oleh layout lain atau page */}
        {children}
      </body>
    </html>
  );
}