import { cookies } from 'next/headers'
import { translations } from '@/lib/translations'

type Language = 'ka' | 'en'

// Read language preference from cookies for server-side rendering
// Falls back to Georgian (ka) if no cookie is set
export function getServerTranslations() {
  const cookieStore = cookies()
  const langCookie = cookieStore.get('rigify-lang')?.value as Language | undefined

  // Validate and default to 'ka' if invalid or missing
  const lang: Language = (langCookie === 'ka' || langCookie === 'en')
    ? langCookie
    : 'ka'

  return {
    lang,
    tr: translations
  }
}
