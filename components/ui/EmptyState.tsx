import Link from "next/link";

interface EmptyStateProps {
  /** Material Symbols icon name */
  icon: string;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional CTA button */
  action?: {
    label: string;
    href: string;
    testId?: string;
  };
  /** Optional test ID for the container */
  testId?: string;
}

export function EmptyState({ icon, title, description, action, testId }: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon */}
      <div className="mb-6">
        <div className="w-24 h-24 bg-surface-container border-2 border-white/10 flex items-center justify-center">
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[48px]">
            {icon}
          </span>
        </div>
      </div>

      {/* Text */}
      <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-3">
        {title}
      </h3>
      <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant max-w-md mb-8">
        {description}
      </p>

      {/* CTA */}
      {action && (
        <Link
          href={action.href}
          data-testid={action.testId}
          className="bg-primary text-on-primary px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          {action.label}
        </Link>
      )}
    </div>
  );
}
