// components/Button.tsx
// Production-ready button component with accessibility

'use client';

import Link from 'next/link';
import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: never;
  };

type ButtonAsLink = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  loading = false,
  className = '',
  href,
  ...props
}: ButtonProps) {
  const baseClasses = `btn btn-${variant} btn-${size} ${
    fullWidth ? 'btn-full-width' : ''
  } ${loading ? 'btn-loading' : ''} ${className}`;

  const content = (
    <>
      {loading && <span className="btn-spinner" />}
      {icon && iconPosition === 'left' && !loading && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      <span className={loading ? 'btn-text-hidden' : ''}>{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <>
        <Link
          href={href}
          className={baseClasses}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>

        <style jsx>{buttonStyles}</style>
      </>
    );
  }

  return (
    <>
      <button
        className={baseClasses}
        disabled={loading}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>

      <style jsx>{buttonStyles}</style>
    </>
  );
}

const buttonStyles = `
  /* Base styles */
  .btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 600;
    text-decoration: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 200ms ease-out;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn:focus-visible {
    outline: 2px solid var(--primary-500, #0EA5E9);
    outline-offset: 2px;
  }

  /* Sizes */
  .btn-sm {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
  }

  .btn-md {
    height: 44px;
    padding: 0 20px;
    font-size: 16px;
  }

  .btn-lg {
    height: 52px;
    padding: 0 28px;
    font-size: 16px;
  }

  .btn-xl {
    height: 60px;
    padding: 0 36px;
    font-size: 18px;
  }

  /* Variants */
  .btn-primary {
    background: var(--primary-500, #0EA5E9);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-600, #0284C7);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
    background: var(--primary-700, #0369A1);
  }

  .btn-secondary {
    background: var(--gray-100, #F5F5F5);
    color: var(--gray-900, #171717);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--gray-200, #E5E5E5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .btn-secondary:active:not(:disabled) {
    transform: translateY(0);
    background: var(--gray-300, #D4D4D4);
  }

  .btn-outline {
    background: transparent;
    border: 2px solid var(--gray-300, #D4D4D4);
    color: var(--gray-700, #404040);
  }

  .btn-outline:hover:not(:disabled) {
    background: var(--gray-50, #FAFAFA);
    border-color: var(--gray-400, #A3A3A3);
  }

  .btn-outline:active:not(:disabled) {
    background: var(--gray-100, #F5F5F5);
  }

  .btn-ghost {
    background: transparent;
    color: var(--gray-700, #404040);
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--gray-100, #F5F5F5);
  }

  .btn-ghost:active:not(:disabled) {
    background: var(--gray-200, #E5E5E5);
  }

  .btn-gradient {
    background: linear-gradient(
      90deg,
      var(--primary-500, #0EA5E9) 0%,
      var(--primary-600, #0284C7) 100%
    );
    color: white;
    border: none;
  }

  .btn-gradient:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
  }

  .btn-gradient:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Full width */
  .btn-full-width {
    width: 100%;
  }

  /* Icon positioning */
  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon-left {
    margin-right: -4px;
  }

  .btn-icon-right {
    margin-left: -4px;
  }

  /* Loading state */
  .btn-loading {
    cursor: wait;
  }

  .btn-text-hidden {
    opacity: 0;
  }

  .btn-spinner {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: btn-spin 0.6s linear infinite;
  }

  @keyframes btn-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Primary button
<Button variant="primary">Get Started</Button>

// Secondary with icon
<Button variant="secondary" icon={<ArrowRightIcon />}>
  Learn More
</Button>

// Outline as link
<Button variant="outline" href="/pricing">
  View Pricing
</Button>

// Loading state
<Button variant="primary" loading onClick={handleSubmit}>
  Creating account...
</Button>

// Full width on mobile
<Button variant="primary" fullWidth>
  Sign Up Free
</Button>

// Gradient variant
<Button variant="gradient" size="xl">
  Start Your Journey
</Button>
*/
