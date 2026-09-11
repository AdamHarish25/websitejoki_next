import { redirect } from 'next/navigation';

/**
 * Root /order page: redirect user ke /order/step-1-service (halaman pertama checkout)
 * Jangan tampilkan apa-apa di halaman ini, langsung redirect.
 */
export default function OrderRootPage() {
  redirect('/order/step-1-service');
}
