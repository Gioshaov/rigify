/**
 * LoadingButton component
 * Button with consistent loading state (spinner + text)
 */

interface LoadingButtonProps {
  /** Button text when not loading */
  children: React.ReactNode;
  /** Loading text (shown with spinner) */
  loadingText?: string;
  /** Whether button is in loading state */
  isLoading: boolean;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Additional CSS classes */
  className?: string;
  /** Optional test ID */
  testId?: string;
  /** Click handler (only fires when not loading) */
  onClick?: () => void;
  /** Whether button is disabled (independent of loading) */
  disabled?: boolean;
  /** Optional icon (Material Symbols name) */
  icon?: string;
}

export function LoadingButton({
  children,
  loadingText = "Processing...",
  isLoading,
  type = "button",
  className = "",
  testId,
  onClick,
  disabled = false,
  icon,
}: LoadingButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      data-testid={testId}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={isLoading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && (
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              {icon}
            </span>
          )}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
