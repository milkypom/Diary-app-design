import { useTheme } from '../contexts/ThemeContext'
import { THEMES } from '../lib/theme'

interface Props {
  onBack: () => void
}

export default function ThemePage({ onBack }: Props) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center transition-colors text-lg text-[#bbb] hover:text-[#555]"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-[20px] font-black tracking-widest uppercase text-[#1a1a1a]">[ THEME_SELECT ]</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.values(THEMES).map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t)}
            className={`p-4 border-2 transition-all font-black text-xs tracking-wider ${
              theme.id === t.id
                ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 hover:border-black dark:hover:border-white'
            }`}
          >
            <div className="font-bold mb-2">{t.name}</div>
            <div className="w-full h-3 rounded" style={{ background: t.gradient }} />
            {theme.id === t.id && (
              <div className="mt-2 text-[10px] font-bold">
                ✓ ACTIVE
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
        <h3 className="text-[12px] font-black tracking-wider uppercase mb-2">// THEME_PREVIEW</h3>
        <div className={`p-3 border ${theme.border} ${theme.cardBg} space-y-2`}>
          <div className={`w-full h-16 ${theme.bg} border ${theme.border}`} />
          <div className={`p-2 ${theme.chipBg} text-[10px] font-bold`}>
            Sample Text
          </div>
          <button className={`px-3 py-1 ${theme.accent} ${theme.accentText} text-[10px] font-bold`}>
            Sample Button
          </button>
        </div>
      </div>
    </div>
  )
}
