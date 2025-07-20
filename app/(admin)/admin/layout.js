'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';

export default function AdminLayout({ children }) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
        // Jika loading selesai dan tidak ada user, redirect ke halaman login
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Selama loading, tampilkan pesan
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Memverifikasi sesi...</div>;
    }

    // Jika sudah login, tampilkan konten halaman admin (yaitu {children})
    if (user) {
        return <>{children}</>;
    }
    
    // Jika tidak loading dan tidak ada user, jangan tampilkan apa-apa karena akan segera diredirect
    return null;
}