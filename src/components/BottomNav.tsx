import type { Page } from '../lib/types'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  current: Page
  onChange: (page: Page) => void
  onNew: () => void
}

export default function BottomNav({ current, onChange, onNew }: Props) {
  const { theme } = useTheme()

  return (
    <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t-2 ${theme.border} ${theme.cardBg} px-2 py-1.5 shadow-[0px_-4px_12px_rgba(0,0,0,0.2)] flex items-center justify-around font-mono z-40`}>
      <NavBtn
        active={current === 'home'}
        onClick={() => onChange('home')}
        icon="FEED"
        label="FEED"
        theme={theme}
        iconSrc={current === 'home' ? '/img/home_on-w.png' : '/img/home_off-w.png'}
      />
      <NavBtn
        active={current === 'search'}
        onClick={() => onChange('search')}
        icon="SEARCH"
        label="SEARCH"
        theme={theme}
        iconSrc='/img/search-w.png'
      />

      {/* Compose button */}
      <button
        className="flex flex-col items-center justify-center -mt-6 bg-black text-white border-2 border-white p-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition"
        onClick={onNew}
        aria-label="Write new entry"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-[8px] font-black tracking-tight uppercase mt-0.5">WRITE</span>
      </button>

      <NavBtn
        active={current === 'my'}
        onClick={() => onChange('my')}
        icon="MY"
        label="MY"
        theme={theme}
        iconSrc={current === 'my' ? '/img/user_on-w.png' : '/img/user_off-w.png'}
      />
      <NavBtn
        active={current === 'bookmark'}
        onClick={() => onChange('bookmark')}
        icon="SAVED"
        label="SAVED"
        theme={theme}
        iconSrc={current === 'bookmark' ? '/img/bookmark_on-w.png' : '/img/bookmark_off-w.png'}
      />
    </nav>
  )
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
  theme,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  theme: any
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center p-1 transition text-[9px] font-bold tracking-tighter ${
        active
          ? 'text-black dark:text-white font-black underline underline-offset-4 decoration-2'
          : `${theme.textSecondary} hover:text-black dark:hover:text-white`
      }`}
      onClick={onClick}
    >
      <span className={`text-lg mb-0.5 ${active ? 'scale-110' : ''}`}>{icon[0]}</span>
      <span>{label}</span>
    </button>
  )
}
