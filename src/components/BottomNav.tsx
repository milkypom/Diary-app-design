import type { Page } from '../lib/types'

interface Props {
  current: Page
  onChange: (page: Page) => void
  onNew: () => void
}

export default function BottomNav({ current, onChange, onNew }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 grid grid-cols-5 border-t border-[#f0ede8] bg-white/96 backdrop-blur-xl z-40">
      <NavBtn
        active={current === 'home'}
        onClick={() => onChange('home')}
        icon="⌂"
        label="Home"
        imageSrc={current === 'home' ? '/img/home_on.png' : '/img/home_off.png'}
      />
      <NavBtn
        active={current === 'search'}
        onClick={() => onChange('search')}
        icon="⌕"
        label="Search"
        imageSrc="/img/search.png"
      />

      {/* Compose button */}
      <button
        className="flex flex-col items-center justify-center gap-1"
        onClick={onNew}
        aria-label="Write new entry"
      >
        <span className="w-11 h-11 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-2xl leading-none shadow-md hover:bg-[#333] active:scale-95 transition-all">
          +
        </span>
      </button>

      <NavBtn
        active={current === 'my'}
        onClick={() => onChange('my')}
        icon="👤"
        label="My"
        imageSrc={current === 'my' ? '/img/my_on.png' : '/img/my_off.png'}
      />
      <NavBtn
        active={current === 'bookmark'}
        onClick={() => onChange('bookmark')}
        icon="🔖"
        label="Saved"
        activeColor
        imageSrc={current === 'bookmark' ? '/img/saved_on.png' : '/img/saved_off.png'}
      />
    </nav>
  )
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
  activeColor,
  imageSrc,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  activeColor?: boolean
  imageSrc?: string
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-1 transition-colors ${
        active
          ? activeColor
            ? 'text-[#1a1a1a]'
            : 'text-[#1a1a1a]'
          : 'text-[#ccc] hover:text-[#888]'
      }`}
      onClick={onClick}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={label} className="w-6 h-6 object-contain" />
      ) : (
        <span className="text-[20px] leading-none select-none">{icon}</span>
      )}
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  )
}
