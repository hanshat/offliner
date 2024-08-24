import { cn } from '@/lib/utils'
import { NavLink, Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Settings } from 'lucide-react'
import SettingsModal from './SettingsModal'

type Props = {
  className?: string
}

export default function Navbar({ className }: Props) {
  return (
    <nav className={cn('mb-10 p-3 bg-primary text-secondary', className)}>
      <div className="mx-auto max-w-[var(--max-app-w)] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/icons/icon-128.png"
            alt="logo"
            width={40}
            height={40}
          />
          <p className='hidden md:block'>Offliner</p>
        </Link>

        <div className="flex items-center gap-3">
          <NavLink
            to="/audio"
            className={({ isActive }) => (isActive ? 'border-b-2 border-secondary' : '')}
          >
            Music
          </NavLink>
          <NavLink
            to="/videos"
            className={({ isActive }) => (isActive ? 'border-b-2 border-secondary' : '')}
          >
            Videos
          </NavLink>

          <NavLink
            to="/playlists"
            className={({ isActive }) => (isActive ? 'border-b-2 border-secondary' : '')}
          >
            Playlists
          </NavLink>

          <SettingsModal>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </SettingsModal>
        </div>
      </div>
    </nav>
  )
}
