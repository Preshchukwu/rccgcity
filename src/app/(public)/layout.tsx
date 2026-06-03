import PageShell from '@/components/layout/PageShell'
import { FacilityProvider } from '@/providers/FacilityProvider'
import GlobalFacilityDrawer from '@/components/facilities/GlobalFacilityDrawer'
import SplashScreen from '@/components/SplashScreen'
import { OfflineBanner } from '@/components/ui'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <FacilityProvider>
      <SplashScreen />
      <OfflineBanner />
      <PageShell>
        {children}
        <GlobalFacilityDrawer />
      </PageShell>
    </FacilityProvider>
  )
}
