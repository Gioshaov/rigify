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
    // If already on /businesses page, force reset
    if (pathname === '/businesses') {
      e.preventDefault();

      // Set localStorage and sessionStorage flag
      if (typeof window !== 'undefined') {
        localStorage.setItem('rigify-map-view', 'list');
        sessionStorage.setItem('force-list-view', 'true');
      }

      // Navigate to list view
      router.push('/businesses?view=list');
    } else {
      // Navigating from another page - just set localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('rigify-map-view', 'list');
      }
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
