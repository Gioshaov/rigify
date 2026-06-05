import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translations } from '@/lib/translations'

export function useTranslations() {
  const { lang, t } = useLanguage()

  return {
    lang,
    t, // Direct access to t() helper for inline translations
    tr: translations, // Full translations object for structured access
  }
}
