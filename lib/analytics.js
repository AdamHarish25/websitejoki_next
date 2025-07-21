// Lokasi File: lib/analytics.js

/**
 * Fungsi ini mengirimkan event kustom ke Google Analytics (GA4).
 * Pastikan Anda sudah memasang Global Site Tag (gtag.js) di layout utama.
 * * @param {object} params - Parameter untuk event.
 * @param {string} params.action - Nama event (misal: 'click_whatsapp').
 * @param {string} params.category - Kategori event (misal: 'Contact').
 * @param {string} params.label - Label spesifik untuk event (misal: 'Floating Button').
 */
export const trackEvent = ({ action, category, label }) => {
  // Pertama, kita cek apakah fungsi gtag dari Google sudah ada di browser.
  // Ini untuk mencegah error jika Google Analytics gagal dimuat atau diblokir.
  if (typeof window.gtag !== 'function') {
    console.warn(
      'Google Analytics (gtag.js) tidak ditemukan. Event tidak akan dilacak.'
    );
    return;
  }

  // Jika ada, kirim event-nya.
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
  });

  console.log(`GA Event Sent: ${action}`); // Pesan ini akan muncul di console browser untuk debugging
};