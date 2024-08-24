import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'

export default function Layout() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Navbar className="px-4 md:px-0 min-h-16" />

      {/* empty div used for grid layout. do not remove */}
      <div>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>

      <Footer className="min-h-16" />
      <Toaster />
    </div>
  )
}
