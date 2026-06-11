/**
 * FormError component
 * Displays validation errors in a consistent format
 */

interface FormErrorProps {
  /** Error message to display */
  message: string | null | undefined;
  /** Optional test ID for the error message */
  testId?: string;
  /** Display mode: 'banner' (with icon, for form-level) or 'inline' (compact, for field-level) */
  mode?: "banner" | "inline";
}

export function FormError({ message, testId, mode = "inline" }: FormErrorProps) {
  if (!message) return null;

  if (mode === "banner") {
    return (
      <div
        data-testid={testId}
        className="p-4 border border-error/20 bg-error/10"
        role="alert"
      >
        <div className="flex items-start gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-error text-[18px] mt-0.5">
            error
          </span>
          <p className="font-hanken text-[14px] leading-[1.5] text-error">
            {message}
          </p>
        </div>
      </div>
    );
  }

  // Inline mode
  return (
    <p
      data-testid={testId}
      className="mt-1 text-error font-mono text-[10px] tracking-[0.15em] uppercase"
      role="alert"
    >
      {message}
    </p>
  );
}
