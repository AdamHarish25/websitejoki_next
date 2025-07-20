'use client';

import { useEffect } from 'react';

export default function NoRightClickWrapper({ children }) {
  useEffect(() => {
    // Fungsi ini akan dijalankan saat event klik kanan terjadi
    const handleContextMenu = (e) => {
      e.preventDefault(); // Mencegah menu konteks (menu klik kanan) muncul
    };

    // Tambahkan event listener ke seluruh dokumen
    document.addEventListener('contextmenu', handleContextMenu);

    // Fungsi cleanup: hapus event listener saat komponen tidak lagi digunakan
    // Ini penting untuk mencegah memory leak
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []); // Array kosong berarti efek ini hanya berjalan sekali saat komponen dimuat

  return <>{children}</>;
}