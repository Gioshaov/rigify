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

/**
 * Comprehensive validation utilities
 * Use validators object for consistent validation across all forms
 */
export const validators = {
  email: validateEmail,
  phone: validateGeorgianPhone,
  name: validateName,

  /**
   * Check minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  /**
   * Check maximum length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  },

  /**
   * Check if field is required and not empty
   */
  required: (value: string | null | undefined): boolean => {
    return value != null && value.trim().length > 0;
  },

  /**
   * Validate password strength
   * Requirements: 8+ characters AND contains at least one number
   * Returns detailed breakdown for showing indicators
   */
  passwordStrength: (value: string) => {
    const hasNumber = /[0-9]/.test(value);
    const isValid = value.length >= 8 && hasNumber;

    return {
      isValid,
      length: value.length,
      hasUpper: /[A-Z]/.test(value),
      hasLower: /[a-z]/.test(value),
      hasNumber,
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
  },

  /**
   * Validate price (positive number, max 2 decimals)
   */
  price: (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(value);
  },

  /**
   * Validate duration (positive integer, no decimals)
   */
  duration: (value: string): boolean => {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) && parseInt(trimmed, 10) > 0;
  },

  /**
   * Validate URL format (http/https only)
   * Rejects javascript:, file://, and other dangerous protocols
   */
  url: (value: string): boolean => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  },
};

/**
 * Standard error messages
 * Use these for consistency across the app
 */
export const errorMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number (e.g., +995 555 123 456)",
  name: "Name must be at least 2 characters and contain no numbers",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  passwordWeak: "Password must be at least 8 characters and contain numbers",
  passwordMismatch: "Passwords do not match",
  price: "Please enter a valid price (e.g., 50 or 50.99)",
  duration: "Please enter a valid duration in minutes",
  url: "Please enter a valid URL (e.g., https://example.com)",
  generic: "Please check your input and try again",
};

/**
 * Get password strength label and color
 */
export function getPasswordStrength(password: string): {
  label: string;
  color: string;
  score: number;
} {
  const strength = validators.passwordStrength(password);

  if (password.length === 0) {
    return { label: "", color: "", score: 0 };
  }

  let score = 0;
  if (strength.length >= 8) score++;
  if (strength.length >= 12) score++;
  if (strength.hasUpper && strength.hasLower) score++;
  if (strength.hasNumber) score++;
  if (strength.hasSpecial) score++;

  if (score <= 2) {
    return { label: "Weak", color: "text-error", score };
  } else if (score <= 3) {
    return { label: "Fair", color: "text-amber-400", score };
  } else if (score <= 4) {
    return { label: "Good", color: "text-primary", score };
  } else {
    return { label: "Strong", color: "text-green-400", score };
  }
}
