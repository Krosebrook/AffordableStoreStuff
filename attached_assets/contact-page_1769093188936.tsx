// examples/contact-page.tsx
// Complete contact page template
// Copy to your Next.js app/contact/page.tsx

'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
        <section className="contact-hero">
          <div className="container">
            <div className="hero-content">
              <h1>Get in touch</h1>
              <p className="hero-subtitle">
                Have questions? We'd love to hear from you. Send us a message and
                we'll respond as soon as possible.
              </p>
            </div>
          </div>

          <style jsx>{`
            .contact-hero {
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

            .contact-hero h1 {
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
              .contact-hero {
                padding: 80px 0 40px;
              }

              .hero-subtitle {
                font-size: 18px;
              }
            }
          `}</style>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact-section">
          <div className="container">
            <div className="contact-grid">
              {/* Contact Info */}
              <div className="contact-info">
                <h2>Contact Information</h2>
                <p className="info-subtitle">
                  Choose the best way to reach us
                </p>

                <div className="contact-methods">
                  <div className="contact-method">
                    <div className="method-icon">📧</div>
                    <div>
                      <h3>Email</h3>
                      <p>support@yoursaas.com</p>
                      <p className="response-time">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">💬</div>
                    <div>
                      <h3>Live Chat</h3>
                      <p>Available 9am-5pm EST</p>
                      <p className="response-time">Instant response</p>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">📞</div>
                    <div>
                      <h3>Phone</h3>
                      <p>+1 (555) 123-4567</p>
                      <p className="response-time">Mon-Fri 9am-5pm EST</p>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">📍</div>
                    <div>
                      <h3>Office</h3>
                      <p>123 SaaS Street</p>
                      <p>San Francisco, CA 94102</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-container">
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    style={{ width: '100%' }}
                  >
                    Send Message
                  </Button>

                  <p className="form-note">
                    We'll get back to you within 24 hours
                  </p>
                </form>
              </div>
            </div>
          </div>

          <style jsx>{`
            .contact-section {
              padding: 80px 0;
              background: white;
            }

            .contact-grid {
              display: grid;
              grid-template-columns: 1fr 1.2fr;
              gap: 80px;
              max-width: 1200px;
              margin: 0 auto;
            }

            .contact-info h2 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 12px;
              color: var(--gray-900);
            }

            .info-subtitle {
              font-size: 16px;
              color: var(--gray-600);
              margin-bottom: 40px;
            }

            .contact-methods {
              display: flex;
              flex-direction: column;
              gap: 32px;
            }

            .contact-method {
              display: flex;
              gap: 16px;
            }

            .method-icon {
              flex-shrink: 0;
              width: 48px;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              background: var(--primary-50);
              border-radius: 12px;
            }

            .contact-method h3 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
              color: var(--gray-900);
            }

            .contact-method p {
              font-size: 15px;
              color: var(--gray-700);
              margin: 0;
            }

            .response-time {
              font-size: 14px !important;
              color: var(--gray-500) !important;
              margin-top: 4px !important;
            }

            .contact-form-container {
              background: var(--gray-50);
              border-radius: 16px;
              padding: 40px;
            }

            .contact-form {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }

            .form-group {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            label {
              font-size: 14px;
              font-weight: 600;
              color: var(--gray-900);
            }

            input,
            textarea {
              width: 100%;
              padding: 12px 16px;
              font-size: 15px;
              color: var(--gray-900);
              background: white;
              border: 1px solid var(--gray-300);
              border-radius: 8px;
              transition: all 200ms ease-out;
              font-family: inherit;
            }

            input:focus,
            textarea:focus {
              outline: none;
              border-color: var(--primary-600);
              box-shadow: 0 0 0 3px var(--primary-100);
            }

            input::placeholder,
            textarea::placeholder {
              color: var(--gray-400);
            }

            textarea {
              resize: vertical;
              min-height: 120px;
            }

            .form-note {
              font-size: 14px;
              color: var(--gray-500);
              text-align: center;
              margin: 0;
            }

            @media (max-width: 768px) {
              .contact-section {
                padding: 60px 0;
              }

              .contact-grid {
                grid-template-columns: 1fr;
                gap: 48px;
              }

              .contact-form-container {
                padding: 32px 24px;
              }

              .contact-info h2 {
                font-size: 28px;
              }
            }
          `}</style>
        </section>
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
