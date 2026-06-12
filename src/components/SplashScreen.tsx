'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SplashScreen() {
  const [logoVisible,        setLogoVisible]        = useState(false)
  const [nameVisible,        setNameVisible]        = useState(false)
  const [introOut,           setIntroOut]           = useState(false)
  const [hallelujahVisible,  setHallelujahVisible]  = useState(false)
  const [count,              setCount]              = useState(0)
  const [splashOut,          setSplashOut]          = useState(false)
  const [done,               setDone]               = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('nosplash') === '1') {
      setDone(true)
      return
    }

    // Phase 1 — logo fades in immediately
    const t0 = setTimeout(() => setLogoVisible(true), 80)

    // Phase 2 — name eases in at 2s
    const t1 = setTimeout(() => setNameVisible(true), 2000)

    // Phase 3 — intro fades out at 4s
    const t2 = setTimeout(() => setIntroOut(true), 4000)

    // Phase 4 — hallelujah screen fades in at 4.5s, counter starts
    const t3 = setTimeout(() => {
      setHallelujahVisible(true)

      let c = 0
      const interval = setInterval(() => {
        c += 1
        setCount(c)
        if (c >= 100) {
          clearInterval(interval)
          // Brief pause at 100 then exit
          setTimeout(() => {
            setSplashOut(true)
            setTimeout(() => setDone(true), 650)
          }, 400)
        }
      }, 30) // 30ms × 100 steps = 3 seconds
    }, 4500)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  if (done) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#ffffff',
        opacity: splashOut ? 0 : 1,
        transition: splashOut ? 'opacity 650ms ease' : 'none',
        pointerEvents: splashOut ? 'none' : 'all',
        overflow: 'hidden',
      }}
    >
      {/* ── Phase 1 & 2: Logo + Name ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: introOut ? 0 : 1,
          transition: 'opacity 500ms ease',
          pointerEvents: 'none',
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'scale(1)' : 'scale(0.92)',
            transition: 'opacity 700ms ease, transform 700ms ease',
          }}
        >
          <Image
            src="/icons/icon-192.png"
            alt="RCCGCity"
            width={100}
            height={100}
            priority
            style={{ display: 'block' }}
          />
        </div>

        {/* Name */}
        <div
          style={{
            marginTop: 20,
            opacity: nameVisible ? 1 : 0,
            transform: nameVisible ? 'translateY(0px)' : 'translateY(10px)',
            transition: 'opacity 700ms ease, transform 700ms ease',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-brand)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans, Inter, sans-serif)',
          }}
        >
          RCCGCity
        </div>
      </div>

      {/* ── Phase 4: Hallelujah screen ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: hallelujahVisible ? 1 : 0,
          transition: 'opacity 600ms ease',
          pointerEvents: 'none',
        }}
      >
        {/* Centered text + loading counter grouped together */}
        <div style={{ textAlign: 'center', padding: '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Loading counter — just above the text */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#b0b8c8',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              fontVariantNumeric: 'tabular-nums',
              marginBottom: 20,
            }}
          >
            Loading {count}%
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: '#555',
              marginBottom: 10,
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              lineHeight: 1.3,
            }}
          >
            Let somebody shout
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: 'var(--color-brand)',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              lineHeight: 1.05,
            }}
          >
            HALLELUYAH
          </div>
        </div>
      </div>
    </div>
  )
}
