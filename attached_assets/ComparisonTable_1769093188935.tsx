'use client';

import React from 'react';

interface ComparisonFeature {
  feature: string;
  description?: string;
  values: (boolean | string)[];
}

interface ComparisonColumn {
  name: string;
  highlight?: boolean;
  badge?: string;
}

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  columns: ComparisonColumn[];
  features: ComparisonFeature[];
  showHeader?: boolean;
}

/**
 * ComparisonTable - Feature comparison matrix
 * 
 * Usage: 30% of SaaS sites show competitive comparisons.
 * Helps prospects understand your advantage vs. competitors or across tiers.
 * 
 * @param title - Table heading
 * @param subtitle - Supporting text
 * @param columns - Column headers (your product, competitors, or pricing tiers)
 * @param features - Array of features with values for each column
 * @param showHeader - Display title section
 */
export default function ComparisonTable({
  title = 'Feature Comparison',
  subtitle,
  columns,
  features,
  showHeader = true,
}: ComparisonTableProps) {
  return (
    <div className="comparison-table-section">
      {showHeader && (
        <div className="comparison-header">
          <h2>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="feature-column">Features</th>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={column.highlight ? 'highlighted-column' : ''}
                >
                  <div className="column-header">
                    {column.badge && (
                      <span className="column-badge">{column.badge}</span>
                    )}
                    <span className="column-name">{column.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="feature-cell">
                  <div className="feature-name">{row.feature}</div>
                  {row.description && (
                    <div className="feature-description">{row.description}</div>
                  )}
                </td>
                {row.values.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className={columns[colIndex].highlight ? 'highlighted-cell' : ''}
                  >
                    {typeof value === 'boolean' ? (
                      value ? (
                        <svg
                          className="check-icon"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="cross-icon"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M6 6l8 8M14 6l-8 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )
                    ) : (
                      <span className="value-text">{value}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .comparison-table-section {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .comparison-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .comparison-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--gray-900);
        }

        .subtitle {
          font-size: 1.25rem;
          color: var(--gray-600);
          max-width: 700px;
          margin: 0 auto;
        }

        .table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-size: 0.9375rem;
        }

        /* Table Header */
        thead {
          background: var(--gray-50);
        }

        th {
          padding: 20px 16px;
          text-align: left;
          font-weight: 600;
          color: var(--gray-900);
          border-bottom: 2px solid var(--gray-200);
          white-space: nowrap;
        }

        th.feature-column {
          width: 40%;
          min-width: 200px;
        }

        .highlighted-column {
          background: var(--primary-50);
          position: relative;
        }

        .highlighted-column::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary);
        }

        .column-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .column-badge {
          display: inline-block;
          padding: 2px 8px;
          background: var(--primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 4px;
          text-transform: uppercase;
          width: fit-content;
        }

        .column-name {
          font-size: 1rem;
          font-weight: 700;
        }

        /* Table Body */
        tbody tr {
          border-bottom: 1px solid var(--gray-200);
          transition: background-color 0.2s ease;
        }

        tbody tr:hover {
          background: var(--gray-50);
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        td {
          padding: 20px 16px;
          text-align: center;
          vertical-align: middle;
        }

        .feature-cell {
          text-align: left;
          font-weight: 500;
        }

        .feature-name {
          color: var(--gray-900);
          font-weight: 600;
          margin-bottom: 4px;
        }

        .feature-description {
          font-size: 0.875rem;
          color: var(--gray-600);
          line-height: 1.5;
        }

        .highlighted-cell {
          background: var(--primary-50);
        }

        /* Icons */
        .check-icon {
          color: var(--success, #10b981);
        }

        .cross-icon {
          color: var(--gray-400);
        }

        .value-text {
          color: var(--gray-700);
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .comparison-table-section {
            padding: 60px 16px;
          }

          .comparison-header h2 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1.125rem;
          }

          .table-wrapper {
            border-radius: 8px;
          }

          .comparison-table {
            font-size: 0.875rem;
          }

          th,
          td {
            padding: 12px 8px;
          }

          th.feature-column {
            min-width: 150px;
          }

          .column-name {
            font-size: 0.875rem;
          }

          .feature-name {
            font-size: 0.875rem;
          }

          .feature-description {
            font-size: 0.8125rem;
          }

          .check-icon,
          .cross-icon {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}
