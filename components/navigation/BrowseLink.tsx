'use client'

import Link from 'next/link';

interface BrowseLinkProps {
  className?: string;
  children: React.ReactNode;
  testId?: string;
}

export function BrowseLink({ className, children, testId }: BrowseLinkProps) {
  return (
    <Link
      data-testid={testId}
      href="/businesses?reset=1"
      className={className}
    >
      {children}
    </Link>
  );
}
