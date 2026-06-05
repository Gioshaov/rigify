'use client'

import Link from "next/link"
import { BookingForm } from "./BookingForm"
import { LanguageToggle } from "@/components/ui/LanguageToggle"
import { useTranslations } from "@/lib/hooks/useTranslations"
import type { Service, Staff } from "@/lib/types/booking"

type CustomerInfo = {
  name: string
  phone: string
  email: string
} | null

type BookingPageClientProps = {
  business: any
  services: Service[]
  staff: Staff[]
  customerInfo: CustomerInfo
  isLoggedIn: boolean
}

export function BookingPageClient({
  business,
  services,
  staff,
  customerInfo,
  isLoggedIn
}: BookingPageClientProps) {
  const { tr, lang } = useTranslations()

  // Check if we have services
  if (services.length === 0) {
    return (
      <main className="min-h-screen bg-background text-on-surface">
        <header className="border-b border-outline-variant">
          <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
            <Link
              href={`/businesses/${business.slug}`}
              className="label-mono hover:text-primary flex items-center gap-2"
            >
              {tr.bookingPage.back[lang]}
            </Link>
            <div className="flex items-center gap-stack-md">
              <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
                RIGIFY
              </Link>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="border border-outline-variant bg-surface p-gutter text-center">
            <p className="label-mono text-on-surface-variant mb-stack-md">
              {tr.bookingPage.noServicesAvailable[lang]}
            </p>
            <p className="text-body-lg text-on-surface-variant mb-stack-lg">
              {tr.bookingPage.noServicesMessage[lang]}
            </p>
            <Link href={`/businesses/${business.slug}`} className="btn-secondary">
              {tr.bookingPage.goBack[lang]}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link
            href={`/businesses/${business.slug}`}
            className="label-mono hover:text-primary flex items-center gap-2"
          >
            {tr.bookingPage.back[lang]}
          </Link>
          <div className="flex items-center gap-stack-md">
            <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
              RIGIFY
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="mb-stack-lg">
          <h1 className="text-display-md mb-stack-sm">{tr.bookingPage.bookAppointment[lang]}</h1>
          <p className="text-headline-sm text-on-surface-variant">{business.name}</p>
        </div>

        <BookingForm
          businessId={business.id}
          businessSlug={business.slug}
          services={services}
          staff={staff}
          customerInfo={customerInfo}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </main>
  )
}
