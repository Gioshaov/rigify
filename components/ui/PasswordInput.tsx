"use client";

import { useState } from "react";
import { getPasswordStrength } from "@/lib/utils/validation";

/**
 * PasswordInput component
 * Input field with visibility toggle and optional strength indicator
 */

interface PasswordInputProps {
  /** Input name attribute */
  name: string;
  /** Input ID attribute */
  id: string;
  /** Whether field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Current value (for controlled input) */
  value?: string;
  /** Change handler (for controlled input) */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Minimum length */
  minLength?: number;
  /** Autocomplete value */
  autoComplete?: string;
  /** Additional CSS classes */
  className?: string;
  /** Optional test ID */
  testId?: string;
  /** Show password strength indicator */
  showStrength?: boolean;
  /** Default value (for uncontrolled input) */
  defaultValue?: string;
}

export function PasswordInput({
  name,
  id,
  required = false,
  placeholder = "••••••••",
  value,
  onChange,
  minLength,
  autoComplete,
  className = "",
  testId,
  showStrength = false,
  defaultValue,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Calculate strength if showing indicator
  const strength = showStrength && value !== undefined ? getPasswordStrength(value) : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          id={id}
          data-testid={testId}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`w-full pr-12 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrength && strength && strength.label && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-surface-container-high overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength.score <= 2
                  ? "bg-error w-1/3"
                  : strength.score <= 3
                  ? "bg-amber-400 w-2/3"
                  : strength.score <= 4
                  ? "bg-primary w-5/6"
                  : "bg-green-400 w-full"
              }`}
            />
          </div>
          <span className={`font-mono text-[10px] tracking-[0.15em] uppercase ${strength.color}`}>
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
}
