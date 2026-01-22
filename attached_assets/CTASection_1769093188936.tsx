// components/CTASection.tsx
import { Button } from './Button';

export interface CTASectionProps {
  title: string;
  subtitle?: string;
  primaryCTA: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryCTA?: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  note?: string;
  background?: 'light' | 'dark' | 'gradient' | 'primary';
  size?: 'default' | 'compact';
}

/**
 * CTA Section Component
 * 
 * Usage patterns (from 880+ SaaS sites):
 * - 95% include final CTA before footer
 * - 60% use gradient backgrounds
 * - 80% include social proof note ("No credit card required")
 * - 70% have 2 CTA buttons
 * - Average 1-2 sentences of copy
 * 
 * @example
 * ```tsx
 * <CTASection
 *   title="Ready to get started?"
 *   subtitle="Join thousands of teams building better products"
 *   primaryCTA={{ text: 'Start Free Trial', href: '/signup' }}
 *   secondaryCTA={{ text: 'Schedule Demo', href: '/demo' }}
 *   note="No credit card required • 14-day free trial"
 *   background="gradient"
 * />
 * ```
 */
export function CTASection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  note,
  background = 'gradient',
  size = 'default',
}: CTASectionProps) {
  const backgroundStyles = {
    light: 'var(--gray-50)',
    dark: 'var(--gray-900)',
    gradient: 'linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%)',
    primary: 'var(--primary-600)',
  };

  const textColor = background === 'dark' || background === 'primary' ? 'white' : 'var(--gray-900)';
  const subtitleColor =
    background === 'dark' || background === 'primary' ? 'var(--gray-300)' : 'var(--gray-600)';
  const noteColor =
    background === 'dark' || background === 'primary' ? 'var(--gray-400)' : 'var(--gray-500)';

  const padding = size === 'compact' ? '80px 0' : '120px 0';
  const mobilePadding = size === 'compact' ? '60px 0' : '80px 0';

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}

          <div className="cta-buttons">
            <Button
              variant={primaryCTA.variant || 'primary'}
              size="xl"
              href={primaryCTA.href}
            >
              {primaryCTA.text}
            </Button>

            {secondaryCTA && (
              <Button
                variant={secondaryCTA.variant || 'secondary'}
                size="xl"
                href={secondaryCTA.href}
              >
                {secondaryCTA.text}
              </Button>
            )}
          </div>

          {note && <p className="cta-note">{note}</p>}
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          padding: ${padding};
          background: ${backgroundStyles[background]};
        }

        .cta-content {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          margin-bottom: 16px;
          color: ${textColor};
        }

        .subtitle {
          font-size: 20px;
          color: ${subtitleColor};
          margin-bottom: 40px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .cta-note {
          font-size: 14px;
          color: ${noteColor};
          margin: 0;
        }

        @media (max-width: 640px) {
          .cta-section {
            padding: ${mobilePadding};
          }

          .subtitle {
            font-size: 18px;
            margin-bottom: 32px;
          }

          .cta-buttons {
            flex-direction: column;
            width: 100%;
          }

          .cta-buttons :global(button),
          .cta-buttons :global(a) {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
