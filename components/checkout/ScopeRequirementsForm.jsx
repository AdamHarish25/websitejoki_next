'use client';

import { useState, useCallback } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  Megaphone,
  Smartphone,
  LayoutDashboard,
  Award,
  Plus,
  X
} from 'lucide-react';

/**
 * ScopeRequirementsForm = Form scope kerja untuk kategori NON-Web
 * (SEO, Google Ads, App Dev, Dashboard, Branding)
 *
 * Setiap kategori punya pertanyaan spesifik:
 * - SEO: Target keywords, lokasi, URL website, brief
 * - Ads: Jumlah campaign, budget, target audience, brief
 * - App: Platform, fitur utama, brief
 * - Dashboard: Tipe data, integrasi, brief
 * - Branding: Tipe branding, referensi, brief
 */

const CATEGORY_CONFIG = {
  seo: {
    icon: <Search className="h-5 w-5" />,
    color: 'from-green-500 to-emerald-600',
    fields: ['targetKeywords', 'targetLocation', 'websiteUrl', 'numberOfCampaigns', 'projectBrief']
  },
  ads: {
    icon: <Megaphone className="h-5 w-5" />,
    color: 'from-orange-500 to-red-500',
    fields: ['targetKeywords', 'targetLocation', 'numberOfCampaigns', 'projectBrief']
  },
  app: {
    icon: <Smartphone className="h-5 w-5" />,
    color: 'from-purple-500 to-pink-600',
    fields: ['platform', 'projectBrief']
  },
  dash: {
    icon: <LayoutDashboard className="h-5 w-5" />,
    color: 'from-cyan-500 to-blue-600',
    fields: ['dashboardType', 'projectBrief']
  },
  brand: {
    icon: <Award className="h-5 w-5" />,
    color: 'from-amber-500 to-orange-600',
    fields: ['brandType', 'projectBrief']
  }
};

// Pertanyaan spesifik per kategori
const FIELD_QUESTIONS = {
  seo: {
    targetKeywords: {
      label: 'Target Keyword',
      labelEn: 'Target Keywords',
      placeholder: 'contoh: jasa seo jakarta, seo murah',
      placeholderEn: 'e.g.: seo service jakarta, affordable seo',
      desc: 'Masukkan keyword yang ingin ditargetkan di Google. Pisahkan dengan koma.',
      descEn: 'Enter keywords you want to rank for on Google. Separate with commas.',
      required: true
    },
    targetLocation: {
      label: 'Target Lokasi',
      labelEn: 'Target Location',
      placeholder: 'contoh: Jakarta, Indonesia, Jabodetabek',
      placeholderEn: 'e.g.: Jakarta, Indonesia, Jabodetabek',
      desc: 'Lokasi geografis target customer Anda.',
      descEn: 'Geographic location of your target customers.',
      required: true
    },
    websiteUrl: {
      label: 'URL Website',
      labelEn: 'Website URL',
      placeholder: 'https://websiteanda.com',
      desc: 'URL website yang akan dioptimasi SEO.',
      descEn: 'URL of the website to be optimized.',
      required: false
    },
    numberOfCampaigns: {
      label: 'Jumlah Target Keyword Utama',
      labelEn: 'Number of Main Target Keywords',
      desc: 'Berapa banyak keyword utama yang ingin ditargetkan?',
      descEn: 'How many main keywords do you want to target?',
      type: 'number',
      min: 1,
      max: 50,
      required: true
    },
    projectBrief: {
      label: 'Brief Project',
      labelEn: 'Project Brief',
      placeholder: 'Jelaskan tujuan SEO Anda, target pasar, kompetitor, dll.',
      placeholderEn: 'Describe your SEO goals, target market, competitors, etc.',
      desc: 'Ceritakan tentang bisnis Anda dan tujuan SEO.',
      descEn: 'Tell us about your business and SEO goals.',
      type: 'textarea',
      required: true
    }
  },
  ads: {
    targetKeywords: {
      label: 'Target Keyword Iklan',
      labelEn: 'Ad Target Keywords',
      placeholder: 'contoh: jasa website murah, buat website',
      placeholderEn: 'e.g.: affordable web service, website builder',
      desc: 'Keyword untuk iklan Google Ads.',
      descEn: 'Keywords for Google Ads campaigns.',
      required: true
    },
    targetLocation: {
      label: 'Target Lokasi',
      labelEn: 'Target Location',
      placeholder: 'contoh: Jakarta, Surabaya, Indonesia',
      placeholderEn: 'e.g.: Jakarta, Surabaya, Indonesia',
      desc: 'Lokasi geografis target iklan.',
      descEn: 'Geographic target for your ads.',
      required: true
    },
    numberOfCampaigns: {
      label: 'Jumlah Campaign',
      labelEn: 'Number of Campaigns',
      desc: 'Berapa banyak campaign iklan yang dibutuhkan?',
      descEn: 'How many ad campaigns do you need?',
      type: 'number',
      min: 1,
      max: 20,
      required: true
    },
    projectBrief: {
      label: 'Brief Campaign',
      labelEn: 'Campaign Brief',
      placeholder: 'Jelaskan produk/layanan, target audience, budget range, tujuan campaign.',
      placeholderEn: 'Describe product/service, target audience, budget range, campaign goals.',
      desc: 'Ceritakan tentang campaign iklan yang diinginkan.',
      descEn: 'Tell us about your desired ad campaign.',
      type: 'textarea',
      required: true
    }
  },
  app: {
    platform: {
      label: 'Target Platform',
      labelEn: 'Target Platform',
      type: 'multiCheck',
      options: [
        { value: 'android', label: 'Android', labelEn: 'Android' },
        { value: 'ios', label: 'iOS', labelEn: 'iOS' },
        { value: 'web', label: 'Web App', labelEn: 'Web App' },
        { value: 'cross', label: 'Cross-Platform (React Native/Flutter)', labelEn: 'Cross-Platform (React Native/Flutter)' }
      ],
      desc: 'Platform mana saja yang ingin ditargetkan?',
      descEn: 'Which platforms do you want to target?',
      required: true
    },
    projectBrief: {
      label: 'Brief Aplikasi',
      labelEn: 'App Brief',
      placeholder: 'Jelaskan ide aplikasi, fitur utama, target user, referensi apps lain.',
      placeholderEn: 'Describe app idea, main features, target users, reference apps.',
      desc: 'Ceritakan tentang aplikasi yang ingin dibuat.',
      descEn: 'Tell us about the app you want to build.',
      type: 'textarea',
      required: true
    }
  },
  dash: {
    dashboardType: {
      label: 'Tipe Dashboard',
      labelEn: 'Dashboard Type',
      type: 'select',
      options: [
        { value: 'sales', label: 'Sales / Penjualan', labelEn: 'Sales' },
        { value: 'marketing', label: 'Marketing / Performance', labelEn: 'Marketing / Performance' },
        { value: 'finance', label: 'Finance / Keuangan', labelEn: 'Finance' },
        { value: 'hr', label: 'HR / SDM', labelEn: 'HR / Human Resources' },
        { value: 'ops', label: 'Operations / Operasional', labelEn: 'Operations' },
        { value: 'custom', label: 'Custom / Lainnya', labelEn: 'Custom / Other' }
      ],
      desc: 'Jenis dashboard apa yang dibutuhkan?',
      descEn: 'What type of dashboard do you need?',
      required: true
    },
    projectBrief: {
      label: 'Brief Dashboard',
      labelEn: 'Dashboard Brief',
      placeholder: 'Jelaskan data yang perlu ditampilkan, sumber data, user dashboard, dll.',
      placeholderEn: 'Describe data to display, data sources, dashboard users, etc.',
      desc: 'Ceritakan kebutuhan dashboard Anda.',
      descEn: 'Tell us about your dashboard needs.',
      type: 'textarea',
      required: true
    }
  },
  brand: {
    brandType: {
      label: 'Tipe Branding',
      labelEn: 'Branding Type',
      type: 'multiCheck',
      options: [
        { value: 'logo', label: 'Desain Logo', labelEn: 'Logo Design' },
        { value: 'guideline', label: 'Brand Guideline', labelEn: 'Brand Guideline' },
        { value: 'haki', label: 'Daftar HAKI / Hak Cipta', labelEn: 'Trademark / Copyright Registration' },
        { value: 'stationery', label: 'Kartu Nama & Kop Surat', labelEn: 'Business Card & Letterhead' },
        { value: 'social', label: 'Desain Media Sosial', labelEn: 'Social Media Design' }
      ],
      desc: 'Layanan branding apa saja yang dibutuhkan?',
      descEn: 'Which branding services do you need?',
      required: true
    },
    projectBrief: {
      label: 'Brief Branding',
      labelEn: 'Branding Brief',
      placeholder: 'Jelaskan brand Anda, values, target audience, referensi desain, dll.',
      placeholderEn: 'Describe your brand, values, target audience, design references, etc.',
      desc: 'Ceritakan tentang brand dan identitas visual yang diinginkan.',
      descEn: 'Tell us about your brand and desired visual identity.',
      type: 'textarea',
      required: true
    }
  }
};

export default function ScopeRequirementsForm() {
  const { state, setScopeData } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const category = state.serviceCategory;
  const config = CATEGORY_CONFIG[category];
  const questions = FIELD_QUESTIONS[category];
  const scopeData = state.scopeData || {};

  const [keywordInput, setKeywordInput] = useState('');

  // --- HANDLERS ---
  const handleChange = useCallback((field, value) => {
    setScopeData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setScopeData]);

  const handleAddKeyword = useCallback(() => {
    const kw = keywordInput.trim();
    if (!kw) return;
    const current = scopeData.targetKeywords || [];
    if (current.includes(kw)) return;
    handleChange('targetKeywords', [...current, kw]);
    setKeywordInput('');
  }, [keywordInput, scopeData.targetKeywords, handleChange]);

  const handleRemoveKeyword = useCallback((idx) => {
    const current = scopeData.targetKeywords || [];
    handleChange('targetKeywords', current.filter((_, i) => i !== idx));
  }, [scopeData.targetKeywords, handleChange]);

  const handleMultiCheck = useCallback((field, value) => {
    const current = scopeData[field] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange(field, updated);
  }, [scopeData, handleChange]);

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  if (!config || !questions) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEn ? 'Select a service category first.' : 'Pilih kategori layanan terlebih dahulu.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-gray-50 to-green-50/30 p-4 dark:from-gray-800 dark:to-green-950/20">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md ${config.color}`}>
          {config.icon}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {isEn ? 'Project Scope' : 'Scope Proyek'}
          </div>
          <div className="text-sm font-bold text-gray-800 dark:text-white">
            {isEn
              ? `Tell us about your ${category.toUpperCase()} project`
              : `Ceritakan proyek ${category.toUpperCase()} Anda`}
          </div>
        </div>
      </div>

      {/* Fields */}
      {Object.entries(questions).map(([field, q]) => {
        const value = scopeData[field];

        // TEXT INPUT
        if (!q.type || q.type === 'text' || q.type === 'number') {
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
                {isEn ? q.labelEn : q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.desc && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {isEn ? q.descEn : q.desc}
                </p>
              )}
              <input
                type={q.type || 'text'}
                value={value || ''}
                onChange={(e) => handleChange(field, q.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={isEn ? q.placeholderEn : q.placeholder}
                min={q.min}
                max={q.max}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500/20"
              />
            </div>
          );
        }

        // KEYWORDS INPUT (tag-style)
        if (field === 'targetKeywords') {
          const keywords = value || [];
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
                {isEn ? q.labelEn : q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.desc && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {isEn ? q.descEn : q.desc}
                </p>
              )}
              {/* Tags */}
              {keywords.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(i)}
                        className="ml-0.5 rounded-full p-0.5 text-green-500 hover:bg-green-200 hover:text-green-800 dark:hover:bg-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder={isEn ? q.placeholderEn : q.placeholder}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={!keywordInput.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        }

        // SELECT
        if (q.type === 'select') {
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
                {isEn ? q.labelEn : q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.desc && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {isEn ? q.descEn : q.desc}
                </p>
              )}
              <select
                value={value || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-500/20"
              >
                <option value="">{isEn ? 'Select...' : 'Pilih...'}</option>
                {q.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {isEn ? opt.labelEn : opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // MULTI-CHECK (checkbox group)
        if (q.type === 'multiCheck') {
          const selected = value || [];
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
                {isEn ? q.labelEn : q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.desc && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {isEn ? q.descEn : q.desc}
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map(opt => {
                  const isChecked = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleMultiCheck(field, opt.value)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        isChecked
                          ? 'border-green-500 bg-green-50/80 ring-2 ring-green-100 dark:border-green-500 dark:bg-green-950/30 dark:ring-green-900/30'
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                        isChecked
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isChecked && (
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isChecked ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>
                        {isEn ? opt.labelEn : opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // TEXTAREA
        if (q.type === 'textarea') {
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
                {isEn ? q.labelEn : q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.desc && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {isEn ? q.descEn : q.desc}
                </p>
              )}
              <textarea
                value={value || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={isEn ? q.placeholderEn : q.placeholder}
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500/20"
              />
              <div className="mt-1 text-right text-[10px] text-gray-400 dark:text-gray-500">
                {String(value || '').length} {isEn ? 'characters' : 'karakter'}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
