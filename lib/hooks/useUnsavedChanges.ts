'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to warn users about unsaved changes when navigating away
 * @param isDirty - Whether the form has unsaved changes
 * @param message - Optional custom warning message
 */
export function useUnsavedChanges(isDirty: boolean, message?: string) {
  const router = useRouter()
  const defaultMessage = message || 'You have unsaved changes. Are you sure you want to leave?'

  useEffect(() => {
    if (!isDirty) return

    // Handle browser refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = defaultMessage
      return defaultMessage
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, defaultMessage])

  // Handle Next.js navigation (clicking links)
  useEffect(() => {
    if (!isDirty) return

    const handleRouteChange = () => {
      const confirmed = window.confirm(defaultMessage)
      if (!confirmed) {
        // This doesn't actually prevent navigation in App Router
        // We need a different approach for App Router
        throw new Error('Route change cancelled by user')
      }
    }

    // Note: App Router doesn't have router events like Pages Router
    // We need to intercept Link clicks manually
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href && !link.href.startsWith(window.location.href)) {
        if (isDirty) {
          const confirmed = window.confirm(defaultMessage)
          if (!confirmed) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [isDirty, defaultMessage])
}
