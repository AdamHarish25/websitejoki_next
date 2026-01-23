'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function ManagePackagesPage() {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    // State form
    const [form, setForm] = useState({
        name: '', subtitle: '', price: '', description: '', features: '',
        nameEn: '', subtitleEn: '', descriptionEn: '', featuresEn: '',
        order: 0, isPopular: false, category: 'seo'
    });

    const [isEditing, setIsEditing] = useState(null);

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

    // Helper for sequential translation
    const translateText = async (text) => {
        if (!text) return '';
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, sourceLang: 'id', targetLang: 'en' }),
            });
            if (!res.ok) return text;
            const data = await res.json();
            return data.translatedText || text;
        } catch (err) {
            console.error(err);
            return text;
        }
    };

    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            const updates = {};

            // Translate explicit fields if EN is empty
            if (form.name && !form.nameEn) updates.nameEn = await translateText(form.name);
            if (form.subtitle && !form.subtitleEn) updates.subtitleEn = await translateText(form.subtitle);
            if (form.description && !form.descriptionEn) updates.descriptionEn = await translateText(form.description);

            // Translate Features line-by-line for better accuracy
            if (form.features && !form.featuresEn) {
                const featuresList = form.features.split('\n').filter(f => f.trim() !== '');
                const translatedFeatures = [];
                for (const f of featuresList) {
                    const trans = await translateText(f);
                    translatedFeatures.push(trans);
                }
                updates.featuresEn = translatedFeatures.join('\n');
            }

            setForm(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error(error);
            alert('Auto-translation failed');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Prepare data
        const dataToSave = {
            ...form,
            features: form.features.split('\n').filter(f => f.trim() !== ''),
            featuresEn: form.featuresEn ? form.featuresEn.split('\n').filter(f => f.trim() !== '') : []
        };

        // Cleanup empty English fields to null if preferred, or just save empty array/string
        // Firestore is fine with empty strings.

        try {
            if (isEditing) {
                const docRef = doc(db, 'packages', isEditing);
                await updateDoc(docRef, dataToSave);
                alert('Paket berhasil diupdate!');
            } else {
                await addDoc(collection(db, 'packages'), dataToSave);
                alert('Paket baru berhasil ditambahkan!');
            }

            setIsEditing(null);
            setForm({
                name: '', subtitle: '', price: '', description: '', features: '',
                nameEn: '', subtitleEn: '', descriptionEn: '', featuresEn: '',
                order: 0, isPopular: false, category: 'seo'
            });
            fetchPackages();
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan paket');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (pkg) => {
        setIsEditing(pkg.id);
        setForm({
            ...pkg,
            features: pkg.features ? pkg.features.join('\n') : '',
            featuresEn: pkg.featuresEn ? pkg.featuresEn.join('\n') : '',
            // Handle missing fields for older data
            nameEn: pkg.nameEn || '',
            subtitleEn: pkg.subtitleEn || '',
            descriptionEn: pkg.descriptionEn || '',
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus paket ini?")) {
            await deleteDoc(doc(db, 'packages', id));
            fetchPackages();
        }
    };

    const handleCancel = () => {
        setIsEditing(null);
        setForm({
            name: '', subtitle: '', price: '', description: '', features: '',
            nameEn: '', subtitleEn: '', descriptionEn: '', featuresEn: '',
            order: 0, isPopular: false, category: 'seo'
        });
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8 font-sans text-gray-900 dark:text-gray-100">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight">Manage Pricing Packages</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* FORM SECTION (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                {isEditing ? <Edit2 className="w-5 h-5 text-yellow-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                                {isEditing ? 'Edit Package' : 'Add New Package'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Common Fields */}
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Category & Order</label>
                                    <div className="flex gap-2">
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="flex-1 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm">
                                            <option value="seo">SEO</option>
                                            <option value="ads">Ads</option>
                                            <option value="web">Web Design</option>
                                            <option value="app">App Dev</option>
                                            <option value="dash">Dashboard</option>
                                            <option value="brand">Branding</option>
                                        </select>
                                        <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="w-20 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm" placeholder="#" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <label className="text-xs font-bold uppercase text-green-600 mb-2 block">Indonesian Content</label>
                                    <div className="space-y-3">
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama Paket (e.g. Starter)" className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm" required />
                                        <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Harga (e.g. Rp 1.5jt)" className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm" required />
                                        <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle (e.g. Cocok untuk UMKM)" className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm" />
                                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi Singkat" className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm" rows={2} />
                                        <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Fitur (Satu per baris)" className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm font-mono" rows={4} />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase text-blue-500 block">English Content</label>
                                        <button type="button" onClick={handleAutoTranslate} disabled={isTranslating} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Auto-Fill
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} placeholder="Package Name (EN)" className="w-full p-2 rounded-lg border bg-blue-50/50 dark:bg-gray-900 border-blue-200 dark:border-gray-700 text-sm" />
                                        <input value={form.subtitleEn} onChange={e => setForm({ ...form, subtitleEn: e.target.value })} placeholder="Subtitle (EN)" className="w-full p-2 rounded-lg border bg-blue-50/50 dark:bg-gray-900 border-blue-200 dark:border-gray-700 text-sm" />
                                        <textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Short Description (EN)" className="w-full p-2 rounded-lg border bg-blue-50/50 dark:bg-gray-900 border-blue-200 dark:border-gray-700 text-sm" rows={2} />
                                        <textarea value={form.featuresEn} onChange={e => setForm({ ...form, featuresEn: e.target.value })} placeholder="Features (One per line) (EN)" className="w-full p-2 rounded-lg border bg-blue-50/50 dark:bg-gray-900 border-blue-200 dark:border-gray-700 text-sm font-mono" rows={4} />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.isPopular ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-gray-300 bg-white'}`}>
                                            {form.isPopular && <CheckCircle className="w-4 h-4" />}
                                        </div>
                                        <input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="hidden" />
                                        Mark as Popular
                                    </label>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button type="submit" disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2">
                                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isEditing ? 'Update Package' : 'Save Package'}
                                    </button>
                                    {isEditing && (
                                        <button type="button" onClick={handleCancel} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                            Cancel
                                        </button>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>

                    {/* LIST SECTION */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-gray-300 animate-spin" /></div>
                            ) : (
                                packages.map(pkg => (
                                    <div key={pkg.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between group">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">#{pkg.order}</span>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase">{pkg.category}</span>
                                                {pkg.isPopular && <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Popular</span>}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pkg.name}</h3>
                                            <p className="text-green-600 font-bold mb-2">{pkg.price}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{pkg.description}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(pkg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                            {!isLoading && packages.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No packages found. Add one on the left!
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}