'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Link from 'next/link';

export default function ManagePackagesPage() {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk form tambah/edit
    const [form, setForm] = useState({ name: '', subtitle: '', price: '', description: '', features: '', order: 0, isPopular: false, category: 'seo' });
    const [isEditing, setIsEditing] = useState(null); // Menyimpan ID dokumen yang sedang diedit

    const fetchPackages = async () => {
        setIsLoading(true);
        const q = query(collection(db, 'packages'), orderBy('order'));
        const querySnapshot = await getDocs(q);
        setPackages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = { ...form, features: form.features.split('\n') };
        if (isEditing) {
            // Update
            const docRef = doc(db, 'packages', isEditing);
            await updateDoc(docRef, dataToSave);
            alert('Paket berhasil diupdate!');
        } else {
            // Tambah baru
            await addDoc(collection(db, 'packages'), dataToSave);
            alert('Paket baru berhasil ditambahkan!');
        }

        setIsEditing(null);
        setForm({ name: '', subtitle: '', price: '', description: '', features: '', order: 0, isPopular: false });
        fetchPackages();
    };

    const handleEdit = (pkg) => {
        setIsEditing(pkg.id);
        setForm({ ...pkg, features: pkg.features.join('\n') }); // Ubah array fitur menjadi string
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus paket ini?")) {
            await deleteDoc(doc(db, 'packages', id));
            fetchPackages();
        }
    };

    return (
        <div className="bg-gray-800 dark:bg-gray-900 text-white min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <Link href="/admin" className="text-yellow-400 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
                <h1 className="text-3xl font-bold mb-8">Manage Pricing Packages</h1>

                {/* Form untuk Tambah / Edit */}
                <form onSubmit={handleSubmit} className="bg-gray-700/50 p-6 rounded-lg mb-10 space-y-4">
                    <h2 className="text-2xl font-semibold">{isEditing ? 'Edit Paket' : 'Tambah Paket Baru'}</h2>
                    {/* Input-input form di sini */}
                    <div>
                        <label className="block">Kategori Layanan</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full p-2 bg-gray-800 rounded">
                            <option value="seo">Jasa SEO</option>
                            <option value="ads">Jasa Ads</option>
                            <option value="web">Jasa Web Design</option>
                            <option value="app">Jasa App Development</option>
                            <option value="dash">Jasa Dashboard</option>
                            <option value="brand">Jasa Branding</option>

                        </select>
                    </div>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama Paket (e.g., STARTER)" className="w-full p-2 bg-gray-800 rounded" />
                    <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" className="w-full p-2 bg-gray-800 rounded" />
                    <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Harga (e.g., Rp 1.900.000)" className="w-full p-2 bg-gray-800 rounded" />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat" className="w-full p-2 bg-gray-800 rounded" />
                    <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Fitur (satu fitur per baris)" rows={6} className="w-full p-2 bg-gray-800 rounded" />
                    <label className="block">Urutan Paket (angka, untuk urutan tampil)</label>
                    <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} placeholder="Urutan (e.g., 1)" className="w-full p-2 bg-gray-800 rounded" />
                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} /> Tandai sebagai Populer</label>
                    <button type="submit" className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">{isEditing ? 'Update Paket' : 'Simpan Paket'}</button>
                    {isEditing && <button type="button" onClick={() => setIsEditing(null)} className="bg-gray-500 px-4 py-2 rounded ml-4">Batal</button>}
                </form>

                {/* Daftar Paket yang Sudah Ada */}
                <div className="bg-gray-700/50 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Existing Packages</h2>
                    {isLoading ? <p>Loading...</p> : (
                        <div className="space-y-4">
                            {packages.map(pkg => (
                                <div key={pkg.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-xl mr-4">(#{pkg.order})</span>
                                        <span>{pkg.name} - {pkg.price}</span>
                                    </div>
                                    <div>
                                        <button onClick={() => handleEdit(pkg)} className="text-yellow-400 hover:underline mr-4">Edit</button>
                                        <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:underline">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}