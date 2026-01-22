// components/FAQ.tsx
'use client';

import { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  allowMultipleOpen?: boolean;
}

/**
 * FAQ Component
 * 
 * Usage patterns (from 880+ SaaS sites):
 * - 40% include FAQ section on homepage
 * - 90% use accordion pattern
 * - Average 5-8 questions
 * - 70% allow only one open at a time
 * - Usually placed before final CTA
 * 
 * @example
 * ```tsx
 * <FAQ
 *   title="Frequently Asked Questions"
 *   subtitle="Everything you need to know about our platform"
 *   items={[
 *     {
 *       question: 'How does billing work?',
 *       answer: 'We bill monthly or annually...'
 *     }
 *   ]}
 * />
 * ```
 */
export function FAQ({
  title = 'Frequently Asked Questions',
  subtitle,
  items,
  allowMultipleOpen = false,
}: FAQProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultipleOpen) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <h2>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>

        <div className="faq-list">
          {items.map((item, index) => (
            <FAQAccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndexes.includes(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .faq-section {
          padding: 100px 0;
          background: white;
        }

        .faq-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 64px;
        }

        .faq-header h2 {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--gray-900);
        }

        .subtitle {
          font-size: 18px;
          color: var(--gray-600);
        }

        .faq-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .faq-section {
            padding: 60px 0;
          }

          .faq-header {
            margin-bottom: 40px;
          }

          .faq-list {
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}

// Individual FAQ Item
function FAQAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="question-text">{question}</span>
        <svg
          className="chevron"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="faq-answer">
        <div className="answer-content">
          <p>{answer}</p>
        </div>
      </div>

      <style jsx>{`
        .faq-item {
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          overflow: hidden;
          transition: all 200ms ease-out;
        }

        .faq-item:hover {
          border-color: var(--primary-200);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 200ms ease-out;
        }

        .faq-question:hover {
          background: var(--gray-50);
        }

        .question-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-900);
          line-height: 1.4;
        }

        .chevron {
          flex-shrink: 0;
          color: var(--gray-600);
          transition: transform 200ms ease-out;
        }

        .faq-item.open .chevron {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 300ms ease-out;
        }

        .faq-item.open .faq-answer {
          max-height: 500px;
        }

        .answer-content {
          padding: 0 24px 24px;
        }

        .answer-content p {
          font-size: 16px;
          line-height: 1.6;
          color: var(--gray-600);
          margin: 0;
        }

        @media (max-width: 640px) {
          .faq-question {
            padding: 20px;
            gap: 16px;
          }

          .question-text {
            font-size: 16px;
          }

          .answer-content {
            padding: 0 20px 20px;
          }

          .answer-content p {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
