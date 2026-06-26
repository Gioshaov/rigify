'use client'

import { useEffect } from 'react'
import { LanguageProvider, useLanguage } from '@/lib/contexts/LanguageContext'
import { ConfirmProvider } from '@/lib/contexts/ConfirmContext'
import { ToastProvider } from '@/lib/contexts/ToastContext'

function LangAttributeUpdater({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <>{children}</>
}

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LangAttributeUpdater>
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </LangAttributeUpdater>
    </LanguageProvider>
  )
}
