'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { LoginForm } from "./LoginForm";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslations } from "@/lib/hooks/useTranslations";

export function LoginPageClient() {
  const { tr, lang } = useTranslations();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || undefined;

  return (
    <main className="min-h-screen flex items-stretch">
      <div className="hidden md:flex w-1/2 bg-surface border-r border-outline-variant flex-col justify-between p-margin-desktop">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <LanguageToggle />
        </div>
        <div>
          <p className="label-mono mb-stack-md">{tr.auth.login.forBusiness[lang]}</p>
          <h2 className="text-headline-md max-w-md">
            {tr.auth.login.salonBookingFlow[lang]}
          </h2>
        </div>
        <p className="label-mono text-on-surface-variant">{tr.auth.login.copyright[lang]}</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-stack-lg flex justify-end">
            <LanguageToggle />
          </div>

          <p className="label-mono text-primary mb-stack-md">{tr.auth.login.signIn[lang]}</p>
          <h1 className="text-display-lg-mobile md:text-headline-md">{tr.auth.login.welcomeBack[lang]}</h1>
          <p className="mt-stack-md text-on-surface-variant">
            {tr.auth.login.newHere[lang]}{" "}
            <Link href="/customer-register" className="text-primary hover:underline">
              {tr.auth.login.registerAsCustomer[lang]}
            </Link>
            .
          </p>

          <LoginForm action={loginAction} redirectTo={redirect} />

          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {tr.auth.login.forgotPassword[lang]}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
