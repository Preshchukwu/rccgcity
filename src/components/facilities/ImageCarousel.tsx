'use client'

import { useState } from 'react'
import Image from 'next/image'
import FacilityInfoCard from './FacilityInfoCard'
import { getTransformedUrl } from '@/lib/cloudinary-url'
import type { FacilityCategory, FacilityStatus } from '@/types'

interface ImageCarouselProps {
  images: string[]
  name: string
  category: FacilityCategory
  status: FacilityStatus
}

export default function ImageCarousel({ images, name, category, status }: ImageCarouselProps) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return <FacilityInfoCard name={name} category={category} status={status} />
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ overflow: 'hidden', borderRadius: 12, aspectRatio: '16/9', background: 'var(--color-bg-subtle)' }}>
        <Image
          src={getTransformedUrl(images[active])}
          alt={`${name} — image ${active + 1}`}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {images.length > 1 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Image ${i + 1}`}
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
        </>
      )}
    </div>
  )
}
