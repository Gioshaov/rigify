import type { BusinessHours, DayOfWeek } from '@/lib/types/booking'

export function isValidBusinessHours(data: unknown): data is BusinessHours {
  if (data === null) return true
  if (typeof data !== 'object') return false

  const validDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  for (const [key, value] of Object.entries(data)) {
    if (!validDays.includes(key as DayOfWeek)) return false
    if (typeof value !== 'object' || value === null) return false

    const hours = value as any
    if (typeof hours.open !== 'string' || typeof hours.close !== 'string') return false
    if (hours.closed !== undefined && typeof hours.closed !== 'boolean') return false
  }

  return true
}
