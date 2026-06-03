import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-brand)',
    color: 'var(--color-text-on-brand)',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-bg-subtle)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-default)',
  },
  danger: {
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    border: '1px solid var(--color-danger)',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: 36, padding: '0 12px', fontSize: 'var(--text-sm)', borderRadius: 8 },
  md: { height: 44, padding: '0 20px', fontSize: 'var(--text-base)', borderRadius: 8 },
  lg: { height: 52, padding: '0 28px', fontSize: 'var(--text-lg)', borderRadius: 28 },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, style, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 'var(--font-weight-semibold)',
        cursor: 'pointer',
        transition: 'opacity 150ms, background 150ms',
        width: fullWidth ? '100%' : undefined,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
