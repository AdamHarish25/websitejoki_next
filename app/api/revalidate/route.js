import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Amankan API Route ini dengan secret token
  if (secret !== process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    // Revalidasi (update cache) untuk halaman daftar blog
    revalidatePath('/blog');
    
    // Anda juga bisa menambahkan revalidasi untuk halaman beranda jika perlu
    // revalidatePath('/');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
  }
}