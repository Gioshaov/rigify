'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Real-time hook for emergency cancel flag
 * Subscribes to customer table changes and updates when flag changes
 * Prevents race condition where user cancels in multiple tabs simultaneously
 */
export function useEmergencyCancelFlag(customerId: string, initialValue: boolean) {
  const [hasUsedEmergencyCancel, setHasUsedEmergencyCancel] = useState(initialValue);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes on this customer's row
    const channel = supabase
      .channel(`customer-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customers',
          filter: `id=eq.${customerId}`,
        },
        (payload) => {
          const newValue = payload.new.has_used_emergency_cancel;
          if (typeof newValue === 'boolean') {
            setHasUsedEmergencyCancel(newValue);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  return hasUsedEmergencyCancel;
}
