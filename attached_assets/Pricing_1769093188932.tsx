// components/Pricing.tsx
// Based on 70% of analyzed pricing pages
// Pattern: Three-tier with featured middle tier

'use client';

import { ReactNode, useState } from 'react';
import { Button } from './Button';

interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

interface PricingTier {
  name: string;
  description: string;
  price: {
    monthly: number | string;
    annual: number | string;
    currency?: string;
  };
  features: PricingFeature[];
  cta: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  highlighted?: boolean;
  badge?: string;
}

interface PricingProps {
  tiers: PricingTier[];
  billingPeriod?: 'monthly' | 'annual';
  showBillingToggle?: boolean;
  annualSavings?: string; // e.g. "Save 20%"
  className?: string;
}

export function Pricing({
  tiers,
  billingPeriod: initialBillingPeriod = 'monthly',
  showBillingToggle = true,
  annualSavings,
  className = '',
}: PricingProps) {
  const [billingPeriod, setBillingPeriod] = useState(initialBillingPeriod);

  return (
    <section className={`pricing ${className}`}>
      <div className="pricing-container">
        {showBillingToggle && (
          <div className="pricing-toggle-wrapper">
            <label className="pricing-toggle">
              <span
                className={billingPeriod === 'monthly' ? 'active' : ''}
              >
                Monthly
              </span>
              <input
                type="checkbox"
                checked={billingPeriod === 'annual'}
                onChange={(e) =>
                  setBillingPeriod(e.target.checked ? 'annual' : 'monthly')
                }
                aria-label="Toggle between monthly and annual billing"
              />
              <span className="pricing-toggle-slider" />
              <span
                className={billingPeriod === 'annual' ? 'active' : ''}
              >
                Annual
                {annualSavings && (
                  <span className="pricing-savings-badge">{annualSavings}</span>
                )}
              </span>
            </label>
          </div>
        )}

        <div className="pricing-grid">
          {tiers.map((tier, index) => (
            <PricingCard
              key={index}
              tier={tier}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .pricing {
          padding: 80px 0;
          background: var(--gray-50, #FAFAFA);
        }

        .pricing-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .pricing-toggle-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 48px;
        }

        .pricing-toggle {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 6px;
          background: white;
          border-radius: 100px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          cursor: pointer;
        }

        .pricing-toggle span {
          padding: 8px 20px;
          border-radius: 100px;
          font-weight: 500;
          font-size: 16px;
          color: var(--gray-600, #525252);
          transition: all 200ms ease-out;
          position: relative;
        }

        .pricing-toggle span.active {
          color: var(--gray-900, #171717);
        }

        .pricing-toggle input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .pricing-toggle-slider {
          position: absolute;
          width: 48px;
          height: 24px;
          background: var(--primary-500, #0EA5E9);
          border-radius: 100px;
          transition: transform 200ms ease-out;
        }

        .pricing-toggle input:checked ~ .pricing-toggle-slider {
          transform: translateX(100px);
        }

        .pricing-savings-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          background: var(--success, #10B981);
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .pricing {
            padding: 60px 0;
          }
        }
      `}</style>
    </section>
  );
}

function PricingCard({
  tier,
  billingPeriod,
}: {
  tier: PricingTier;
  billingPeriod: 'monthly' | 'annual';
}) {
  const price = billingPeriod === 'monthly' ? tier.price.monthly : tier.price.annual;
  const currency = tier.price.currency || '$';
  const isCustom = typeof price === 'string';

  return (
    <div className={`pricing-card ${tier.highlighted ? 'pricing-card-highlighted' : ''}`}>
      {tier.badge && <div className="pricing-badge">{tier.badge}</div>}

      <div className="pricing-card-header">
        <h3 className="pricing-tier-name">{tier.name}</h3>
        <p className="pricing-tier-description">{tier.description}</p>
      </div>

      <div className="pricing-price">
        {isCustom ? (
          <div className="pricing-price-custom">{price}</div>
        ) : (
          <>
            <span className="pricing-currency">{currency}</span>
            <span className="pricing-amount">{price}</span>
            <span className="pricing-period">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
          </>
        )}
      </div>

      <div className="pricing-cta">
        <Button
          variant={tier.highlighted ? 'primary' : 'outline'}
          fullWidth
          href={tier.cta.href}
          onClick={tier.cta.onClick}
        >
          {tier.cta.text}
        </Button>
      </div>

      <ul className="pricing-features">
        {tier.features.map((feature, index) => (
          <li
            key={index}
            className={feature.included ? 'feature-included' : 'feature-excluded'}
          >
            <span className="feature-icon">
              {feature.included ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.667 5L7.5 14.167 3.333 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span className="feature-text">{feature.text}</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .pricing-card {
          background: white;
          border: 2px solid var(--gray-200, #E5E5E5);
          border-radius: 16px;
          padding: 32px;
          position: relative;
          transition: all 200ms ease-out;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .pricing-card-highlighted {
          border-color: var(--primary-500, #0EA5E9);
          box-shadow: 0 8px 16px rgba(14, 165, 233, 0.15);
        }

        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 16px;
          background: linear-gradient(
            90deg,
            var(--primary-500, #0EA5E9) 0%,
            var(--primary-600, #0284C7) 100%
          );
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 100px;
        }

        .pricing-card-header {
          margin-bottom: 24px;
        }

        .pricing-tier-name {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-900, #171717);
          margin-bottom: 8px;
        }

        .pricing-tier-description {
          font-size: 14px;
          color: var(--gray-600, #525252);
          line-height: 1.5;
        }

        .pricing-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 24px;
        }

        .pricing-currency {
          font-size: 24px;
          font-weight: 600;
          color: var(--gray-700, #404040);
          margin-right: 4px;
        }

        .pricing-amount {
          font-size: 48px;
          font-weight: 700;
          color: var(--gray-900, #171717);
          line-height: 1;
        }

        .pricing-period {
          font-size: 16px;
          color: var(--gray-500, #737373);
          margin-left: 4px;
        }

        .pricing-price-custom {
          font-size: 32px;
          font-weight: 700;
          color: var(--gray-900, #171717);
        }

        .pricing-cta {
          margin-bottom: 32px;
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .pricing-features li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .feature-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .feature-included .feature-icon {
          color: var(--success, #10B981);
        }

        .feature-excluded .feature-icon {
          color: var(--gray-300, #D4D4D4);
        }

        .feature-included .feature-text {
          color: var(--gray-700, #404040);
        }

        .feature-excluded .feature-text {
          color: var(--gray-400, #A3A3A3);
        }

        @media (max-width: 640px) {
          .pricing-card {
            padding: 24px;
          }

          .pricing-amount {
            font-size: 40px;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// USAGE EXAMPLE
// ============================================

/*
const pricingTiers = [
  {
    name: 'Starter',
    description: 'For individuals and small projects',
    price: { monthly: 0, annual: 0 },
    features: [
      { text: '5 projects', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced integrations', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: { text: 'Start Free', href: '/signup' },
  },
  {
    name: 'Pro',
    description: 'For growing teams and businesses',
    price: { monthly: 29, annual: 290 },
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced integrations', included: true },
      { text: 'Custom domains', included: true },
      { text: '99.9% uptime SLA', included: false },
    ],
    cta: { text: 'Start 14-day trial', href: '/signup?plan=pro' },
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: { monthly: 'Custom', annual: 'Custom' },
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '99.99% uptime SLA', included: true },
      { text: 'SSO/SAML authentication', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'On-premise deployment', included: true },
    ],
    cta: { text: 'Contact Sales', href: '/contact-sales' },
  },
];

<Pricing
  tiers={pricingTiers}
  showBillingToggle={true}
  annualSavings="Save 20%"
/>
*/
