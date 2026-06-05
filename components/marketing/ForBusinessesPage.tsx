'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useTranslations } from '@/lib/hooks/useTranslations'

export default function ForBusinessesPage() {
  const { tr, lang } = useTranslations()
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    phone: '',
    city: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit request')
        setLoading(false)
        return
      }

      setShowSuccess(true)
      setFormData({ name: '', business_name: '', phone: '', city: '', message: '' })
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <nav className="hidden md:flex items-center gap-stack-lg">
            <Link href="/" className="label-mono hover:text-primary">{tr.common.home[lang]}</Link>
            <Link href="/login" className="btn-secondary !py-2">{tr.common.signIn[lang]}</Link>
            <LanguageToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-md">{tr.forBusinesses.hero.subtitle[lang]}</p>
          <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
            {tr.forBusinesses.hero.title[lang]}
          </h1>
          <p className="mt-stack-lg text-body-md text-on-surface-variant max-w-2xl">
            {tr.forBusinesses.hero.description[lang]}
          </p>
          <div className="mt-stack-lg">
            <button onClick={scrollToContact} className="btn-primary">
              {tr.forBusinesses.hero.requestAccess[lang]}
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-lg">{tr.forBusinesses.problem.title[lang]}</p>
          <div className="grid md:grid-cols-3 gap-stack-lg">
            <div className="bg-background border border-outline-variant rounded-lg p-gutter">
              <div className="text-3xl mb-stack-md">📞</div>
              <h3 className="text-title-md mb-stack-sm">{tr.forBusinesses.problem.missedCalls[lang]}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {tr.forBusinesses.problem.missedCallsDesc[lang]}
              </p>
            </div>
            <div className="bg-background border border-outline-variant rounded-lg p-gutter">
              <div className="text-3xl mb-stack-md">📔</div>
              <h3 className="text-title-md mb-stack-sm">{tr.forBusinesses.problem.notebook[lang]}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {tr.forBusinesses.problem.notebookDesc[lang]}
              </p>
            </div>
            <div className="bg-background border border-outline-variant rounded-lg p-gutter">
              <div className="text-3xl mb-stack-md">🔍</div>
              <h3 className="text-title-md mb-stack-sm">{tr.forBusinesses.problem.noPresence[lang]}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {tr.forBusinesses.problem.noPresenceDesc[lang]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-lg">{tr.forBusinesses.whatYouGet.title[lang]}</p>
          <div className="grid md:grid-cols-2 gap-stack-xl">
            <div>
              <h3 className="text-headline-sm mb-stack-sm">{tr.forBusinesses.whatYouGet.bookingPage[lang]}</h3>
              <p className="text-body-md text-on-surface-variant">
                {tr.forBusinesses.whatYouGet.bookingPageDesc[lang]}
              </p>
            </div>
            <div>
              <h3 className="text-headline-sm mb-stack-sm">{tr.forBusinesses.whatYouGet.aiReceptionist[lang]}</h3>
              <p className="text-body-md text-on-surface-variant">
                {tr.forBusinesses.whatYouGet.aiReceptionistDesc[lang]}
              </p>
            </div>
            <div>
              <h3 className="text-headline-sm mb-stack-sm">{tr.forBusinesses.whatYouGet.dashboard[lang]}</h3>
              <p className="text-body-md text-on-surface-variant">
                {tr.forBusinesses.whatYouGet.dashboardDesc[lang]}
              </p>
            </div>
            <div>
              <h3 className="text-headline-sm mb-stack-sm">{tr.forBusinesses.whatYouGet.instagramLink[lang]}</h3>
              <p className="text-body-md text-on-surface-variant">
                {tr.forBusinesses.whatYouGet.instagramLinkDesc[lang]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Salome Spotlight Section */}
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-2xl mx-auto text-center">
            <p className="label-mono text-primary mb-stack-md">{tr.forBusinesses.salome.title[lang]}</p>
            <h2 className="text-headline-lg mb-stack-lg">{tr.forBusinesses.salome.subtitle[lang]}</h2>
            <div className="bg-background border border-outline-variant rounded-xl p-gutter mb-stack-lg">
              <div className="text-6xl mb-stack-md">🎙️</div>
              <p className="text-body-lg text-on-surface-variant">
                {tr.forBusinesses.salome.description[lang]}
              </p>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {tr.forBusinesses.salome.noTraining[lang]}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-xl mx-auto">
            <p className="label-mono text-primary mb-stack-md text-center">{tr.forBusinesses.contact.title[lang]}</p>
            <h2 className="text-headline-lg mb-stack-sm text-center">{tr.forBusinesses.contact.subtitle[lang]}</h2>
            <p className="text-body-md text-on-surface-variant mb-stack-lg text-center">
              {tr.forBusinesses.contact.description[lang]}
            </p>

            {showSuccess ? (
              <div className="bg-primary/10 border border-primary rounded-xl p-gutter text-center">
                <div className="text-4xl mb-stack-sm">✓</div>
                <h3 className="text-title-lg mb-stack-sm">{tr.forBusinesses.contact.thankYou[lang]}</h3>
                <p className="text-body-md text-on-surface-variant">
                  {tr.forBusinesses.contact.willContact[lang]}
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-stack-md text-primary hover:underline text-sm"
                >
                  {tr.forBusinesses.contact.sendAnother[lang]}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-stack-md">
                <div>
                  <label className="block text-label-md mb-2">{tr.forBusinesses.contact.fullName[lang]}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-label-md mb-2">{tr.forBusinesses.contact.businessName[lang]}</label>
                  <input
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-label-md mb-2">{tr.forBusinesses.contact.phoneNumber[lang]}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    placeholder="+995 555 123 456"
                  />
                </div>

                <div>
                  <label className="block text-label-md mb-2">{tr.forBusinesses.contact.city[lang]}</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">{tr.forBusinesses.contact.selectCity[lang]}</option>
                    <option value="tbilisi">{tr.forBusinesses.contact.tbilisi[lang]}</option>
                    <option value="batumi">{tr.forBusinesses.contact.batumi[lang]}</option>
                    <option value="kutaisi">{tr.forBusinesses.contact.kutaisi[lang]}</option>
                    <option value="other">{tr.forBusinesses.contact.other[lang]}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md mb-2">{tr.forBusinesses.contact.message[lang]}</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? tr.forBusinesses.contact.sendingMessage[lang] : tr.forBusinesses.contact.sendRequest[lang]}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-xl">
          <p className="label-mono text-on-surface-variant text-center">© RIGIFY · Tbilisi</p>
        </div>
      </footer>
    </main>
  )
}
