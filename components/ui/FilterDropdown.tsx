"use client";

import { useEffect, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  /** Currently selected option value. */
  value: string;
  /** Options, including the leading "All …" reset entry as the first item. */
  options: FilterOption[];
  /** Called with the chosen option value. */
  onChange: (value: string) => void;
  /** Trigger test id base: trigger = `${testId}-trigger` (e.g. "district-dropdown"). */
  testId: string;
  /** Option test id base: each option = `${optionTestId}-option-{value}` (e.g. "district"). */
  optionTestId: string;
  /** Accessible label, e.g. "District". */
  ariaLabel: string;
}

/**
 * Custom filter dropdown for the /businesses filter bar.
 *
 * Replaces a native <select> so the open panel can be styled (dark surface, gold
 * selected option + checkmark) — impossible on an OS-rendered <select>. Follows
 * the hand-built dropdown idiom already used by CountryCodeSelect (listbox
 * semantics, click-outside, Escape, z-dropdown, no portal) and adds full
 * arrow-key navigation and focus return.
 */
export function FilterDropdown({ value, options, onChange, testId, optionTestId, ariaLabel }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // When opening via ArrowUp, land on the last option instead of the selected one.
  const openToLastRef = useRef(false);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedLabel = options[selectedIndex]?.label ?? options[0]?.label ?? "";

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  // On open: highlight the selected option (or last, if opened via ArrowUp) and
  // move focus into the list.
  useEffect(() => {
    if (!open) return;
    setActiveIndex(openToLastRef.current ? options.length - 1 : selectedIndex >= 0 ? selectedIndex : 0);
    openToLastRef.current = false;
    listRef.current?.focus();
    // selectedIndex/options.length read once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the active option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const opt = options[activeIndex];
    if (!opt) return;
    listRef.current
      .querySelector<HTMLElement>(`[id="${optionTestId}-option-${opt.value}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, optionTestId, options]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const choose = (v: string) => {
    onChange(v);
    close();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openToLastRef.current = false;
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openToLastRef.current = true;
      setOpen(true);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt) choose(opt.value);
        break;
      }
    }
  };

  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;

  return (
    <div ref={rootRef} className="relative w-full">
      {/* Closed state — matches the existing filter-bar fields */}
      <button
        ref={triggerRef}
        type="button"
        data-testid={`${testId}-trigger`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="w-full flex items-center justify-between gap-2 bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedLabel}</span>
        <span
          className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {/* Open panel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={activeOption ? `${optionTestId}-option-${activeOption.value}` : undefined}
          onKeyDown={onListKeyDown}
          className="absolute left-0 top-full z-dropdown mt-1 w-full max-h-72 overflow-y-auto border border-white/10 bg-surface-dim py-1 outline-none"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === activeIndex;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  id={`${optionTestId}-option-${opt.value}`}
                  data-testid={`${optionTestId}-option-${opt.value}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => choose(opt.value)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left font-mono text-[12px] tracking-[0.1em] uppercase transition-colors ${
                    isSelected ? "text-primary" : "text-on-surface-variant"
                  } ${isActive ? "bg-surface-container-low" : ""}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
                      check
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
