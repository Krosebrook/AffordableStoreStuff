'use client';

import React, { useState } from 'react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
}

interface InteractiveDemoProps {
  title: string;
  subtitle?: string;
  steps: DemoStep[];
  ctaText?: string;
  ctaLink?: string;
  layout?: 'horizontal' | 'vertical' | 'carousel';
  autoplay?: boolean;
}

/**
 * InteractiveDemo - Product demo/tour component
 * 
 * Usage: Only 4% of SaaS sites use interactive demos despite 1.7x higher signup rates.
 * This component provides step-by-step product walkthroughs.
 * 
 * @param title - Main heading for the demo section
 * @param subtitle - Optional description text
 * @param steps - Array of demo steps with title, description, and media
 * @param ctaText - Call-to-action button text
 * @param ctaLink - CTA button destination
 * @param layout - Display style: horizontal (side-by-side), vertical (stacked), carousel (slideshow)
 * @param autoplay - Auto-advance through steps
 */
export default function InteractiveDemo({
  title,
  subtitle,
  steps,
  ctaText = 'Try it yourself',
  ctaLink = '#',
  layout = 'horizontal',
  autoplay = false,
}: InteractiveDemoProps) {
  const [activeStep, setActiveStep] = useState(0);

  React.useEffect(() => {
    if (autoplay && steps.length > 1) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, steps.length]);

  const currentStep = steps[activeStep];

  return (
    <div className="interactive-demo">
      <div className="demo-header">
        <h2>{title}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>

      <div className={`demo-content layout-${layout}`}>
        {/* Step Navigation */}
        <div className="step-nav">
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={`step-button ${index === activeStep ? 'active' : ''}`}
              onClick={() => setActiveStep(index)}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-title">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Active Step Display */}
        <div className="step-display">
          <div className="step-info">
            <h3>{currentStep.title}</h3>
            <p>{currentStep.description}</p>
          </div>

          <div className="step-media">
            {currentStep.videoUrl ? (
              <div className="video-container">
                <video
                  src={currentStep.videoUrl}
                  controls
                  poster={currentStep.image}
                  aria-label={`Demo video for ${currentStep.title}`}
                />
              </div>
            ) : currentStep.image ? (
              <img
                src={currentStep.image}
                alt={currentStep.title}
                loading="lazy"
              />
            ) : (
              <div className="placeholder">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="var(--gray-100)" rx="8" />
                  <path
                    d="M40 35L60 50L40 65V35Z"
                    fill="var(--primary)"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="progress-dots">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === activeStep ? 'active' : ''}`}
                onClick={() => setActiveStep(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {ctaText && (
        <div className="demo-cta">
          <a href={ctaLink} className="btn-primary">
            {ctaText}
          </a>
        </div>
      )}

      <style jsx>{`
        .interactive-demo {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .demo-header h2 {
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

        /* Horizontal Layout */
        .demo-content.layout-horizontal {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
        }

        /* Vertical Layout */
        .demo-content.layout-vertical {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .demo-content.layout-vertical .step-nav {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        /* Carousel Layout */
        .demo-content.layout-carousel {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .demo-content.layout-carousel .step-nav {
          display: none;
        }

        /* Step Navigation */
        .step-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .step-button {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .step-button:hover {
          border-color: var(--primary);
          background: var(--primary-50);
        }

        .step-button.active {
          border-color: var(--primary);
          background: var(--primary-50);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--gray-100);
          border-radius: 50%;
          font-weight: 600;
          color: var(--gray-700);
          flex-shrink: 0;
        }

        .step-button.active .step-number {
          background: var(--primary);
          color: white;
        }

        .step-title {
          font-weight: 600;
          color: var(--gray-900);
          font-size: 1rem;
        }

        /* Step Display */
        .step-display {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .step-info h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--gray-900);
        }

        .step-info p {
          font-size: 1.125rem;
          line-height: 1.7;
          color: var(--gray-600);
        }

        .step-media {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: var(--gray-100);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .step-media img,
        .video-container {
          width: 100%;
          display: block;
        }

        .video-container video {
          width: 100%;
          height: auto;
        }

        .placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: var(--gray-100);
        }

        /* Progress Dots */
        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--gray-300);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dot:hover {
          background: var(--gray-400);
        }

        .dot.active {
          width: 24px;
          border-radius: 5px;
          background: var(--primary);
        }

        /* CTA */
        .demo-cta {
          text-align: center;
          margin-top: 48px;
        }

        .btn-primary {
          display: inline-block;
          padding: 16px 32px;
          background: var(--primary);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .interactive-demo {
            padding: 60px 20px;
          }

          .demo-header h2 {
            font-size: 2rem;
          }

          .demo-content.layout-horizontal {
            grid-template-columns: 1fr;
          }

          .step-nav {
            order: 2;
          }

          .step-display {
            order: 1;
          }

          .demo-content.layout-vertical .step-nav {
            flex-direction: column;
          }

          .step-button {
            padding: 12px 16px;
          }

          .step-info h3 {
            font-size: 1.5rem;
          }

          .step-info p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
