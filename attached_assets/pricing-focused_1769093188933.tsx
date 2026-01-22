// examples/pricing-focused.tsx
// Pricing-focused landing page for price-competitive products
// Use this when: Competing on price, transparent pricing is differentiator, self-service model

import { Pricing } from '@/components/Pricing';
import { Button } from '@/components/Button';

export default function PricingFocused() {
  return (
    <main>
      {/* Hero with price anchor */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="price-badge">
              Starting at <strong>$9/month</strong>
            </div>
            <h1>Enterprise analytics at startup prices</h1>
            <p>
              Get the same analytics platform used by Fortune 500 companies—
              without the enterprise price tag. No contracts, no hidden fees.
            </p>
            <div className="hero-cta">
              <Button variant="primary" size="xl" href="/signup">
                Start Free Trial
              </Button>
              <Button variant="secondary" size="xl" href="#pricing">
                See Pricing
              </Button>
            </div>
            <p className="hero-note">
              ✓ Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>

        <style jsx>{`
          .hero {
            padding: 120px 0 80px;
            background: linear-gradient(
              135deg,
              var(--primary-50) 0%,
              white 100%
            );
          }

          .hero-content {
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
          }

          .price-badge {
            display: inline-block;
            padding: 8px 20px;
            background: var(--primary-100);
            color: var(--primary-700);
            border-radius: 24px;
            font-size: 14px;
            margin-bottom: 24px;
          }

          .price-badge strong {
            font-weight: 700;
          }

          .hero h1 {
            font-size: clamp(36px, 5vw, 64px);
            font-weight: 700;
            line-height: 1.1;
            color: var(--gray-900);
            margin-bottom: 20px;
          }

          .hero p {
            font-size: 20px;
            line-height: 1.6;
            color: var(--gray-600);
            margin-bottom: 40px;
          }

          .hero-cta {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 24px;
          }

          .hero-note {
            font-size: 14px;
            color: var(--gray-500);
            margin-bottom: 0;
          }

          @media (max-width: 640px) {
            .hero {
              padding: 80px 0 60px;
            }

            .hero-cta {
              flex-direction: column;
            }

            .hero-cta :global(button),
            .hero-cta :global(a) {
              width: 100%;
            }
          }
        `}</style>
      </section>

      {/* Pricing comparison */}
      <section className="comparison">
        <div className="container">
          <h2>Why pay more for the same features?</h2>
          <div className="comparison-table">
            <ComparisonRow 
              feature="Real-time analytics"
              us="$9/mo"
              competitor1="$49/mo"
              competitor2="$99/mo"
            />
            <ComparisonRow 
              feature="Unlimited users"
              us="✓ Included"
              competitor1="$25 per user"
              competitor2="$50 per user"
            />
            <ComparisonRow 
              feature="Custom dashboards"
              us="✓ Unlimited"
              competitor1="3 dashboards"
              competitor2="10 dashboards"
            />
            <ComparisonRow 
              feature="Data retention"
              us="✓ 12 months"
              competitor1="3 months"
              competitor2="6 months"
            />
            <ComparisonRow 
              feature="API access"
              us="✓ Included"
              competitor1="$29/mo add-on"
              competitor2="Enterprise only"
            />
            <ComparisonRow 
              feature="Support"
              us="✓ 24/7 chat"
              competitor1="Email only"
              competitor2="Business hours"
            />
          </div>
        </div>

        <style jsx>{`
          .comparison {
            padding: 80px 0;
            background: white;
          }

          .comparison h2 {
            font-size: clamp(28px, 4vw, 40px);
            font-weight: 700;
            text-align: center;
            margin-bottom: 48px;
            color: var(--gray-900);
          }

          .comparison-table {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            overflow: hidden;
          }

          @media (max-width: 640px) {
            .comparison {
              padding: 60px 0;
            }
          }
        `}</style>
      </section>

      {/* Main pricing section */}
      <div id="pricing">
        <Pricing
          tiers={pricingTiers}
          showBillingToggle={true}
          annualSavings="Save 20%"
        />
      </div>

      {/* ROI calculator */}
      <section className="roi-calculator">
        <div className="container">
          <div className="calculator-content">
            <h2>See how much you'll save</h2>
            <p>Compare our pricing to what you're paying now</p>
            
            <div className="calculator">
              <div className="calculator-input">
                <label>Current monthly spend</label>
                <input 
                  type="number" 
                  placeholder="$299" 
                  defaultValue={299}
                  id="current-spend"
                />
              </div>
              <div className="calculator-result">
                <div className="savings">
                  <div className="savings-amount">$3,480</div>
                  <div className="savings-label">Saved annually</div>
                </div>
                <div className="breakdown">
                  Old cost: $3,588/year → New cost: $108/year
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" href="/signup">
              Start Saving Today
            </Button>
          </div>
        </div>

        <style jsx>{`
          .roi-calculator {
            padding: 100px 0;
            background: var(--gray-50);
          }

          .calculator-content {
            text-align: center;
            max-width: 700px;
            margin: 0 auto;
          }

          .calculator-content h2 {
            font-size: clamp(32px, 4vw, 48px);
            font-weight: 700;
            margin-bottom: 12px;
            color: var(--gray-900);
          }

          .calculator-content > p {
            font-size: 18px;
            color: var(--gray-600);
            margin-bottom: 40px;
          }

          .calculator {
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 32px;
          }

          .calculator-input {
            margin-bottom: 32px;
          }

          .calculator-input label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-700);
            margin-bottom: 8px;
            text-align: left;
          }

          .calculator-input input {
            width: 100%;
            height: 56px;
            padding: 0 20px;
            border: 1px solid var(--gray-300);
            border-radius: 8px;
            font-size: 18px;
            transition: all 200ms ease-out;
          }

          .calculator-input input:focus {
            outline: none;
            border-color: var(--primary-500);
            box-shadow: 0 0 0 3px var(--primary-100);
          }

          .savings {
            padding: 32px;
            background: var(--primary-50);
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .savings-amount {
            font-size: 48px;
            font-weight: 700;
            color: var(--primary-700);
            margin-bottom: 8px;
          }

          .savings-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .breakdown {
            font-size: 14px;
            color: var(--gray-600);
            padding: 16px;
            background: var(--gray-50);
            border-radius: 6px;
          }

          @media (max-width: 640px) {
            .roi-calculator {
              padding: 60px 0;
            }

            .calculator {
              padding: 24px;
            }

            .savings-amount {
              font-size: 36px;
            }
          }
        `}</style>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <h2>Frequently asked questions</h2>
          <div className="faq-grid">
            <FAQItem
              question="Why is your pricing so much lower?"
              answer="We're cloud-native and fully automated, so our costs are lower. We pass those savings directly to you instead of inflating margins."
            />
            <FAQItem
              question="Are there any hidden fees?"
              answer="Absolutely not. The price you see is what you pay. No setup fees, no per-user charges, no surprise overages."
            />
            <FAQItem
              question="Can I change plans anytime?"
              answer="Yes! Upgrade or downgrade instantly. Changes take effect immediately and we'll prorate any differences."
            />
            <FAQItem
              question="What if I need to cancel?"
              answer="Cancel anytime with one click. No questions asked, no cancellation fees. You'll have access until the end of your billing period."
            />
            <FAQItem
              question="Do you offer discounts for nonprofits?"
              answer="Yes! Nonprofits and educational institutions get 50% off any plan. Contact us with your EIN or proof of nonprofit status."
            />
            <FAQItem
              question="Is there a long-term contract?"
              answer="Nope. We're month-to-month only. Lock in annual pricing for savings, but you can still cancel anytime."
            />
          </div>
        </div>

        <style jsx>{`
          .faq {
            padding: 100px 0;
            background: white;
          }

          .faq h2 {
            font-size: clamp(32px, 4vw, 48px);
            font-weight: 700;
            text-align: center;
            margin-bottom: 60px;
            color: var(--gray-900);
          }

          .faq-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
            max-width: 1100px;
            margin: 0 auto;
          }

          @media (max-width: 640px) {
            .faq {
              padding: 60px 0;
            }

            .faq-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to stop overpaying?</h2>
            <p>Join 5,000+ companies saving an average of $3,200/year</p>
            <Button variant="primary" size="xl" href="/signup">
              Start Your Free Trial
            </Button>
            <p className="cta-note">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>

        <style jsx>{`
          .final-cta {
            padding: 120px 0;
            background: linear-gradient(
              135deg,
              var(--primary-600) 0%,
              var(--primary-700) 100%
            );
            color: white;
            text-align: center;
          }

          .cta-content {
            max-width: 700px;
            margin: 0 auto;
          }

          .cta-content h2 {
            font-size: clamp(36px, 5vw, 56px);
            font-weight: 700;
            margin-bottom: 16px;
          }

          .cta-content p {
            font-size: 20px;
            opacity: 0.9;
            margin-bottom: 40px;
          }

          .cta-note {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 24px;
            margin-bottom: 0;
          }

          @media (max-width: 640px) {
            .final-cta {
              padding: 80px 0;
            }

            .final-cta :global(button),
            .final-cta :global(a) {
              width: 100%;
            }
          }
        `}</style>
      </section>
    </main>
  );
}

// ============================================
// SUPPORTING COMPONENTS
// ============================================

function ComparisonRow({
  feature,
  us,
  competitor1,
  competitor2,
}: {
  feature: string;
  us: string;
  competitor1: string;
  competitor2: string;
}) {
  return (
    <div className="comparison-row">
      <div className="feature-name">{feature}</div>
      <div className="competitor-price dim">{competitor2}</div>
      <div className="competitor-price dim">{competitor1}</div>
      <div className="our-price highlight">{us}</div>

      <style jsx>{`
        .comparison-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          align-items: center;
          border-bottom: 1px solid var(--gray-200);
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .feature-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--gray-900);
        }

        .competitor-price,
        .our-price {
          text-align: center;
          font-size: 14px;
        }

        .dim {
          color: var(--gray-500);
        }

        .highlight {
          font-weight: 600;
          color: var(--primary-700);
        }

        @media (max-width: 768px) {
          .comparison-row {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 16px;
          }

          .competitor-price,
          .our-price {
            text-align: left;
          }

          .competitor-price::before {
            content: 'Competitor: ';
            font-weight: 500;
            color: var(--gray-700);
          }

          .our-price::before {
            content: 'Us: ';
            font-weight: 600;
            color: var(--primary-700);
          }
        }
      `}</style>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="faq-item">
      <h3>{question}</h3>
      <p>{answer}</p>

      <style jsx>{`
        .faq-item {
          padding: 24px;
          background: var(--gray-50);
          border-radius: 12px;
        }

        .faq-item h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 8px;
        }

        .faq-item p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-600);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

// ============================================
// DATA
// ============================================

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price: { monthly: 9, annual: 90 },
    features: [
      { text: '10,000 events/month', included: true },
      { text: '3 team members', included: true },
      { text: '5 custom dashboards', included: true },
      { text: '3 months data retention', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'API access', included: false },
    ],
    cta: { text: 'Start Free Trial', href: '/signup?plan=starter' },
  },
  {
    name: 'Pro',
    description: 'For growing businesses that need more',
    price: { monthly: 29, annual: 290 },
    features: [
      { text: '100,000 events/month', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited dashboards', included: true },
      { text: '12 months data retention', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Full API access', included: true },
      { text: 'Custom integrations', included: true },
    ],
    cta: { text: 'Start Free Trial', href: '/signup?plan=pro' },
    highlighted: true,
    badge: 'Best Value',
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: { monthly: 'Custom', annual: 'Custom' },
    features: [
      { text: 'Unlimited events', included: true },
      { text: 'Unlimited everything', included: true },
      { text: 'Unlimited data retention', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '99.99% uptime SLA', included: true },
      { text: 'SSO/SAML authentication', included: true },
      { text: 'On-premise deployment option', included: true },
      { text: 'Custom contract terms', included: true },
    ],
    cta: { text: 'Contact Sales', href: '/contact-sales' },
  },
];
