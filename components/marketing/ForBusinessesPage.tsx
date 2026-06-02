'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'

export default function ForBusinessesPage() {
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
        throw new Error('Failed to submit')
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
            <Link href="/" className="label-mono hover:text-primary">Home</Link>
            <Link href="/login" className="btn-secondary !py-2">Sign in</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-md">FOR SALONS · CLINICS · BEAUTY PROFESSIONALS</p>
          <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
            შეავსე განრიგი. უპასუხე ყველა ზარს. განავითარე ბიზნესი.
          </h1>
          <p className="mt-stack-sm text-body-md text-on-surface-variant/70 max-w-2xl italic">
            Fill your calendar. Answer every call. Grow your business.
          </p>
          <p className="mt-stack-lg text-body-md text-on-surface-variant max-w-2xl">
            Rigify gives Georgian salons and clinics a professional booking system with an AI receptionist that works 24/7.
          </p>
          <div className="mt-stack-lg">
            <button onClick={scrollToContact} className="btn-primary">
              წვდომის მოთხოვნა
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-lg">THE PROBLEM</p>
          <div className="grid md:grid-cols-3 gap-stack-lg">
            <div className="bg-background border border-outline-variant rounded-lg p-gutter">
              <div className="text-3xl mb-stack-md">📞</div>
              <h3 className="text-title-md mb-stack-sm">Missed calls = missed revenue</h3>
              <p className="text-body-sm text-on-surface-variant">
                Your phone goes unanswered during appointments. Customers call once, then book with your competitor.
              </p>
            </div>
            <div className="bg-background border border-outline-variant rounded-lg p-gutter">
              <div className="text-3xl mb-stack-md">📔</div>
              <h3 className="text-title-md mb-stack-sm">Notebook scheduling chaos</h3>
              <p className="text-body-sm text-on-surface-variant">
                Double bookings. No-shows. Confusion about who&apos;s coming when. Your notebook isn&apos;t enough anymore.
              </p>
            </div>
            <div className="bg-background border border-outline-variant rounded-lg p-gutter">
              <div className="text-3xl mb-stack-md">🔍</div>
              <h3 className="text-title-md mb-stack-sm">No online presence</h3>
              <p className="text-body-sm text-on-surface-variant">
                Customers can&apos;t find you online. No website. No booking link. Just an Instagram bio with a phone number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-lg">WHAT YOU GET</p>
          <div className="grid md:grid-cols-2 gap-stack-xl">
            <div>
              <h3 className="text-headline-sm mb-stack-sm">Your own booking page</h3>
              <p className="text-body-md text-on-surface-variant">
                Customers can find you, see your services, and book appointments online. Share your link everywhere — Instagram, Facebook, WhatsApp.
              </p>
            </div>
            <div>
              <h3 className="text-headline-sm mb-stack-sm">AI voice receptionist (Salome)</h3>
              <p className="text-body-md text-on-surface-variant">
                Answers calls in Georgian 24/7. Books appointments while you work. Never miss a customer again.
              </p>
            </div>
            <div>
              <h3 className="text-headline-sm mb-stack-sm">Dashboard for your appointments</h3>
              <p className="text-body-md text-on-surface-variant">
                See all your bookings in one place. No more notebook. Know exactly who&apos;s coming and when.
              </p>
            </div>
            <div>
              <h3 className="text-headline-sm mb-stack-sm">Your own link for Instagram</h3>
              <p className="text-body-md text-on-surface-variant">
                Put rigify.ge/your-salon in your bio. Customers can book directly without calling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Salome Spotlight Section */}
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-2xl mx-auto text-center">
            <p className="label-mono text-primary mb-stack-md">SALOME AI</p>
            <h2 className="text-headline-lg mb-stack-lg">Your 24/7 Georgian receptionist</h2>
            <div className="bg-background border border-outline-variant rounded-xl p-gutter mb-stack-lg">
              <div className="text-6xl mb-stack-md">🎙️</div>
              <p className="text-body-lg text-on-surface-variant">
                Customers call your number. Salome answers in Georgian. Books the appointment. You see it in your dashboard.
              </p>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              No training needed. No complicated setup. Just works from day one.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-xl mx-auto">
            <p className="label-mono text-primary mb-stack-md text-center">REQUEST ACCESS</p>
            <h2 className="text-headline-lg mb-stack-sm text-center">Let&apos;s get you started</h2>
            <p className="text-body-md text-on-surface-variant mb-stack-lg text-center">
              We&apos;ll reach out within 24 hours to set up your account.
            </p>

            {showSuccess ? (
              <div className="bg-primary/10 border border-primary rounded-xl p-gutter text-center">
                <div className="text-4xl mb-stack-sm">✓</div>
                <h3 className="text-title-lg mb-stack-sm">გმადლობთ!</h3>
                <p className="text-body-sm text-on-surface-variant/70 italic mb-2">Thank you!</p>
                <p className="text-body-md text-on-surface-variant">
                  დაგიკავშირდებით 24 საათში.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-stack-md text-primary hover:underline text-sm"
                >
                  სხვა მოთხოვნის გაგზავნა
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-stack-md">
                <div>
                  <label className="block text-label-md mb-2">სრული სახელი *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    placeholder="თქვენი სახელი / Your name"
                  />
                </div>

                <div>
                  <label className="block text-label-md mb-2">ბიზნესის დასახელება *</label>
                  <input
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    placeholder="სალონის დასახელება / Salon name"
                  />
                </div>

                <div>
                  <label className="block text-label-md mb-2">ტელეფონის ნომერი *</label>
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
                  <label className="block text-label-md mb-2">ქალაქი</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">აირჩიეთ ქალაქი</option>
                    <option value="tbilisi">თბილისი</option>
                    <option value="batumi">ბათუმი</option>
                    <option value="kutaisi">ქუთაისი</option>
                    <option value="other">სხვა</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md mb-2">შეტყობინება (არასავალდებულო)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    placeholder="მოგვიყევით თქვენს ბიზნესზე..."
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
                  {loading ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
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
