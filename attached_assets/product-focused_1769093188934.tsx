// examples/product-focused.tsx
// Product-focused landing page for specific features or tools
// Use this when: Launching new feature, marketing specific product, targeting niche audience

import { SplitHero } from '@/components/Hero';
import { Button } from '@/components/Button';
import Image from 'next/image';

export default function ProductFocused() {
  return (
    <main>
      {/* Split hero with product demo */}
      <SplitHero
        heading="Turn customer feedback into features in minutes"
        subheading="AI-powered product prioritization that analyzes thousands of feedback points and tells you exactly what to build next."
        primaryCTA={{
          text: 'Try Free for 14 Days',
          href: '/signup',
        }}
        secondaryCTA={{
          text: 'See How It Works',
          href: '#demo',
        }}
        visual={
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
            <Image
              src="/product-demo.png"
              alt="Product dashboard showing prioritized features"
              fill
              style={{ objectFit: 'cover', borderRadius: '12px' }}
              priority
            />
          </div>
        }
      />

      {/* Problem-solution narrative */}
      <section className="problem-solution">
        <div className="container">
          <div className="problem">
            <span className="label">The Problem</span>
            <h2>Product teams drown in feedback</h2>
            <p>
              Your team gets hundreds of feature requests from Slack, email, support tickets, 
              and user interviews. You spend weeks manually categorizing, prioritizing, and 
              deciding what to build—only to realize you shipped the wrong thing.
            </p>
          </div>

          <div className="solution">
            <span className="label">The Solution</span>
            <h2>AI that thinks like your best PM</h2>
            <p>
              Our AI analyzes every piece of feedback, groups similar requests, calculates 
              impact scores, and generates prioritized roadmaps—all in real-time. You focus 
              on building. We handle the noise.
            </p>
          </div>
        </div>

        <style jsx>{`
          .problem-solution {
            padding: 100px 0;
            background: white;
          }

          .problem-solution .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            max-width: 1200px;
          }

          .label {
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            color: var(--primary-600);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
          }

          .problem h2,
          .solution h2 {
            font-size: clamp(28px, 3vw, 36px);
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--gray-900);
          }

          .problem p,
          .solution p {
            font-size: 16px;
            line-height: 1.7;
            color: var(--gray-600);
          }

          .problem {
            padding-right: 40px;
            border-right: 1px solid var(--gray-200);
          }

          @media (max-width: 768px) {
            .problem-solution .container {
              grid-template-columns: 1fr;
              gap: 60px;
            }

            .problem {
              padding-right: 0;
              border-right: none;
              padding-bottom: 40px;
              border-bottom: 1px solid var(--gray-200);
            }
          }
        `}</style>
      </section>

      {/* How it works (step-by-step) */}
      <section className="how-it-works" id="demo">
        <div className="container">
          <div className="section-header">
            <h2>How it works</h2>
            <p>From feedback chaos to clear roadmap in 3 steps</p>
          </div>

          <div className="steps">
            <Step
              number={1}
              title="Connect your feedback sources"
              description="Integrate Slack, Intercom, email, and CSV uploads. We pull in everything automatically."
              visual="/step-1.png"
            />
            <Step
              number={2}
              title="AI analyzes and categorizes"
              description="Our AI groups similar feedback, identifies patterns, and calculates impact scores based on frequency, user value, and strategic fit."
              visual="/step-2.png"
            />
            <Step
              number={3}
              title="Get your prioritized roadmap"
              description="See exactly what to build next, why it matters, and which customers requested it. Export to Linear, Jira, or Notion."
              visual="/step-3.png"
            />
          </div>
        </div>

        <style jsx>{`
          .how-it-works {
            padding: 100px 0;
            background: var(--gray-50);
          }

          .section-header {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 80px;
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

          .steps {
            display: flex;
            flex-direction: column;
            gap: 80px;
          }

          @media (max-width: 640px) {
            .how-it-works {
              padding: 60px 0;
            }

            .section-header {
              margin-bottom: 60px;
            }

            .steps {
              gap: 60px;
            }
          }
        `}</style>
      </section>

      {/* Social proof - specific metrics */}
      <section className="social-proof">
        <div className="container">
          <div className="metrics">
            <Metric value="10K+" label="Feedback points analyzed daily" />
            <Metric value="85%" label="Average time saved on prioritization" />
            <Metric value="500+" label="Product teams using daily" />
            <Metric value="4.9/5" label="Average customer rating" />
          </div>
        </div>

        <style jsx>{`
          .social-proof {
            padding: 80px 0;
            background: white;
          }

          .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 40px;
          }

          @media (max-width: 640px) {
            .social-proof {
              padding: 60px 0;
            }

            .metrics {
              grid-template-columns: repeat(2, 1fr);
              gap: 32px;
            }
          }
        `}</style>
      </section>

      {/* Final CTA with urgency */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <span className="cta-badge">Limited Time Offer</span>
            <h2>Start shipping the right features today</h2>
            <p>Join 500+ product teams building what users actually want</p>
            <div className="cta-buttons">
              <Button variant="primary" size="xl" href="/signup">
                Start Free 14-Day Trial
              </Button>
            </div>
            <ul className="cta-benefits">
              <li>✓ No credit card required</li>
              <li>✓ Cancel anytime</li>
              <li>✓ Free onboarding call</li>
            </ul>
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
          }

          .cta-content {
            text-align: center;
            max-width: 700px;
            margin: 0 auto;
          }

          .cta-badge {
            display: inline-block;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
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

          .cta-buttons {
            display: flex;
            justify-content: center;
            margin-bottom: 32px;
          }

          .cta-benefits {
            display: flex;
            justify-content: center;
            gap: 32px;
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }

          @media (max-width: 640px) {
            .final-cta {
              padding: 80px 0;
            }

            .cta-benefits {
              flex-direction: column;
              gap: 8px;
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

function Step({
  number,
  title,
  description,
  visual,
}: {
  number: number;
  title: string;
  description: string;
  visual: string;
}) {
  return (
    <div className="step">
      <div className="step-visual">
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
          <Image
            src={visual}
            alt={title}
            fill
            style={{ objectFit: 'cover', borderRadius: '12px' }}
          />
        </div>
      </div>
      <div className="step-content">
        <div className="step-number">{number}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <style jsx>{`
        .step {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .step:nth-child(even) {
          direction: rtl;
        }

        .step:nth-child(even) > * {
          direction: ltr;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--primary-100);
          color: var(--primary-700);
          border-radius: 50%;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .step h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--gray-900);
        }

        .step p {
          font-size: 16px;
          line-height: 1.7;
          color: var(--gray-600);
        }

        @media (max-width: 768px) {
          .step {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .step:nth-child(even) {
            direction: ltr;
          }
        }
      `}</style>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>

      <style jsx>{`
        .metric {
          text-align: center;
        }

        .metric-value {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          color: var(--primary-600);
          margin-bottom: 8px;
        }

        .metric-label {
          font-size: 14px;
          color: var(--gray-600);
        }
      `}</style>
    </div>
  );
}
