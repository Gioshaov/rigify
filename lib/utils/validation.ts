/**
 * Validation utilities for form inputs
 */

/**
 * Validates Georgian phone number format
 * Accepts: +995 5XX XXX XXX, 995 5XX XXX XXX, or 5XXXXXXXX
 */
export function validateGeorgianPhone(phone: string): boolean {
  // Remove all spaces for consistent validation
  const cleaned = phone.replace(/\s/g, '')
  // Match Georgian mobile format: +995 or 995 prefix (optional) + 5 + 8 digits
  const regex = /^(\+995|995)?5\d{8}$/
  return regex.test(cleaned)
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
