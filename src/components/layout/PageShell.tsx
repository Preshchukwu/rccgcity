import TopHeader from './TopHeader'
import BottomNav from './BottomNav'

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop top header — hidden on mobile via CSS */}
      <div className="hidden lg:block">
        <TopHeader />
      </div>

      {/* Main content */}
      <main
        style={{
          minHeight: '100dvh',
          paddingBottom: 'var(--nav-height-mobile)',
          maxWidth: 'var(--layout-max-width)',
          margin: '0 auto',
        }}
        className="lg:pb-0 lg:pt-[var(--nav-height-desktop)]"
      >
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop via CSS */}
      <div className="block lg:hidden">
        <BottomNav />
      </div>
    </>
  )
}
