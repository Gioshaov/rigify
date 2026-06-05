'use client'

import Link from 'next/link'
import { CITIES } from '@/lib/constants/cities'
import { useTranslations } from '@/lib/hooks/useTranslations'

export function CitiesSection() {
  const { tr, lang } = useTranslations()

  return (
    <section>
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
        <p className="label-mono mb-stack-lg">{tr.homepage.cities[lang]}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CITIES.map((city) => {
            const isTbilisi = city.id === 'tbilisi'

            if (isTbilisi) {
              return (
                <Link
                  key={city.id}
                  href="/businesses?city=tbilisi"
                  className="bg-surface border border-outline-variant p-gutter hover:border-on-surface-variant transition-colors text-center"
                >
                  <p className="text-headline-md">{city[lang]}</p>
                </Link>
              )
            }

            return (
              <div
                key={city.id}
                className="bg-surface border border-outline-variant p-gutter text-center opacity-50 cursor-not-allowed"
              >
                <p className="text-headline-md">{city[lang]}</p>
                <p className="text-body-sm text-on-surface-variant mt-stack-xs">
                  {lang === 'ka' ? 'მალე' : 'Coming soon'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
