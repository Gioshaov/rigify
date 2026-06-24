import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  /** Extra classes for the container (e.g. flex/grid layout for the content). */
  className?: string;
}

/**
 * The single shared content container for the site.
 *
 * One max-width (`max-w-container` = 1280px) and one responsive horizontal
 * padding scale (`px-margin-mobile` → `md:px-margin-desktop`, i.e. 16px → 64px),
 * matching the layout tokens documented in UI_GUIDE.md. Every top-level band on a
 * page (nav, hero, content sections, footer) should wrap its content in this so
 * they all share identical left/right edges.
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-container px-margin-mobile md:px-margin-desktop ${className}`.trim()}>
      {children}
    </div>
  );
}
