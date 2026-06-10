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
    // If already on /businesses page, force reset to list view
    if (pathname === '/businesses') {
      e.preventDefault();

      // Set localStorage to list
      if (typeof window !== 'undefined') {
        localStorage.setItem('rigify-map-view', 'list');
      }

      // Force navigate to list view
      router.push('/businesses?view=list');

      // Dispatch custom event to force view reset
      window.dispatchEvent(new CustomEvent('force-list-view'));
    }
    // Otherwise, let the Link handle navigation normally
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
