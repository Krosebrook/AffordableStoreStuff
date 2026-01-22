// components/Hero.tsx
// Based on analysis of 880+ SaaS landing pages
// Patterns: Center-aligned, Split layout, Video background

'use client';

import { ReactNode } from 'react';
import { Button } from './Button';

// ============================================
// PATTERN 1: Center-Aligned Hero (60% usage)
// Best for: Product launches, developer tools
// Examples: Linear, Notion, Framer
// ============================================

interface CenterHeroProps {
  heading: string;
  subheading: string;
  primaryCTA: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  visual?: ReactNode;
  trustBadges?: ReactNode;
  className?: string;
}

export function CenterHero({
  heading,
  subheading,
  primaryCTA,
  secondaryCTA,
  visual,
  trustBadges,
  className = '',
}: CenterHeroProps) {
  return (
    <section className={`hero-center ${className}`}>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-heading">{heading}</h1>
          <p className="hero-subheading">{subheading}</p>

          <div className="hero-cta-group">
            <Button
              variant="primary"
              size="lg"
              href={primaryCTA.href}
              onClick={primaryCTA.onClick}
            >
              {primaryCTA.text}
            </Button>

            {secondaryCTA && (
              <Button
                variant="secondary"
                size="lg"
                href={secondaryCTA.href}
                onClick={secondaryCTA.onClick}
              >
                {secondaryCTA.text}
              </Button>
            )}
          </div>

          {trustBadges && <div className="hero-trust">{trustBadges}</div>}
        </div>

        {visual && <div className="hero-visual">{visual}</div>}
      </div>

      <style jsx>{`
        .hero-center {
          padding: 120px 0 160px;
          text-align: center;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-heading {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          color: var(--gray-900, #171717);
        }

        .hero-subheading {
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 400;
          line-height: 1.5;
          color: var(--gray-600, #525252);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }

        .hero-trust {
          margin-top: 48px;
          opacity: 0.8;
        }

        .hero-visual {
          margin-top: 64px;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 640px) {
          .hero-center {
            padding: 80px 0 100px;
          }

          .hero-cta-group {
            flex-direction: column;
          }

          .hero-cta-group :global(button),
          .hero-cta-group :global(a) {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

// ============================================
// PATTERN 2: Split Layout Hero (25% usage)
// Best for: Enterprise SaaS, B2B tools
// Examples: Webflow, Clerk, Lattice
// ============================================

interface SplitHeroProps {
  heading: string;
  subheading: string;
  primaryCTA: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  visual: ReactNode;
  trustBadges?: ReactNode;
  className?: string;
}

export function SplitHero({
  heading,
  subheading,
  primaryCTA,
  secondaryCTA,
  visual,
  trustBadges,
  className = '',
}: SplitHeroProps) {
  return (
    <section className={`hero-split ${className}`}>
      <div className="hero-container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-heading">{heading}</h1>
            <p className="hero-subheading">{subheading}</p>

            <div className="hero-cta-group">
              <Button
                variant="primary"
                size="lg"
                href={primaryCTA.href}
                onClick={primaryCTA.onClick}
              >
                {primaryCTA.text}
              </Button>

              {secondaryCTA && (
                <Button
                  variant="secondary"
                  size="lg"
                  href={secondaryCTA.href}
                  onClick={secondaryCTA.onClick}
                >
                  {secondaryCTA.text}
                </Button>
              )}
            </div>

            {trustBadges && <div className="hero-trust">{trustBadges}</div>}
          </div>

          <div className="hero-visual">{visual}</div>
        </div>
      </div>

      <style jsx>{`
        .hero-split {
          padding: 100px 0 120px;
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .hero-content {
          text-align: left;
        }

        .hero-heading {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          color: var(--gray-900, #171717);
        }

        .hero-subheading {
          font-size: clamp(16px, 2vw, 20px);
          font-weight: 400;
          line-height: 1.6;
          color: var(--gray-600, #525252);
          margin-bottom: 32px;
          max-width: 500px;
        }

        .hero-cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 320px;
          margin-bottom: 32px;
        }

        .hero-trust {
          margin-top: 32px;
        }

        .hero-visual {
          position: relative;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .hero-visual {
            order: -1;
          }

          .hero-content {
            text-align: center;
          }

          .hero-cta-group {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-subheading {
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 640px) {
          .hero-split {
            padding: 60px 0 80px;
          }
        }
      `}</style>
    </section>
  );
}

// ============================================
// PATTERN 3: Video Background Hero (15% usage)
// Best for: Consumer apps, creative tools, AI products
// Examples: ChatGPT, Jitter, DreamCut
// ============================================

interface VideoHeroProps {
  videoSrc: string;
  posterSrc: string;
  heading: string;
  subheading?: string;
  primaryCTA: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  overlayOpacity?: number; // 0-1
  className?: string;
}

export function VideoHero({
  videoSrc,
  posterSrc,
  heading,
  subheading,
  primaryCTA,
  overlayOpacity = 0.4,
  className = '',
}: VideoHeroProps) {
  return (
    <section className={`hero-video ${className}`}>
      <video
        className="hero-video-bg"
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div
        className="hero-overlay"
        style={{ opacity: overlayOpacity }}
      />

      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-heading">{heading}</h1>
          {subheading && <p className="hero-subheading">{subheading}</p>}

          <Button
            variant="primary"
            size="xl"
            href={primaryCTA.href}
            onClick={primaryCTA.onClick}
            className="hero-cta"
          >
            {primaryCTA.text}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .hero-video {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-video-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          z-index: 0;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0.6) 100%
          );
          z-index: 1;
        }

        .hero-container {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
        }

        .hero-content {
          backdrop-filter: blur(8px);
          padding: 48px;
          border-radius: 16px;
        }

        .hero-heading {
          font-size: clamp(48px, 7vw, 80px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-subheading {
          font-size: clamp(18px, 2.5vw, 28px);
          font-weight: 400;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .hero-cta {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 640px) {
          .hero-content {
            padding: 32px 24px;
          }

          .hero-video {
            min-height: 80vh;
          }
        }
      `}</style>
    </section>
  );
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Center Hero Example
<CenterHero
  heading="Build faster with AI-powered tools"
  subheading="Join 10,000+ developers shipping products 10x faster with our AI platform"
  primaryCTA={{ text: "Start Free Trial", href: "/signup" }}
  secondaryCTA={{ text: "Watch Demo", href: "/demo" }}
  visual={<Image src="/hero-demo.png" alt="Product demo" />}
  trustBadges={<LogoWall />}
/>

// Split Hero Example
<SplitHero
  heading="Enterprise-grade security for modern teams"
  subheading="SOC 2 compliant. HIPAA ready. Built for scale."
  primaryCTA={{ text: "Get Started", href: "/signup" }}
  secondaryCTA={{ text: "Talk to Sales", href: "/contact" }}
  visual={<ProductScreenshot />}
  trustBadges={<TrustLogos />}
/>

// Video Hero Example
<VideoHero
  videoSrc="/videos/hero-background.mp4"
  posterSrc="/images/hero-poster.jpg"
  heading="Create amazing content in seconds"
  subheading="Powered by AI, designed for creators"
  primaryCTA={{ text: "Try it free", href: "/signup" }}
  overlayOpacity={0.5}
/>
*/
