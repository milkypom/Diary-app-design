import { useTheme } from '../contexts/ThemeContext'

export default function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex justify-center ${theme.bg} ${theme.textPrimary} font-mono transition-colors duration-200`}>
      <div className={`w-full max-w-[480px] min-h-screen relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${theme.cardBg} border-2 ${theme.border}`}>
        {children}
      </div>
    </div>
  )
}
