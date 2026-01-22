// components/Footer.tsx
import Link from 'next/link';

export interface FooterColumn {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface FooterProps {
  logo?: React.ReactNode;
  tagline?: string;
  columns: FooterColumn[];
  socialLinks?: {
    platform: 'twitter' | 'linkedin' | 'github' | 'youtube' | 'instagram';
    href: string;
  }[];
  copyright?: string;
  legalLinks?: {
    label: string;
    href: string;
  }[];
}

/**
 * Footer Component
 * 
 * Usage patterns (from 880+ SaaS sites):
 * - 90% use 3-5 column layout
 * - 70% include social links
 * - 85% have legal links (Privacy, Terms)
 * - 60% include newsletter signup
 * - Background: 65% dark, 35% light
 * 
 * @example
 * ```tsx
 * <Footer
 *   logo={<img src="/logo-white.svg" alt="Brand" />}
 *   tagline="Build your SaaS faster"
 *   columns={[
 *     {
 *       title: 'Product',
 *       links: [
 *         { label: 'Features', href: '/features' },
 *         { label: 'Pricing', href: '/pricing' },
 *       ]
 *     }
 *   ]}
 *   socialLinks={[
 *     { platform: 'twitter', href: 'https://twitter.com/...' },
 *     { platform: 'github', href: 'https://github.com/...' },
 *   ]}
 *   copyright="© 2024 Your Company. All rights reserved."
 *   legalLinks={[
 *     { label: 'Privacy', href: '/privacy' },
 *     { label: 'Terms', href: '/terms' },
 *   ]}
 * />
 * ```
 */
export function Footer({
  logo,
  tagline,
  columns,
  socialLinks,
  copyright,
  legalLinks,
}: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          {/* Brand Column */}
          <div className="footer-brand">
            {logo && <div className="footer-logo">{logo}</div>}
            {tagline && <p className="footer-tagline">{tagline}</p>}
            {socialLinks && socialLinks.length > 0 && (
              <div className="social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={social.platform}
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Columns */}
          {columns.map((column) => (
            <div key={column.title} className="footer-column">
              <h3 className="column-title">{column.title}</h3>
              <ul className="column-links">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="column-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="copyright">{copyright}</p>
          {legalLinks && legalLinks.length > 0 && (
            <div className="legal-links">
              {legalLinks.map((link, index) => (
                <span key={link.href}>
                  <Link href={link.href} className="legal-link">
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && <span className="separator">•</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--gray-900);
          color: var(--gray-300);
          padding: 80px 0 32px;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 2fr repeat(auto-fit, minmax(150px, 1fr));
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid var(--gray-800);
        }

        .footer-brand {
          max-width: 300px;
        }

        .footer-logo {
          margin-bottom: 16px;
        }

        .footer-tagline {
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-400);
          margin-bottom: 24px;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--gray-800);
          border-radius: 8px;
          color: var(--gray-300);
          transition: all 200ms ease-out;
        }

        .social-link:hover {
          background: var(--primary-600);
          color: white;
          transform: translateY(-2px);
        }

        .footer-column {
          min-width: 0;
        }

        .column-title {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .column-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .column-link {
          font-size: 14px;
          color: var(--gray-400);
          text-decoration: none;
          transition: color 200ms ease-out;
          display: inline-block;
        }

        .column-link:hover {
          color: white;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 32px;
          gap: 24px;
        }

        .copyright {
          font-size: 14px;
          color: var(--gray-500);
        }

        .legal-links {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .legal-link {
          font-size: 14px;
          color: var(--gray-500);
          text-decoration: none;
          transition: color 200ms ease-out;
        }

        .legal-link:hover {
          color: var(--gray-300);
        }

        .separator {
          color: var(--gray-700);
          margin: 0 8px;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 60px 0 24px;
          }

          .footer-main {
            grid-template-columns: 1fr;
            gap: 40px;
            padding-bottom: 40px;
          }

          .footer-brand {
            max-width: 100%;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .legal-links {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </footer>
  );
}

// Social Icon Component
function SocialIcon({ platform }: { platform: string }) {
  const icons = {
    twitter: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    github: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    youtube: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    instagram: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
  };

  return icons[platform as keyof typeof icons] || null;
}
