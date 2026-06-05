import { translations } from '@/lib/translations'

type Language = 'ka' | 'en' | 'ru'

// TODO: Read language preference from cookies when language persistence is updated
// Currently defaults to Georgian (ka) for server-side rendering
// Client-side hydration will respect localStorage preference via LanguageContext
export function getServerTranslations() {
  const lang: Language = 'ka'

  return {
    lang,
    tr: translations
  }
}
