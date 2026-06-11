/**
 * FormSuccess component
 * Displays success messages in a consistent format
 */

interface FormSuccessProps {
  /** Success message to display */
  message: string | null | undefined;
  /** Optional test ID for the success message */
  testId?: string;
}

export function FormSuccess({ message, testId }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      data-testid={testId}
      className="p-4 bg-primary/10 border border-primary/30 flex items-center gap-2"
      role="status"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-primary"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <span className="text-primary font-mono text-[12px] tracking-[0.15em] uppercase">
        {message}
      </span>
    </div>
  );
}
