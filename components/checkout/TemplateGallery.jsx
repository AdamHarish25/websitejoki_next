'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Palette,
  Crown,
  Star
} from 'lucide-react';

/**
 * TemplateGallery = Grid card template untuk kategori Web Design
 * - Fetch templates dari Firestore (filtered by category match web sub-categories)
 * - User pilih salah satu → highlight hijau
 * - Support search + filter by sub-category
 */
export default function TemplateGallery() {
  const { state, setTemplate } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [imgErrors, setImgErrors] = useState({});

  const selectedTemplateId = state.templateId;

  const handleImgError = (templateId) => {
    setImgErrors(prev => ({ ...prev, [templateId]: true }));
  };

  // Fetch templates dari Firestore
  useEffect(() => {
    let cancelled = false;
    async function fetchTemplates() {
      try {
        const q = query(
          collection(db, 'templates'),
          orderBy('order', 'asc')
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTemplates(list);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTemplates();
    return () => { cancelled = true; };
  }, []);

  // Sub-category filter options (unique categories from templates)
  const subCategories = useMemo(() => {
    const cats = [...new Set(templates.map(t => t.category).filter(Boolean))];
    return cats.sort();
  }, [templates]);

  // Filter templates by search + sub-category
  const filtered = useMemo(() => {
    let list = templates;
    if (filterCategory !== 'all') {
      list = list.filter(t => t.category === filterCategory);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        (t.name || '').toLowerCase().includes(s) ||
        (t.nameEn || '').toLowerCase().includes(s) ||
        (t.category || '').toLowerCase().includes(s)
      );
    }
    return list;
  }, [templates, search, filterCategory]);

  const handlePick = (template) => {
    setTemplate(template);
  };

  const handlePreview = (url, e) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Search + Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? 'Search templates...' : 'Cari template...'}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500/20"
          />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-green-500 dark:focus:ring-green-500/20"
        >
          <option value="all">{isEn ? 'All Categories' : 'Semua Kategori'}</option>
          {subCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <div className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        {filtered.length} {isEn ? 'template(s) available' : 'template tersedia'}
      </div>

      {/* Grid Templates */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <Palette className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {isEn ? 'No templates found' : 'Template tidak ditemukan'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isEn
              ? 'Try a different search or filter.'
              : 'Coba kata kunci atau filter lain.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map(template => {
            const isSelected = selectedTemplateId === template.id;
            const name = isEn && template.nameEn ? template.nameEn : template.name;
            const features = isEn && template.featuresEn?.length > 0
              ? template.featuresEn
              : (template.features || []);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handlePick(template)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? 'border-green-500 bg-green-50/60 shadow-xl ring-4 ring-green-100 dark:border-green-500 dark:bg-green-950/20 dark:ring-green-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                {/* Thumbnail / Placeholder */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
                  {template.thumbnailUrl && !imgErrors[template.id] ? (
                    <Image
                      src={template.thumbnailUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      onError={() => handleImgError(template.id)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                        <Palette className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute left-2 top-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        <Crown className="h-3 w-3" /> Premium
                      </span>
                    </div>
                  )}

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute right-2 top-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        <CheckCircle2 className="h-3 w-3" /> {isEn ? 'Selected' : 'Terpilih'}
                      </span>
                    </div>
                  )}

                  {/* Tier Badge */}
                  {template.tier && !template.isPremium && (
                    <div className="absolute left-2 top-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm backdrop-blur dark:bg-gray-800/90 dark:text-gray-200">
                        <Star className="h-3 w-3 text-green-500" /> {template.tier}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Category Tag */}
                  <div className="mb-1.5">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      {template.category?.replace('-', ' ') || 'web'}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                    {name}
                  </h3>

                  {/* Features Preview */}
                  {features.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" strokeWidth={3} />
                          <span className="min-w-0 flex-1 break-words leading-snug">{String(f).trim()}</span>
                        </li>
                      ))}
                      {features.length > 3 && (
                        <li className="pl-5 text-[10px] text-gray-400 dark:text-gray-500">
                          +{features.length - 3} {isEn ? 'more' : 'lainnya'}
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    {template.previewUrl && (
                      <button
                        type="button"
                        onClick={(e) => handlePreview(template.previewUrl, e)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-green-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-green-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {isEn ? 'Preview' : 'Lihat'}
                      </button>
                    )}
                    <div
                      className={`flex-1 rounded-lg py-2 text-center text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600'
                      }`}
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {isEn ? 'SELECTED' : 'TERPILIH'}
                        </span>
                      ) : (
                        <span>{isEn ? 'Choose This' : 'Pilih Ini'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
