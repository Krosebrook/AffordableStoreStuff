'use client';

import React from 'react';

interface Logo {
  name: string;
  imageUrl?: string;
  url?: string;
}

interface LogoCloudProps {
  title?: string;
  logos: Logo[];
  columns?: 3 | 4 | 5 | 6;
  size?: 'small' | 'medium' | 'large';
  grayscale?: boolean;
  clickable?: boolean;
}

/**
 * LogoCloud - Customer/partner logo grid
 * 
 * Usage: 70% of SaaS sites feature customer logos in hero section.
 * Simple grid display of trusted brands.
 * 
 * @param title - Optional heading (e.g., "Trusted by industry leaders")
 * @param logos - Array of logos with names, images, and optional links
 * @param columns - Number of columns in grid (default: 4)
 * @param size - Logo size: small (40px), medium (60px), large (80px)
 * @param grayscale - Convert to grayscale (default: true)
 * @param clickable - Make logos clickable links
 */
export default function LogoCloud({
  title,
  logos,
  columns = 4,
  size = 'medium',
  grayscale = true,
  clickable = false,
}: LogoCloudProps) {
  const sizeMap = {
    small: '40px',
    medium: '60px',
    large: '80px',
  };

  const LogoItem = ({ logo }: { logo: Logo }) => {
    const content = (
      <div className="logo-content">
        {logo.imageUrl ? (
          <img
            src={logo.imageUrl}
            alt={logo.name}
            loading="lazy"
            className={grayscale ? 'grayscale' : ''}
          />
        ) : (
          <div className="logo-placeholder">
            <span>{logo.name}</span>
          </div>
        )}
      </div>
    );

    if (clickable && logo.url) {
      return (
        <a
          href={logo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="logo-link"
          aria-label={`Visit ${logo.name}`}
        >
          {content}
        </a>
      );
    }

    return content;
  };

  return (
    <div className="logo-cloud">
      {title && (
        <div className="cloud-header">
          <p className="title">{title}</p>
        </div>
      )}

      <div className="logo-grid">
        {logos.map((logo, index) => (
          <div key={index} className="logo-item">
            <LogoItem logo={logo} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .logo-cloud {
          padding: 48px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .cloud-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .title {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gray-600);
        }

        .logo-grid {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: 40px;
          align-items: center;
          justify-items: center;
        }

        .logo-item {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-content,
        .logo-link {
          display: flex;
          justify-content: center;
          align-items: center;
          height: ${sizeMap[size]};
          text-decoration: none;
        }

        .logo-link {
          transition: transform 0.2s ease;
        }

        .logo-link:hover {
          transform: scale(1.05);
        }

        .logo-content img,
        .logo-link img {
          max-width: 160px;
          max-height: ${sizeMap[size]};
          width: auto;
          height: auto;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        img.grayscale {
          filter: grayscale(100%) brightness(0.9);
          opacity: 0.7;
        }

        .logo-link:hover img.grayscale,
        .logo-content:hover img.grayscale {
          filter: grayscale(0%) brightness(1);
          opacity: 1;
        }

        .logo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 140px;
          height: ${sizeMap[size]};
          background: white;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          font-weight: 600;
          color: var(--gray-600);
          font-size: 0.875rem;
          padding: 8px;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .logo-grid {
            grid-template-columns: repeat(${Math.max(3, columns - 1)}, 1fr);
            gap: 32px;
          }
        }

        @media (max-width: 768px) {
          .logo-cloud {
            padding: 40px 16px;
          }

          .cloud-header {
            margin-bottom: 24px;
          }

          .logo-grid {
            grid-template-columns: repeat(${Math.max(2, columns - 2)}, 1fr);
            gap: 24px;
          }

          .logo-content img,
          .logo-link img {
            max-width: 120px;
            max-height: ${size === 'large' ? '60px' : size === 'medium' ? '50px' : '40px'};
          }

          .logo-placeholder {
            width: 100px;
            height: ${size === 'large' ? '60px' : size === 'medium' ? '50px' : '40px'};
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .logo-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
