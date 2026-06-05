import { translations } from '@/lib/translations'

type Language = 'ka' | 'en'

export function getServerTranslations() {
  const lang: Language = 'ka'

  return {
    lang,
    tr: translations
  }
}
