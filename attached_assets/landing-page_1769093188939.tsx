// examples/landing-page.tsx
// Complete example showing all components working together
// Copy this to your Next.js app/page.tsx to get started

import { CenterHero, SplitHero } from '@/components/Hero';
import { Pricing } from '@/components/Pricing';
import { Button } from '@/components/Button';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main>
      {/* HERO SECTION - Center aligned pattern */}
      <CenterHero
        heading="Build your SaaS faster with AI-powered tools"
        subheading="Join 10,000+ developers shipping products 10x faster with our comprehensive platform. No credit card required."
        primaryCTA={{
          text: 'Start Free Trial',
          href: '/signup',
        }}
        secondaryCTA={{
          text: 'Watch Demo',
          href: '/demo',
        }}
        visual={
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
            <Image
              src="/hero-demo.png"
              alt="Product dashboard showing analytics"
              fill
              style={{ objectFit: 'contain', borderRadius: '12px' }}
              priority
            />
          </div>
        }
        trustBadges={<TrustLogos />}
      />

      {/* FEATURES SECTION - Simple grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need to ship faster</h2>
            <p>Powerful features that accelerate your development workflow</p>
          </div>

          <div className="feature-grid">
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              description="Deploy in seconds with our optimized build pipeline and global CDN"
            />
            <FeatureCard
              icon="🔒"
              title="Enterprise Security"
              description="SOC 2 compliant with automatic backups and encryption at rest"
            />
            <FeatureCard
              icon="📊"
              title="Real-time Analytics"
              description="Track every metric that matters with our built-in analytics dashboard"
            />
            <FeatureCard
              icon="🔧"
              title="Easy Integration"
              description="Connect with 100+ tools through our REST API and webhooks"
            />
            <FeatureCard
              icon="👥"
              title="Team Collaboration"
              description="Invite unlimited team members with granular permission controls"
            />
            <FeatureCard
              icon="📱"
              title="Mobile Optimized"
              description="Beautiful responsive design that works on any device"
            />
          </div>
        </div>

        <style jsx>{`
          .features-section {
            padding: 100px 0;
            background: white;
          }

          .section-header {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 64px;
          }

          .section-header h2 {
            font-size: clamp(32px, 4vw, 48px);
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--gray-900);
          }

          .section-header p {
            font-size: 18px;
            color: var(--gray-600);
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
          }

          @media (max-width: 640px) {
            .features-section {
              padding: 60px 0;
            }

            .feature-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
          }
        `}</style>
      </section>

      {/* SOCIAL PROOF - Logo wall */}
      <section className="social-proof">
        <div className="container">
          <p className="trust-heading">Trusted by teams at</p>
          <LogoWall />
        </div>

        <style jsx>{`
          .social-proof {
            padding: 60px 0;
            background: var(--gray-50);
          }

          .trust-heading {
            text-align: center;
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 32px;
          }
        `}</style>
      </section>

      {/* PRICING SECTION */}
      <Pricing
        tiers={pricingTiers}
        showBillingToggle={true}
        annualSavings="Save 20%"
      />

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Loved by thousands of developers</h2>
            <p>See what our customers have to say</p>
          </div>

          <div className="testimonial-grid">
            <TestimonialCard
              quote="This platform cut our development time in half. We shipped our MVP in 2 weeks instead of 2 months."
              author="Sarah Chen"
              role="Founder, TechStart"
              avatar="/avatars/sarah.jpg"
            />
            <TestimonialCard
              quote="The best developer experience I've had. Everything just works out of the box."
              author="Marcus Rodriguez"
              role="Lead Engineer, Scale Inc"
              avatar="/avatars/marcus.jpg"
            />
            <TestimonialCard
              quote="Our team productivity increased 3x after switching. The analytics alone are worth it."
              author="Emma Thompson"
              role="CTO, GrowthCo"
              avatar="/avatars/emma.jpg"
            />
          </div>
        </div>

        <style jsx>{`
          .testimonials {
            padding: 100px 0;
            background: white;
          }

          .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
          }

          @media (max-width: 640px) {
            .testimonials {
              padding: 60px 0;
            }

            .testimonial-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to ship faster?</h2>
            <p>Join 10,000+ developers building the future</p>
            <div className="cta-buttons">
              <Button variant="primary" size="xl" href="/signup">
                Start Free Trial
              </Button>
              <Button variant="secondary" size="xl" href="/contact">
                Talk to Sales
              </Button>
            </div>
            <p className="cta-note">No credit card required • 14-day free trial</p>
          </div>
        </div>

        <style jsx>{`
          .final-cta {
            padding: 120px 0;
            background: linear-gradient(
              135deg,
              var(--primary-50) 0%,
              var(--gray-50) 100%
            );
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
            color: var(--gray-900);
          }

          .cta-content p {
            font-size: 20px;
            color: var(--gray-600);
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
            color: var(--gray-500);
            margin-bottom: 0;
          }

          @media (max-width: 640px) {
            .final-cta {
              padding: 80px 0;
            }

            .cta-buttons {
              flex-direction: column;
            }

            .cta-buttons :global(button),
            .cta-buttons :global(a) {
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>

      <style jsx>{`
        .feature-card {
          padding: 32px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          transition: all 200ms ease-out;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--primary-200);
        }

        .feature-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--gray-900);
        }

        .feature-card p {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}) {
  return (
    <div className="testimonial-card">
      <p className="quote">"{quote}"</p>
      <div className="author">
        <div className="avatar">
          <Image
            src={avatar}
            alt={author}
            width={48}
            height={48}
            style={{ borderRadius: '50%' }}
          />
        </div>
        <div className="author-info">
          <p className="author-name">{author}</p>
          <p className="author-role">{role}</p>
        </div>
      </div>

      <style jsx>{`
        .testimonial-card {
          padding: 32px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          transition: all 200ms ease-out;
        }

        .testimonial-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .quote {
          font-size: 16px;
          line-height: 1.6;
          color: var(--gray-700);
          margin-bottom: 24px;
          font-style: italic;
        }

        .author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          flex-shrink: 0;
        }

        .author-name {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 2px;
        }

        .author-role {
          font-size: 14px;
          color: var(--gray-600);
        }
      `}</style>
    </div>
  );
}

function TrustLogos() {
  const companies = [
    'Acme Corp',
    'TechStart',
    'Scale Inc',
    'GrowthCo',
    'BuildFast',
  ];

  return (
    <div className="logo-wall">
      {companies.map((company) => (
        <div key={company} className="logo-placeholder">
          {company}
        </div>
      ))}

      <style jsx>{`
        .logo-wall {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 48px;
          flex-wrap: wrap;
          opacity: 0.6;
        }

        .logo-placeholder {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-600);
          transition: all 200ms ease-out;
        }

        .logo-placeholder:hover {
          opacity: 1;
          color: var(--gray-900);
        }

        @media (max-width: 640px) {
          .logo-wall {
            gap: 24px;
          }

          .logo-placeholder {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

function LogoWall() {
  // Placeholder - replace with actual company logos
  return <TrustLogos />;
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
