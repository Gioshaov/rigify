'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ka' | 'en'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (translations: { ka: string; en: string }) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ka')

  // Load language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rigify-lang') as Language | null
    if (saved === 'ka' || saved === 'en') {
      setLangState(saved)
      // Sync cookie with localStorage on mount (for existing users)
      document.cookie = `rigify-lang=${saved}; path=/; max-age=31536000; SameSite=Lax`
    }
  }, [])

  // Save language preference to localStorage and cookie when changed
  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('rigify-lang', newLang)
    // Set cookie for server-side rendering
    document.cookie = `rigify-lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`
  }

  // Translation helper function
  const t = (translations: { ka: string; en: string }) => {
    return translations[lang]
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
