/**
 * Validation utilities for form inputs
 */

/**
 * Validates phone number format
 * Accepts:
 * - Georgian mobile: +995 5XX XXX XXX (or without prefix)
 * - Georgian landline: +995 [2|3|4|7|8]X XXX XXX
 * - International: any number starting with +
 */
export function validateGeorgianPhone(phone: string): boolean {
  // Remove all spaces for consistent validation
  const cleaned = phone.replace(/\s/g, '')

  // Accept any international number with + prefix (E.164 format)
  if (cleaned.startsWith('+')) {
    return cleaned.length >= 10 && cleaned.length <= 15 && /^\+\d+$/.test(cleaned)
  }

  // Georgian numbers without prefix: mobile (5) or landline (2,3,4,7,8) + 8 digits
  const georgianRegex = /^(995)?[2345789]\d{8}$/
  return georgianRegex.test(cleaned)
}

/**
 * Validates name field
 * - Minimum 2 characters
 * - No numbers allowed
 */
export function validateName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 2 && !/\d/.test(trimmed)
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
