import type React from 'react'

// Admin modal forms (FacilityForm, BannerForm)
export const adminInputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 12px', borderRadius: 8,
  border: '1px solid var(--color-border-default)',
  background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)', outline: 'none', boxSizing: 'border-box',
}

export const adminLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)', marginBottom: 6,
}

// Public page forms (guide, help)
export const formInputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--color-border-default)',
  background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)',
  fontSize: 'var(--text-base)', outline: 'none',
}

export const formLabelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)',
}

// Admin data tables
export const tableCellStyle: React.CSSProperties = {
  padding: '14px 16px', fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border-subtle)', verticalAlign: 'middle',
}

export const tableHeadStyle: React.CSSProperties = {
  ...tableCellStyle,
  color: 'var(--color-text-secondary)',
  fontWeight: 'var(--font-weight-semibold)',
  fontSize: 'var(--text-xs)', textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-wider)', background: 'var(--color-bg-subtle)',
}

export const tableRowHoverHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.background = 'var(--color-bg-subtle)' },
  onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.background = 'transparent' },
}

// Login page input (taller, larger radius, base bg, transition)
export const loginInputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 14px', borderRadius: 10,
  border: '1px solid var(--color-border-default)',
  background: 'var(--color-bg-base)', color: 'var(--color-text-primary)',
  fontSize: 'var(--text-base)', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 150ms',
}

export function filterChipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 20,
    border: `1px solid ${active ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
    background: active ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface)',
    color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms', flexShrink: 0,
  }
}
