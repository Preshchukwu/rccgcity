import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'RCCGCity — Redemption Camp Smart Companion',
  description: 'Find anything. Navigate anywhere. Get help instantly. All within Redemption City.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'RCCGCity' },
}

export const viewport: Viewport = {
  themeColor: '#003580',
  width: 'device-width',
  initialScale: 1,
}

// Blocking script — must run before body renders to prevent flash of wrong theme
const themeScript = `(function(){
  var s=localStorage.getItem('theme');
  var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(s==='dark'||(s===null&&d)){document.documentElement.classList.add('dark')}
})()`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
