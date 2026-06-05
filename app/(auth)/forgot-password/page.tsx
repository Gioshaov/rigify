'use client'

import Link from "next/link";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslations } from "@/lib/hooks/useTranslations";

export default function ForgotPasswordPage() {
  const { tr, lang } = useTranslations();

  return (
    <main className="min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 relative">
          <Link href="/" className="inline-block font-mono text-data-label uppercase tracking-[0.2em] text-primary mb-8">
            RIGIFY
          </Link>
          <div className="absolute top-0 right-0">
            <LanguageToggle />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-outline-variant p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h1 className="text-headline-md mb-4">{tr.auth.forgotPassword.resetPassword[lang]}</h1>
          <p className="text-on-surface-variant mb-6">
            {tr.auth.forgotPassword.comingSoon[lang]}
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="btn-primary w-full inline-block text-center"
            >
              {tr.auth.forgotPassword.backToLogin[lang]}
            </Link>
            <Link
              href="/"
              className="block text-sm text-primary hover:underline"
            >
              {tr.auth.forgotPassword.goToHomepage[lang]}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
