'use client'

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
  category: string;
};

export function FAQAccordion({ items, category }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const testId = `faq-${category.toLowerCase().replace(/\s+/g, '-')}-${index}`;

        return (
          <div
            key={item.question}
            className="bg-surface-container border border-white/10 overflow-hidden"
          >
            <button
              data-testid={`${testId}-question`}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={`${testId}-answer`}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-hanken text-[16px] leading-[1.5] font-semibold text-white pr-4">
                {item.question}
              </span>
              <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </button>
            <div
              id={`${testId}-answer`}
              data-testid={`${testId}-answer`}
              className="px-6 pt-2 overflow-hidden transition-all duration-300"
              style={{
                maxHeight: isOpen ? '500px' : '0',
                paddingBottom: isOpen ? '1.5rem' : '0'
              }}
            >
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
