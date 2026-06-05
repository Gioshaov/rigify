'use client'

import Link from "next/link";
import { customerRegisterAction } from "./actions";
import { CustomerRegisterForm } from "./CustomerRegisterForm";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslations } from "@/lib/hooks/useTranslations";

export default function CustomerRegisterPage() {
  const { tr, lang } = useTranslations();

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
          <p className="label-mono mb-stack-md">{tr.auth.customerRegister.createAccount[lang]}</p>
          <h2 className="text-headline-md max-w-md">
            {tr.auth.customerRegister.trackBookings[lang]}
          </h2>
          <ul className="mt-stack-lg space-y-stack-sm text-on-surface-variant">
            <li>{tr.auth.customerRegister.viewUpcoming[lang]}</li>
            <li>{tr.auth.customerRegister.accessHistory[lang]}</li>
            <li>{tr.auth.customerRegister.manageProfile[lang]}</li>
          </ul>
        </div>
        <p className="label-mono text-on-surface-variant">{tr.auth.login.copyright[lang]}</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-stack-lg flex justify-end">
            <LanguageToggle />
          </div>

          <p className="label-mono text-primary mb-stack-md">{tr.auth.customerRegister.customerAccount[lang]}</p>
          <h1 className="text-display-lg-mobile md:text-headline-md">{tr.auth.customerRegister.createYourAccount[lang]}</h1>
          <p className="mt-stack-md text-on-surface-variant">
            {tr.auth.customerRegister.alreadyHaveAccount[lang]}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {tr.common.signIn[lang]}
            </Link>
            .
          </p>
          <p className="mt-stack-sm text-on-surface-variant text-sm">
            {tr.auth.customerRegister.areYouBusiness[lang]}{" "}
            <Link href="/for-businesses" className="text-primary hover:underline">
              {tr.common.forBusiness[lang]}
            </Link>
            .
          </p>

          <CustomerRegisterForm action={customerRegisterAction} />
        </div>
      </div>
    </main>
  );
}
