// Lokasi file: app/(admin)/admin/login/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Pastikan path ini benar
import Link from 'next/link';
import { FaArrowCircleLeft } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Mencoba login dengan Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // Jika berhasil, arahkan ke dashboard admin
      router.push('/admin');
    } catch (err) {
      // Jika gagal, tampilkan pesan error
      setError('Email atau password salah. Silakan coba lagi.');
      console.error('Login Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
      <Link href={'/'} className='absolute top-3 left-3 text-underline flex items-center gap-5 transition-transform hover:scale-96 hover:underline'>
        <FaArrowCircleLeft/> Kembali ke beranda
      </Link>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Admin Login
        </h1>
        <p className="text-center text-gray-500">
          Silakan masuk untuk mengelola konten website.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="anda@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-semibold text-white bg-[#2ECC71] rounded-md shadow-sm hover:bg-[#2ECC71]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}