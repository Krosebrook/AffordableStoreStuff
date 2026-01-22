// components/Navigation.tsx
'use client';

import { useState } from 'react';
import { Button } from './Button';
import Link from 'next/link';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationProps {
  logo?: React.ReactNode;
  logoHref?: string;
  links: NavLink[];
  ctaButton?: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  sticky?: boolean;
  transparent?: boolean;
}

/**
 * Navigation Component
 * 
 * Usage patterns (from 880+ SaaS sites):
 * - 85% use sticky navigation
 * - 60% have CTA button in nav
 * - 90% show 4-6 main links
 * - 75% use hamburger menu on mobile
 * - 40% have transparent nav on hero, then solid on scroll
 * 
 * @example
 * ```tsx
 * <Navigation
 *   logo={<img src="/logo.svg" alt="Brand" />}
 *   links={[
 *     { label: 'Features', href: '/features' },
 *     { label: 'Pricing', href: '/pricing' },
 *     { label: 'About', href: '/about' },
 *   ]}
 *   ctaButton={{ text: 'Sign Up', href: '/signup' }}
 *   sticky={true}
 * />
 * ```
 */
export function Navigation({
  logo,
  logoHref = '/',
  links,
  ctaButton,
  sticky = true,
  transparent = false,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className={`nav ${sticky ? 'sticky' : ''} ${transparent ? 'transparent' : ''}`}>
        <div className="container">
          <div className="nav-content">
            {/* Logo */}
            <Link href={logoHref} className="logo">
              {logo || <span className="logo-text">Logo</span>}
            </Link>

            {/* Desktop Links */}
            <div className="nav-links desktop-only">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            {ctaButton && (
              <div className="nav-cta desktop-only">
                <Button
                  variant={ctaButton.variant || 'primary'}
                  size="md"
                  href={ctaButton.href}
                >
                  {ctaButton.text}
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {ctaButton && (
              <div className="mobile-menu-cta">
                <Button
                  variant={ctaButton.variant || 'primary'}
                  size="lg"
                  href={ctaButton.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {ctaButton.text}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .nav {
          background: white;
          border-bottom: 1px solid var(--gray-200);
          transition: all 200ms ease-out;
        }

        .nav.sticky {
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .nav.transparent {
          background: transparent;
          border-bottom-color: transparent;
        }

        .nav.transparent.sticky {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom-color: var(--gray-200);
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 48px;
        }

        .logo {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          text-decoration: none;
          transition: opacity 200ms ease-out;
        }

        .logo:hover {
          opacity: 0.8;
        }

        .logo-text {
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          flex: 1;
        }

        .nav-link {
          font-size: 15px;
          font-weight: 500;
          color: var(--gray-700);
          text-decoration: none;
          transition: color 200ms ease-out;
          position: relative;
        }

        .nav-link:hover {
          color: var(--gray-900);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-600);
          transform: scaleX(0);
          transition: transform 200ms ease-out;
        }

        .nav-link:hover::after {
          transform: scaleX(1);
        }

        .nav-cta {
          flex-shrink: 0;
        }

        .mobile-menu-button {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          background: transparent;
          border: none;
          color: var(--gray-700);
          cursor: pointer;
          transition: color 200ms ease-out;
        }

        .mobile-menu-button:hover {
          color: var(--gray-900);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 200;
          animation: fadeIn 200ms ease-out;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 72px;
          right: 0;
          bottom: 0;
          width: min(320px, 100vw);
          background: white;
          border-left: 1px solid var(--gray-200);
          z-index: 300;
          animation: slideInRight 200ms ease-out;
          padding: 24px;
          overflow-y: auto;
        }

        .mobile-menu-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
        }

        .mobile-menu-link {
          display: block;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 500;
          color: var(--gray-700);
          text-decoration: none;
          border-radius: 8px;
          transition: all 200ms ease-out;
        }

        .mobile-menu-link:hover {
          background: var(--gray-50);
          color: var(--gray-900);
        }

        .mobile-menu-cta :global(button),
        .mobile-menu-cta :global(a) {
          width: 100%;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-only {
            display: flex !important;
          }

          .mobile-overlay,
          .mobile-menu {
            display: block;
          }

          .nav-content {
            height: 64px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
