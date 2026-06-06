import TopHeader from './TopHeader'
import BottomNav from './BottomNav'
import MobileTopBar from './MobileTopBar'

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile top bar — hidden on desktop */}
      <div className="block lg:hidden">
        <MobileTopBar />
      </div>

      {/* Desktop top header — hidden on mobile */}
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
        className="pt-[var(--nav-height-mobile-top)] lg:pt-[var(--nav-height-desktop)] lg:pb-0"
      >
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="block lg:hidden">
        <BottomNav />
      </div>
    </>
  )
}
