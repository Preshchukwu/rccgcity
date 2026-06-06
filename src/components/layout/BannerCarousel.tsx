'use client'

import { useEffect, useRef, useState } from 'react'
import type { BannerCard } from '@/types'

export default function BannerCarousel({ banners }: { banners: BannerCard[] }) {
  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function scrollTo(index: number) {
    setActive(index)
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.offsetWidth * index
    }
  }

  function startTimer() {
    timerRef.current = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % banners.length
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.offsetWidth * next
        }
        return next
      })
    }, 4000)
  }

  useEffect(() => {
    if (banners.length > 1) startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [banners.length])

  if (!banners.length) return null

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          gap: 0,
          borderRadius: 16,
          overflow: 'hidden',
        }}
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        onMouseLeave={() => { if (banners.length > 1) startTimer() }}
      >
        {banners.map((banner, i) => (
          <a
            key={banner.id}
            href={banner.linkUrl ?? undefined}
            target={banner.linkUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minWidth: '100%',
              scrollSnapAlign: 'start',
              minHeight: 'clamp(200px, 25vw, 260px)',
              background: `linear-gradient(135deg, var(--color-brand) 0%, #1452bf 100%)`,
              padding: '20px 20px 24px',
              textDecoration: 'none',
              cursor: banner.linkUrl ? 'pointer' : 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
            aria-label={banner.title}
          >
            {/* Decorative circle */}
            <div aria-hidden="true" style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'rgba(255,255,255,0.7)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 6 }}>
              Redemption City
            </p>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: '#ffffff', lineHeight: 'var(--leading-tight)', margin: '0 0 4px' }}>
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                {banner.subtitle}
              </p>
            )}
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Banner ${i + 1}`}
              style={{
                width: i === active ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === active ? 'var(--color-brand)' : 'var(--color-border-default)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 200ms, background 200ms',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
