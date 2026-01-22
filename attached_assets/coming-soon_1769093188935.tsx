// examples/coming-soon.tsx
// Coming soon / waitlist page for pre-launch products
// Use this when: Building in public, collecting early interest, validating demand pre-build

import { Button } from '@/components/Button';
import { useState } from 'react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Connect to your email provider
    console.log('Waitlist signup:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSubmitted(true);
    setEmail('');
  };

  return (
    <main className="coming-soon">
      <div className="container">
        <div className="content">
          {/* Logo/brand */}
          <div className="brand">
            <div className="logo">🚀</div>
            <h1>YourProduct</h1>
          </div>

          {/* Status badge */}
          <div className="status-badge">
            <span className="pulse"></span>
            Building in Public
          </div>

          {/* Main message */}
          <h2 className="headline">
            The AI-powered analytics platform
            <br />
            built for modern product teams
          </h2>

          <p className="subheadline">
            We're building something special. Join 2,500+ product managers, 
            developers, and founders on the waitlist to get early access.
          </p>

          {/* Waitlist form */}
          {!submitted ? (
            <form className="waitlist-form" onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="email-input"
              />
              <Button type="submit" variant="primary" size="lg">
                Join Waitlist
              </Button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>You're on the list! We'll notify you when we launch.</p>
            </div>
          )}

          {/* Trust indicators */}
          <div className="trust-indicators">
            <div className="indicator">
              <strong>2,500+</strong> on waitlist
            </div>
            <div className="indicator">
              <strong>Q1 2025</strong> launch
            </div>
            <div className="indicator">
              <strong>Free</strong> for early adopters
            </div>
          </div>

          {/* Preview features */}
          <div className="features-preview">
            <h3>What we're building</h3>
            <div className="feature-list">
              <FeatureItem 
                icon="📊" 
                text="Real-time product analytics with AI-powered insights" 
              />
              <FeatureItem 
                icon="🎯" 
                text="Automated A/B testing and experiment tracking" 
              />
              <FeatureItem 
                icon="🔗" 
                text="Native integrations with 50+ tools you already use" 
              />
              <FeatureItem 
                icon="👥" 
                text="Collaborative dashboards and team workflows" 
              />
            </div>
          </div>

          {/* Social proof */}
          <div className="early-supporters">
            <p className="supporters-label">Early supporters from</p>
            <div className="company-logos">
              <span>Stripe</span>
              <span>Figma</span>
              <span>Linear</span>
              <span>Vercel</span>
            </div>
          </div>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-links">
              <a href="https://twitter.com/yourproduct" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
              <a href="mailto:hello@yourproduct.com">
                Contact
              </a>
              <a href="/privacy">
                Privacy
              </a>
            </div>
            <p className="copyright">
              &copy; 2025 YourProduct. All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      <style jsx>{`
        .coming-soon {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(
            135deg,
            var(--primary-50) 0%,
            var(--gray-50) 50%,
            white 100%
          );
        }

        .content {
          max-width: 700px;
          text-align: center;
        }

        .brand {
          margin-bottom: 24px;
        }

        .logo {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .brand h1 {
          font-size: 32px;
          font-weight: 700;
          color: var(--gray-900);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 32px;
        }

        .pulse {
          width: 8px;
          height: 8px;
          background: var(--primary-500);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .headline {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.2;
          color: var(--gray-900);
          margin-bottom: 20px;
        }

        .subheadline {
          font-size: 18px;
          line-height: 1.6;
          color: var(--gray-600);
          margin-bottom: 40px;
        }

        .waitlist-form {
          display: flex;
          gap: 12px;
          max-width: 500px;
          margin: 0 auto 32px;
        }

        .email-input {
          flex: 1;
          height: 52px;
          padding: 0 20px;
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          font-size: 16px;
          background: white;
          transition: all 200ms ease-out;
        }

        .email-input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        .success-message {
          max-width: 500px;
          margin: 0 auto 32px;
          padding: 24px;
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
          border-radius: 12px;
        }

        .success-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          background: var(--primary-500);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
        }

        .success-message p {
          font-size: 16px;
          color: var(--gray-700);
          margin: 0;
        }

        .trust-indicators {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 80px;
          padding-bottom: 80px;
          border-bottom: 1px solid var(--gray-200);
        }

        .indicator {
          font-size: 14px;
          color: var(--gray-600);
        }

        .indicator strong {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 4px;
        }

        .features-preview {
          margin-bottom: 80px;
        }

        .features-preview h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 32px;
        }

        .feature-list {
          display: grid;
          gap: 16px;
          text-align: left;
        }

        .early-supporters {
          margin-bottom: 60px;
        }

        .supporters-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .company-logos {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .company-logos span {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-600);
          opacity: 0.6;
          transition: opacity 200ms ease-out;
        }

        .company-logos span:hover {
          opacity: 1;
        }

        .footer {
          padding-top: 40px;
          border-top: 1px solid var(--gray-200);
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 16px;
        }

        .footer-links a {
          font-size: 14px;
          color: var(--gray-600);
          text-decoration: none;
          transition: color 200ms ease-out;
        }

        .footer-links a:hover {
          color: var(--gray-900);
        }

        .copyright {
          font-size: 12px;
          color: var(--gray-500);
        }

        @media (max-width: 640px) {
          .waitlist-form {
            flex-direction: column;
          }

          .waitlist-form :global(button) {
            width: 100%;
          }

          .trust-indicators {
            flex-direction: column;
            gap: 16px;
            margin-bottom: 60px;
            padding-bottom: 60px;
          }

          .company-logos {
            gap: 16px;
          }

          .company-logos span {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="feature-item">
      <span className="feature-icon">{icon}</span>
      <span className="feature-text">{text}</span>

      <style jsx>{`
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          transition: all 200ms ease-out;
        }

        .feature-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: var(--primary-200);
        }

        .feature-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .feature-text {
          font-size: 14px;
          color: var(--gray-700);
          text-align: left;
        }
      `}</style>
    </div>
  );
}
