// examples/pricing-page.tsx
// Complete pricing page template
// Copy to your Next.js app/pricing/page.tsx

import { Navigation } from '@/components/Navigation';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function PricingPage() {
  return (
    <>
      <Navigation
        logo={<span style={{ fontSize: '20px', fontWeight: 700 }}>YourSaaS</span>}
        links={[
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ]}
        ctaButton={{ text: 'Get Started', href: '/signup' }}
        sticky={true}
      />

      <main>
        {/* HERO SECTION */}
        <section className="pricing-hero">
          <div className="container">
            <div className="hero-content">
              <h1>Simple, transparent pricing</h1>
              <p className="hero-subtitle">
                Choose the perfect plan for your team. No hidden fees, no surprises.
              </p>
            </div>
          </div>

          <style jsx>{`
            .pricing-hero {
              padding: 100px 0 60px;
              background: linear-gradient(
                135deg,
                var(--primary-50) 0%,
                var(--gray-50) 100%
              );
              text-align: center;
            }

            .hero-content {
              max-width: 700px;
              margin: 0 auto;
            }

            .pricing-hero h1 {
              font-size: clamp(40px, 5vw, 64px);
              font-weight: 700;
              margin-bottom: 24px;
              color: var(--gray-900);
            }

            .hero-subtitle {
              font-size: 20px;
              color: var(--gray-600);
              line-height: 1.6;
            }

            @media (max-width: 640px) {
              .pricing-hero {
                padding: 80px 0 40px;
              }

              .hero-subtitle {
                font-size: 18px;
              }
            }
          `}</style>
        </section>

        {/* PRICING TABLES */}
        <Pricing
          tiers={pricingTiers}
          showBillingToggle={true}
          annualSavings="Save 20%"
        />

        {/* COMPARISON TABLE */}
        <section className="comparison-section">
          <div className="container">
            <div className="section-header">
              <h2>Compare all features</h2>
              <p>See exactly what's included in each plan</p>
            </div>

            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th className="feature-column">Feature</th>
                    <th>Starter</th>
                    <th>Pro</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr key={index}>
                      <td className="feature-name">{row.feature}</td>
                      <td>{row.starter}</td>
                      <td>{row.pro}</td>
                      <td>{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <style jsx>{`
            .comparison-section {
              padding: 80px 0;
              background: white;
            }

            .section-header {
              text-align: center;
              max-width: 700px;
              margin: 0 auto 48px;
            }

            .section-header h2 {
              font-size: clamp(32px, 4vw, 40px);
              font-weight: 700;
              margin-bottom: 12px;
              color: var(--gray-900);
            }

            .section-header p {
              font-size: 18px;
              color: var(--gray-600);
            }

            .comparison-table {
              max-width: 1000px;
              margin: 0 auto;
              overflow-x: auto;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border: 1px solid var(--gray-200);
              border-radius: 12px;
              overflow: hidden;
            }

            thead {
              background: var(--gray-50);
            }

            th {
              padding: 16px;
              font-size: 14px;
              font-weight: 600;
              text-align: left;
              color: var(--gray-900);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            th.feature-column {
              width: 40%;
            }

            td {
              padding: 16px;
              font-size: 14px;
              color: var(--gray-700);
              border-top: 1px solid var(--gray-200);
            }

            .feature-name {
              font-weight: 500;
              color: var(--gray-900);
            }

            @media (max-width: 768px) {
              .comparison-section {
                padding: 60px 0;
              }

              .comparison-table {
                overflow-x: scroll;
              }

              table {
                min-width: 600px;
              }
            }
          `}</style>
        </section>

        {/* FAQ */}
        <FAQ
          title="Pricing FAQs"
          subtitle="Have questions? We've got answers."
          items={pricingFAQs}
        />

        {/* FINAL CTA */}
        <CTASection
          title="Ready to get started?"
          subtitle="Join thousands of teams building better products"
          primaryCTA={{ text: 'Start Free Trial', href: '/signup' }}
          secondaryCTA={{ text: 'Talk to Sales', href: '/contact-sales' }}
          note="No credit card required • 14-day free trial • Cancel anytime"
          background="gradient"
        />
      </main>

      <Footer
        logo={<span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>YourSaaS</span>}
        tagline="Build your SaaS faster with AI-powered tools"
        columns={footerColumns}
        socialLinks={socialLinks}
        copyright="© 2024 YourSaaS. All rights reserved."
        legalLinks={[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
        ]}
      />
    </>
  );
}

// ============================================
// DATA
// ============================================

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    price: { monthly: 0, annual: 0 },
    features: [
      { text: '5 projects', included: true },
      { text: 'Basic analytics', included: true },
      { text: '10GB storage', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced integrations', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom domain', included: false },
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
      { text: '100GB storage', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced integrations', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'SSO authentication', included: false },
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
      { text: 'Unlimited storage', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '99.99% uptime SLA', included: true },
      { text: 'SSO/SAML authentication', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'On-premise deployment', included: true },
      { text: 'Advanced security features', included: true },
    ],
    cta: { text: 'Contact Sales', href: '/contact-sales' },
  },
];

const comparisonRows = [
  { feature: 'Projects', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Storage', starter: '10GB', pro: '100GB', enterprise: 'Unlimited' },
  { feature: 'Team members', starter: '1', pro: '10', enterprise: 'Unlimited' },
  { feature: 'API access', starter: '✓', pro: '✓', enterprise: '✓' },
  { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
  { feature: 'Custom domain', starter: '–', pro: '✓', enterprise: '✓' },
  { feature: 'SSO/SAML', starter: '–', pro: '–', enterprise: '✓' },
  { feature: 'SLA guarantee', starter: '–', pro: '99.9%', enterprise: '99.99%' },
  { feature: 'Custom integrations', starter: '–', pro: '–', enterprise: '✓' },
];

const pricingFAQs = [
  {
    question: 'How does billing work?',
    answer:
      'We bill monthly or annually based on your preference. Annual plans save you 20%. You can upgrade, downgrade, or cancel anytime.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days, we'll refund you in full, no questions asked.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, Amex) and offer invoice billing for Enterprise customers.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'What happens when I exceed my plan limits?',
    answer:
      'We'll notify you when you approach your limits. You can upgrade anytime or contact us to discuss custom pricing.',
  },
];

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'API Reference', href: '/api' },
      { label: 'Status', href: '/status' },
    ],
  },
];

const socialLinks = [
  { platform: 'twitter' as const, href: 'https://twitter.com/yoursaas' },
  { platform: 'linkedin' as const, href: 'https://linkedin.com/company/yoursaas' },
  { platform: 'github' as const, href: 'https://github.com/yoursaas' },
];
