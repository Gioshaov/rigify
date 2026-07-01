"use client";

import { useEffect, useRef, useState } from "react";

interface Country {
  /** ISO 3166-1 alpha-2 code, used for the compact label and to derive the flag. */
  iso: string;
  name: string;
  /** Dial code including the leading "+", e.g. "+995". This is the form value. */
  dial: string;
}

// Same countries, dial codes and order as the original booking-form <select>.
// Stored as data (not flag emojis) so the flag is derived from the ISO code and the
// rendered flag/name/dial stay identical to before. Do not drop or reorder entries.
const COUNTRIES: Country[] = [
  { iso: "AF", name: "Afghanistan", dial: "+93" },
  { iso: "AL", name: "Albania", dial: "+355" },
  { iso: "DZ", name: "Algeria", dial: "+213" },
  { iso: "AD", name: "Andorra", dial: "+376" },
  { iso: "AO", name: "Angola", dial: "+244" },
  { iso: "AR", name: "Argentina", dial: "+54" },
  { iso: "AM", name: "Armenia", dial: "+374" },
  { iso: "AU", name: "Australia", dial: "+61" },
  { iso: "AT", name: "Austria", dial: "+43" },
  { iso: "AZ", name: "Azerbaijan", dial: "+994" },
  { iso: "BH", name: "Bahrain", dial: "+973" },
  { iso: "BD", name: "Bangladesh", dial: "+880" },
  { iso: "BY", name: "Belarus", dial: "+375" },
  { iso: "BE", name: "Belgium", dial: "+32" },
  { iso: "BZ", name: "Belize", dial: "+501" },
  { iso: "BO", name: "Bolivia", dial: "+591" },
  { iso: "BA", name: "Bosnia", dial: "+387" },
  { iso: "BR", name: "Brazil", dial: "+55" },
  { iso: "BG", name: "Bulgaria", dial: "+359" },
  { iso: "KH", name: "Cambodia", dial: "+855" },
  { iso: "CM", name: "Cameroon", dial: "+237" },
  { iso: "CA", name: "Canada", dial: "+1" },
  { iso: "CL", name: "Chile", dial: "+56" },
  { iso: "CN", name: "China", dial: "+86" },
  { iso: "CO", name: "Colombia", dial: "+57" },
  { iso: "CR", name: "Costa Rica", dial: "+506" },
  { iso: "HR", name: "Croatia", dial: "+385" },
  { iso: "CU", name: "Cuba", dial: "+53" },
  { iso: "CY", name: "Cyprus", dial: "+357" },
  { iso: "CZ", name: "Czech Republic", dial: "+420" },
  { iso: "DK", name: "Denmark", dial: "+45" },
  { iso: "EC", name: "Ecuador", dial: "+593" },
  { iso: "EG", name: "Egypt", dial: "+20" },
  { iso: "EE", name: "Estonia", dial: "+372" },
  { iso: "ET", name: "Ethiopia", dial: "+251" },
  { iso: "FI", name: "Finland", dial: "+358" },
  { iso: "FR", name: "France", dial: "+33" },
  { iso: "GE", name: "Georgia", dial: "+995" },
  { iso: "DE", name: "Germany", dial: "+49" },
  { iso: "GH", name: "Ghana", dial: "+233" },
  { iso: "GR", name: "Greece", dial: "+30" },
  { iso: "GT", name: "Guatemala", dial: "+502" },
  { iso: "HT", name: "Haiti", dial: "+509" },
  { iso: "HN", name: "Honduras", dial: "+504" },
  { iso: "HK", name: "Hong Kong", dial: "+852" },
  { iso: "HU", name: "Hungary", dial: "+36" },
  { iso: "IS", name: "Iceland", dial: "+354" },
  { iso: "IN", name: "India", dial: "+91" },
  { iso: "ID", name: "Indonesia", dial: "+62" },
  { iso: "IR", name: "Iran", dial: "+98" },
  { iso: "IQ", name: "Iraq", dial: "+964" },
  { iso: "IE", name: "Ireland", dial: "+353" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "IT", name: "Italy", dial: "+39" },
  { iso: "JP", name: "Japan", dial: "+81" },
  { iso: "JO", name: "Jordan", dial: "+962" },
  { iso: "KZ", name: "Kazakhstan", dial: "+7" },
  { iso: "KE", name: "Kenya", dial: "+254" },
  { iso: "KW", name: "Kuwait", dial: "+965" },
  { iso: "KG", name: "Kyrgyzstan", dial: "+996" },
  { iso: "LV", name: "Latvia", dial: "+371" },
  { iso: "LB", name: "Lebanon", dial: "+961" },
  { iso: "LY", name: "Libya", dial: "+218" },
  { iso: "LT", name: "Lithuania", dial: "+370" },
  { iso: "LU", name: "Luxembourg", dial: "+352" },
  { iso: "MY", name: "Malaysia", dial: "+60" },
  { iso: "MV", name: "Maldives", dial: "+960" },
  { iso: "MX", name: "Mexico", dial: "+52" },
  { iso: "MD", name: "Moldova", dial: "+373" },
  { iso: "MN", name: "Mongolia", dial: "+976" },
  { iso: "ME", name: "Montenegro", dial: "+382" },
  { iso: "MA", name: "Morocco", dial: "+212" },
  { iso: "MM", name: "Myanmar", dial: "+95" },
  { iso: "NP", name: "Nepal", dial: "+977" },
  { iso: "NL", name: "Netherlands", dial: "+31" },
  { iso: "NZ", name: "New Zealand", dial: "+64" },
  { iso: "NG", name: "Nigeria", dial: "+234" },
  { iso: "NO", name: "Norway", dial: "+47" },
  { iso: "OM", name: "Oman", dial: "+968" },
  { iso: "PK", name: "Pakistan", dial: "+92" },
  { iso: "PA", name: "Panama", dial: "+507" },
  { iso: "PY", name: "Paraguay", dial: "+595" },
  { iso: "PE", name: "Peru", dial: "+51" },
  { iso: "PH", name: "Philippines", dial: "+63" },
  { iso: "PL", name: "Poland", dial: "+48" },
  { iso: "PT", name: "Portugal", dial: "+351" },
  { iso: "QA", name: "Qatar", dial: "+974" },
  { iso: "RO", name: "Romania", dial: "+40" },
  { iso: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso: "RS", name: "Serbia", dial: "+381" },
  { iso: "SG", name: "Singapore", dial: "+65" },
  { iso: "SK", name: "Slovakia", dial: "+421" },
  { iso: "SI", name: "Slovenia", dial: "+386" },
  { iso: "ZA", name: "South Africa", dial: "+27" },
  { iso: "KR", name: "South Korea", dial: "+82" },
  { iso: "ES", name: "Spain", dial: "+34" },
  { iso: "LK", name: "Sri Lanka", dial: "+94" },
  { iso: "SE", name: "Sweden", dial: "+46" },
  { iso: "CH", name: "Switzerland", dial: "+41" },
  { iso: "SY", name: "Syria", dial: "+963" },
  { iso: "TW", name: "Taiwan", dial: "+886" },
  { iso: "TJ", name: "Tajikistan", dial: "+992" },
  { iso: "TH", name: "Thailand", dial: "+66" },
  { iso: "TN", name: "Tunisia", dial: "+216" },
  { iso: "TR", name: "Turkey", dial: "+90" },
  { iso: "TM", name: "Turkmenistan", dial: "+993" },
  { iso: "UA", name: "Ukraine", dial: "+380" },
  { iso: "AE", name: "UAE", dial: "+971" },
  { iso: "GB", name: "United Kingdom", dial: "+44" },
  { iso: "US", name: "United States", dial: "+1" },
  { iso: "UY", name: "Uruguay", dial: "+598" },
  { iso: "UZ", name: "Uzbekistan", dial: "+998" },
  { iso: "VE", name: "Venezuela", dial: "+58" },
  { iso: "VN", name: "Vietnam", dial: "+84" },
  { iso: "YE", name: "Yemen", dial: "+967" },
];

/** Turn an ISO alpha-2 code into its flag emoji (regional indicator symbols). */
function isoToFlag(iso: string): string {
  return Array.from(iso.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

interface CountryCodeSelectProps {
  /** Selected dial code, e.g. "+995". */
  value: string;
  /** Called with the chosen dial code. */
  onChange: (dial: string) => void;
  hasError?: boolean;
  testId?: string;
  /**
   * When true, the open list shows plain country names only (no flag, no dial
   * code). The collapsed chip still shows the ISO + dial code. Opt-in per page;
   * defaults to the full "🇬🇪 Georgia +995" list rows.
   */
  namesOnlyInList?: boolean;
}

/**
 * Compact country dial-code picker.
 *
 * Collapsed it shows only the ISO code + dial code (e.g. "GE +995"); the open list
 * shows the flag, full country name and dial code (e.g. "🇬🇪 Georgia +995"), or —
 * when `namesOnlyInList` is set — just the country name. This dual display is why
 * it's a custom control rather than a native <select>.
 */
export function CountryCodeSelect({ value, onChange, hasError = false, testId, namesOnlyInList = false }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Track the chosen country so duplicate dial codes (+1, +7) display the right ISO.
  const [selected, setSelected] = useState<Country>(
    () => COUNTRIES.find((c) => c.dial === value) ?? COUNTRIES[0]
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // When opening via ArrowUp, land on the last option instead of the selected one.
  const openToLastRef = useRef(false);

  // Stable per-option id — reused for the data-testid and aria-activedescendant.
  // ISO (unique) not dial, since dial codes duplicate (+1, +7).
  const optBase = testId ?? "country-code";
  const optionId = (c: Country) => `${optBase}-option-${c.iso.toLowerCase()}`;
  const selectedIndex = COUNTRIES.indexOf(selected);

  // Re-sync the display if the dial code is changed from outside.
  useEffect(() => {
    if (selected.dial !== value) {
      const match = COUNTRIES.find((c) => c.dial === value);
      if (match) setSelected(match);
    }
  }, [value, selected.dial]);

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
  // move focus into the list so arrow keys work.
  useEffect(() => {
    if (!open) return;
    setActiveIndex(openToLastRef.current ? COUNTRIES.length - 1 : selectedIndex >= 0 ? selectedIndex : 0);
    openToLastRef.current = false;
    listRef.current?.focus();
    // selectedIndex read once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the active option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const c = COUNTRIES[activeIndex];
    if (!c) return;
    listRef.current.querySelector<HTMLElement>(`[id="${optionId(c)}"]`)?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const choose = (c: Country) => {
    setSelected(c);
    onChange(c.dial);
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
        // Stop the Escape from bubbling to an enclosing handler (e.g. BookingModal's
        // keydown), which would otherwise close the whole modal instead of just the picker.
        e.stopPropagation();
        close();
        break;
      case "Tab":
        close(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, COUNTRIES.length - 1));
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
        setActiveIndex(COUNTRIES.length - 1);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const c = COUNTRIES[activeIndex];
        if (c) choose(c);
        break;
      }
    }
  };

  const activeCountry = activeIndex >= 0 ? COUNTRIES[activeIndex] : undefined;

  const borderClass = hasError ? "border-error" : "border-white/10";

  return (
    <div ref={rootRef} className="relative shrink-0 self-stretch">
      <button
        ref={triggerRef}
        type="button"
        data-testid={testId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select country dial code"
        className={`flex items-center gap-1 h-full bg-surface border ${borderClass} px-3 py-3 font-mono text-[12px] tracking-[0.1em] text-on-surface outline-none focus:border-primary transition-colors whitespace-nowrap`}
      >
        <span>{selected.iso}</span>
        <span>{selected.dial}</span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">expand_more</span>
      </button>

      {open && (
        // Open list — dark styled listbox matching the City field's FilterDropdown
        // (surface-dim panel, mono rows, gold selected text) with full keyboard
        // navigation: arrow/Home/End/Enter, aria-activedescendant, focus return.
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label="Country dial code"
          aria-activedescendant={activeCountry ? optionId(activeCountry) : undefined}
          onKeyDown={onListKeyDown}
          data-testid={`${optBase}-listbox`}
          className="absolute left-0 top-full z-dropdown mt-1 max-h-60 w-72 max-w-[80vw] overflow-y-auto border border-white/10 bg-surface-dim py-1 outline-none"
        >
          {COUNTRIES.map((c, i) => {
            const isSelected = c === selected;
            const isActive = i === activeIndex;
            return (
              <li key={`${c.iso}-${c.dial}-${i}`} role="presentation">
                <button
                  type="button"
                  id={optionId(c)}
                  data-testid={optionId(c)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => choose(c)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-2 border-l-2 px-4 py-2.5 text-left font-mono text-[12px] tracking-[0.1em] transition-colors ${
                    isSelected ? "border-l-primary text-primary" : "border-l-transparent text-on-surface-variant"
                  } ${isActive ? "bg-surface-container-low" : ""}`}
                >
                  {!namesOnlyInList && <span aria-hidden="true">{isoToFlag(c.iso)}</span>}
                  <span className="truncate">{c.name}</span>
                  {!namesOnlyInList && <span>{c.dial}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
