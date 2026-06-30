'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BrowseLinkProps {
  className?: string;
  children: React.ReactNode;
  testId?: string;
  /** Marks this link as the current page for assistive tech. */
  current?: boolean;
}

export function BrowseLink({ className, children, testId, current }: BrowseLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Dispatch custom event to reset view mode
    window.dispatchEvent(new CustomEvent('resetToListView'));

    // Navigate to businesses page
    router.push('/businesses');
  };

  return (
    <Link
      data-testid={testId}
      href="/businesses"
      className={className}
      onClick={handleClick}
      aria-current={current ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
