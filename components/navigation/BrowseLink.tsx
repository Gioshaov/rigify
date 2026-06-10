'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BrowseLinkProps {
  className?: string;
  children: React.ReactNode;
  testId?: string;
}

export function BrowseLink({ className, children, testId }: BrowseLinkProps) {
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
    >
      {children}
    </Link>
  );
}
