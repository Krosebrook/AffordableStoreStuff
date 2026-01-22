// components/FeatureGrid.tsx
export interface Feature {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
}

export interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  layout?: 'cards' | 'minimal' | 'centered';
}

/**
 * Feature Grid Component
 * 
 * Usage patterns (from 880+ SaaS sites):
 * - 90% include feature section
 * - Most common: 3-column grid (65%), then 2-column (20%), 4-column (15%)
 * - 75% use icons (emoji 40%, SVG 35%)
 * - 60% use card layout with borders/shadows
 * - 40% use minimal layout (no cards)
 * 
 * @example
 * ```tsx
 * <FeatureGrid
 *   title="Everything you need"
 *   subtitle="Powerful features for modern teams"
 *   features={[
 *     {
 *       icon: '⚡',
 *       title: 'Lightning Fast',
 *       description: 'Deploy in seconds with our optimized pipeline'
 *     }
 *   ]}
 *   columns={3}
 *   layout="cards"
 * />
 * ```
 */
export function FeatureGrid({
  title,
  subtitle,
  features,
  columns = 3,
  layout = 'cards',
}: FeatureGridProps) {
  const gridCols = {
    2: 'repeat(auto-fit, minmax(300px, 1fr))',
    3: 'repeat(auto-fit, minmax(280px, 1fr))',
    4: 'repeat(auto-fit, minmax(240px, 1fr))',
  };

  return (
    <section className="feature-grid-section">
      <div className="container">
        {(title || subtitle) && (
          <div className="section-header">
            {title && <h2>{title}</h2>}
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
        )}

        <div className={`feature-grid layout-${layout}`}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              layout={layout}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .feature-grid-section {
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

        .subtitle {
          font-size: 18px;
          color: var(--gray-600);
        }

        .feature-grid {
          display: grid;
          grid-template-columns: ${gridCols[columns]};
          gap: 32px;
        }

        @media (max-width: 640px) {
          .feature-grid-section {
            padding: 60px 0;
          }

          .section-header {
            margin-bottom: 40px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}

// Individual Feature Card
function FeatureCard({
  icon,
  title,
  description,
  layout,
}: {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  layout: 'cards' | 'minimal' | 'centered';
}) {
  const isCards = layout === 'cards';
  const isCentered = layout === 'centered';

  return (
    <div className={`feature-card ${layout}`}>
      {icon && (
        <div className="feature-icon">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}

      <h3>{title}</h3>
      <p>{description}</p>

      <style jsx>{`
        .feature-card {
          transition: all 200ms ease-out;
        }

        .feature-card.cards {
          padding: 32px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
        }

        .feature-card.cards:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--primary-200);
        }

        .feature-card.minimal {
          padding: 0;
        }

        .feature-card.centered {
          text-align: center;
        }

        .feature-icon {
          font-size: 40px;
          margin-bottom: 16px;
          line-height: 1;
        }

        .feature-card.centered .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: var(--primary-50);
          border-radius: 12px;
          font-size: 32px;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--gray-900);
        }

        .feature-card p {
          font-size: 15px;
          color: var(--gray-600);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 640px) {
          .feature-card.cards {
            padding: 24px;
          }

          .feature-icon {
            font-size: 36px;
          }

          .feature-card h3 {
            font-size: 18px;
          }

          .feature-card p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
