"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  /**
   * data-testid for the portal's root container appended to <body>. Required
   * (no default) so each portal root is unique per the test-id convention.
   */
  testId: string;
}

/**
 * Renders children into document.body via a React portal, so overlays escape
 * any ancestor stacking context / transform and share one root stacking
 * context. React context still flows through the portal.
 *
 * SSR-safe: createPortal needs `document`, which doesn't exist on the server.
 * We render nothing until after mount — and because the server render and the
 * first client render both return null, there is no hydration mismatch. The
 * mounted guard lives here, once; individual overlays must not re-implement it.
 */
export function Portal({ children, testId }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(<div data-testid={testId}>{children}</div>, document.body);
}
