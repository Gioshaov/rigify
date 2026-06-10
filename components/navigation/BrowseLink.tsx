'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface BrowseLinkProps {
  className?: string;
  children: React.ReactNode;
  testId?: string;
}

export function BrowseLink({ className, children, testId }: BrowseLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Always set localStorage to list before navigating
    if (typeof window !== 'undefined') {
      localStorage.setItem('rigify-map-view', 'list');
      // Set a flag that we want to force list view
      sessionStorage.setItem('force-list-view', 'true');
    }

    // If already on /businesses page, force reset
    if (pathname === '/businesses') {
      e.preventDefault();

      // Use replace to force a re-render
      router.replace('/businesses?view=list');

      // Force page refresh after a brief delay to ensure state updates
      setTimeout(() => {
        window.location.href = '/businesses?view=list';
      }, 50);
    }
  };

  return (
    <Link
      data-testid={testId}
      href="/businesses?view=list"
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
