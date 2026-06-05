'use client'

import { useLanguage } from '@/lib/contexts/LanguageContext'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="label-mono flex items-center gap-1">
      <button
        onClick={() => setLang('ka')}
        className={`hover:text-on-surface transition-colors ${
          lang === 'ka' ? 'text-primary' : 'text-on-surface-variant'
        }`}
        aria-label="Switch to Georgian"
      >
        ქარ
      </button>
      <span className="text-on-surface-variant">/</span>
      <button
        onClick={() => setLang('en')}
        className={`hover:text-on-surface transition-colors ${
          lang === 'en' ? 'text-primary' : 'text-on-surface-variant'
        }`}
        aria-label="Switch to English"
      >
        ENG
      </button>
    </div>
  )
}
