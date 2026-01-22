import React from 'react';
import Navigation from '../components/Navigation';
import { CenterHero } from '../components/Hero';
import InteractiveDemo from '../components/InteractiveDemo';
import SocialProofBar from '../components/SocialProofBar';
import StatsShowcase from '../components/StatsShowcase';
import ComparisonTable from '../components/ComparisonTable';
import LogoCloud from '../components/LogoCloud';
import VideoShowcase from '../components/VideoShowcase';
import TrustBadges from '../components/TrustBadges';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

/**
 * High-Converting Landing Page
 * 
 * Demonstrates all 7 research-backed differentiators from 2024-2025 SaaS trends:
 * - InteractiveDemo: 1.7x more signups (only 4% use this)
 * - SocialProofBar: 85% of high-converters use customer logos
 * - StatsShowcase: 60% use "by the numbers" sections
 * - ComparisonTable: 30% show competitive analysis
 * - LogoCloud: 70% feature logos in hero
 * - VideoShowcase: 49% faster revenue growth with demo videos
 * - TrustBadges: Non-compliance messaging = 23% higher abandonment
 */
export default function HighConvertingLandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <Navigation
        logo="YourSaaS"
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Demo', href: '#demo' },
          { label: 'Customers', href: '#customers' },
        ]}
        ctaLabel="Start Free Trial"
        ctaHref="/signup"
      />

      {/* Hero with Logo Cloud */}
      <CenterHero
        badge="🚀 Now SOC 2 Type II Certified"
        title="Ship Products Faster with AI-Powered Analytics"
        subtitle="Get real-time insights, automated reports, and predictive intelligence. Trusted by 10,000+ teams worldwide."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        secondaryCTA={{ label: 'Watch Demo', href: '#video' }}
      />

      {/* Logo Cloud - 70% of sites feature this */}
      <LogoCloud
        title="Trusted by leading companies"
        logos={[
          { name: 'Stripe', imageUrl: 'https://via.placeholder.com/120x40/6772e5/ffffff?text=Stripe' },
          { name: 'Shopify', imageUrl: 'https://via.placeholder.com/120x40/96bf48/ffffff?text=Shopify' },
          { name: 'Notion', imageUrl: 'https://via.placeholder.com/120x40/000000/ffffff?text=Notion' },
          { name: 'Linear', imageUrl: 'https://via.placeholder.com/120x40/5e6ad2/ffffff?text=Linear' },
          { name: 'Vercel', imageUrl: 'https://via.placeholder.com/120x40/000000/ffffff?text=Vercel' },
          { name: 'Framer', imageUrl: 'https://via.placeholder.com/120x40/0055ff/ffffff?text=Framer' },
        ]}
        columns={6}
        grayscale
      />

      {/* Stats Showcase - 60% of high-performers use this */}
      <StatsShowcase
        title="Results that speak for themselves"
        stats={[
          {
            value: 10000,
            suffix: '+',
            label: 'Active Users',
            description: 'Teams shipping faster every day',
          },
          {
            value: 99.9,
            suffix: '%',
            label: 'Uptime SLA',
            description: 'Enterprise-grade reliability',
          },
          {
            value: 2.5,
            suffix: 'x',
            label: 'ROI Average',
            description: 'Return on investment in first year',
          },
          {
            value: 24,
            suffix: ' hrs',
            label: 'Support Response',
            description: 'Average time to resolution',
          },
        ]}
        layout="grid"
        background="dark"
      />

      {/* Interactive Demo - MAJOR differentiator (only 4% use this!) */}
      <InteractiveDemo
        title="See how it works"
        subtitle="Walk through our platform in 3 simple steps"
        steps={[
          {
            title: 'Connect Your Data',
            description: 'Import from 50+ sources in seconds. No code required.',
            imageUrl: 'https://via.placeholder.com/800x500/667eea/ffffff?text=Connect+Data',
          },
          {
            title: 'Build Custom Dashboards',
            description: 'Drag-and-drop interface with pre-built templates.',
            imageUrl: 'https://via.placeholder.com/800x500/764ba2/ffffff?text=Build+Dashboards',
          },
          {
            title: 'Share with Your Team',
            description: 'Real-time collaboration and automated reports.',
            imageUrl: 'https://via.placeholder.com/800x500/f093fb/ffffff?text=Share+Collaborate',
          },
        ]}
        layout="horizontal"
        autoPlay={false}
      />

      {/* Video Showcase - 49% faster revenue growth */}
      <VideoShowcase
        title="Watch it in action"
        subtitle="2-minute product walkthrough"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        thumbnail="https://via.placeholder.com/1280x720/000000/ffffff?text=Product+Demo+Video"
        transcript="[00:00] Welcome to YourSaaS...\n[00:15] First, connect your data sources...\n[00:45] Next, build your dashboard...\n[01:20] Finally, share with your team..."
        layout="centered"
      />

      {/* Social Proof Bar - 85% of high-converters use this */}
      <SocialProofBar
        title="Join 10,000+ teams already shipping faster"
        logos={[
          { name: 'Acme Corp', imageUrl: 'https://via.placeholder.com/150x50?text=Acme' },
          { name: 'TechStart', imageUrl: 'https://via.placeholder.com/150x50?text=TechStart' },
          { name: 'DataCo', imageUrl: 'https://via.placeholder.com/150x50?text=DataCo' },
          { name: 'CloudBase', imageUrl: 'https://via.placeholder.com/150x50?text=CloudBase' },
          { name: 'AppFlow', imageUrl: 'https://via.placeholder.com/150x50?text=AppFlow' },
          { name: 'DevTools', imageUrl: 'https://via.placeholder.com/150x50?text=DevTools' },
          { name: 'ScaleUp', imageUrl: 'https://via.placeholder.com/150x50?text=ScaleUp' },
          { name: 'BuildFast', imageUrl: 'https://via.placeholder.com/150x50?text=BuildFast' },
        ]}
        variant="scroll"
        grayscale
        speed={30}
      />

      {/* Comparison Table - 30% show competitive analysis */}
      <section style={{ padding: '80px 20px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '16px' }}>
            Why teams choose YourSaaS
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--gray-600)' }}>
            See how we stack up against the competition
          </p>
        </div>
        <ComparisonTable
          columns={[
            { name: 'Features', highlighted: false },
            { name: 'YourSaaS', highlighted: true, badge: 'Recommended' },
            { name: 'Competitor A', highlighted: false },
            { name: 'Competitor B', highlighted: false },
          ]}
          rows={[
            { feature: 'Real-time Analytics', values: [true, true, true, false] },
            { feature: 'Unlimited Data Sources', values: [true, true, false, false] },
            { feature: 'Custom Dashboards', values: [true, true, true, true] },
            { feature: 'AI-Powered Insights', values: [true, true, false, false] },
            { feature: 'White-Label Reports', values: [true, true, true, false] },
            { feature: '24/7 Support', values: [true, true, 'Email only', 'Business hours'] },
            { feature: 'SOC 2 Certified', values: [true, true, false, true] },
            { feature: 'Starting Price', values: ['Free', '$49/mo', '$99/mo', '$79/mo'] },
          ]}
        />
      </section>

      {/* Trust Badges - Non-compliance = 23% higher abandonment */}
      <TrustBadges
        title="Enterprise-grade security and compliance"
        badges={[
          {
            name: 'SOC 2 Type II',
            imageUrl: 'https://via.placeholder.com/80x80/10b981/ffffff?text=SOC2',
            description: 'Independently audited for security controls',
            verified: true,
          },
          {
            name: 'GDPR',
            imageUrl: 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=GDPR',
            description: 'EU data protection compliant',
            verified: true,
          },
          {
            name: 'HIPAA',
            imageUrl: 'https://via.placeholder.com/80x80/8b5cf6/ffffff?text=HIPAA',
            description: 'Healthcare data security certified',
            verified: true,
          },
          {
            name: 'ISO 27001',
            imageUrl: 'https://via.placeholder.com/80x80/f59e0b/ffffff?text=ISO',
            description: 'International security management standard',
            verified: true,
          },
          {
            name: 'PCI-DSS',
            imageUrl: 'https://via.placeholder.com/80x80/ef4444/ffffff?text=PCI',
            description: 'Payment card industry data security',
            verified: true,
          },
        ]}
        layout="horizontal"
        size="medium"
        showDescription
      />

      {/* Final CTA */}
      <CTASection
        title="Ready to ship faster?"
        subtitle="Join 10,000+ teams using YourSaaS to build better products."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        secondaryCTA={{ label: 'Book a Demo', href: '/demo' }}
        note="No credit card required • Free 14-day trial"
        background="gradient"
      />

      {/* Footer */}
      <Footer
        companyName="YourSaaS"
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Features', href: '/features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Demo', href: '/demo' },
              { label: 'Security', href: '/security' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '/docs' },
              { label: 'API Reference', href: '/api' },
              { label: 'Blog', href: '/blog' },
              { label: 'Guides', href: '/guides' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Careers', href: '/careers' },
              { label: 'Contact', href: '/contact' },
              { label: 'Partners', href: '/partners' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Security', href: '/security' },
              { label: 'Compliance', href: '/compliance' },
            ],
          },
        ]}
        socialLinks={{
          twitter: 'https://twitter.com/yoursaas',
          linkedin: 'https://linkedin.com/company/yoursaas',
          github: 'https://github.com/yoursaas',
        }}
      />
    </div>
  );
}
