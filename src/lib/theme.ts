export interface Theme {
  id: string
  name: string
  bg: string
  cardBg: string
  textPrimary: string
  textSecondary: string
  accent: string
  accentText: string
  accentHover: string
  border: string
  chipBg: string
  badgeBg: string
  gradient: string
}

export const THEMES: Record<string, Theme> = {
  silver: {
    id: 'silver',
    name: '00s Chrome Silver',
    bg: 'bg-[#EAEAEA]',
    cardBg: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#111111]',
    textSecondary: 'text-[#666666]',
    accent: 'bg-[#111111]',
    accentText: 'text-[#111111]',
    accentHover: 'hover:bg-[#333333]',
    border: 'border-[#111111]',
    chipBg: 'bg-[#F0F0F0]',
    badgeBg: 'bg-[#111111] text-white',
    gradient: 'from-[#FFFFFF] via-[#EAEAEA] to-[#D4D4D4]'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Pitch Black Mono',
    bg: 'bg-[#09090B]',
    cardBg: 'bg-[#121215]',
    textPrimary: 'text-[#FAFAFA]',
    textSecondary: 'text-[#A1A1AA]',
    accent: 'bg-[#FAFAFA]',
    accentText: 'text-[#FAFAFA]',
    accentHover: 'hover:bg-[#E4E4E7]',
    border: 'border-[#27272A]',
    chipBg: 'bg-[#18181B]',
    badgeBg: 'bg-[#FAFAFA] text-black',
    gradient: 'from-[#09090B] via-[#121215] to-[#18181B]'
  },
  dither: {
    id: 'dither',
    name: 'Pixel Dot Monochrome',
    bg: 'bg-[#F4F4F5]',
    cardBg: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#18181B]',
    textSecondary: 'text-[#71717A]',
    accent: 'bg-[#27272A]',
    accentText: 'text-[#27272A]',
    accentHover: 'hover:bg-[#3F3F46]',
    border: 'border-[#D4D4D8]',
    chipBg: 'bg-[#E4E4E7]',
    badgeBg: 'bg-[#27272A] text-white',
    gradient: 'from-[#F4F4F5] via-[#E4E4E7] to-[#D4D4D8]'
  },
  cyberMono: {
    id: 'cyberMono',
    name: 'High Contrast Mono',
    bg: 'bg-[#000000]',
    cardBg: 'bg-[#000000]',
    textPrimary: 'text-[#FFFFFF]',
    textSecondary: 'text-[#888888]',
    accent: 'bg-[#FFFFFF]',
    accentText: 'text-[#FFFFFF]',
    accentHover: 'hover:bg-[#DDDDDD]',
    border: 'border-[#FFFFFF]',
    chipBg: 'bg-[#111111]',
    badgeBg: 'bg-[#FFFFFF] text-black',
    gradient: 'from-[#000000] via-[#111111] to-[#222222]'
  }
}

export const PHOTO_FILTERS = [
  { id: 'monoHigh', name: 'High Contrast B&W', filterCss: 'grayscale(1) contrast(1.6) brightness(0.95)' },
  { id: 'silverGrain', name: 'Silver Grain', filterCss: 'grayscale(1) contrast(1.1) brightness(1.05) sepia(0.08)' },
  { id: 'ditherNoise', name: '2000s Dither Mono', filterCss: 'grayscale(1) contrast(1.4) brightness(0.9) blur(0.2px)' },
  { id: 'softMono', name: 'Soft Monochrome', filterCss: 'grayscale(1) contrast(0.85) brightness(1.1)' },
  { id: 'camcorder', name: 'Camcorder B&W', filterCss: 'grayscale(1) contrast(1.25) brightness(0.85)' },
  { id: 'none', name: 'Raw Monotone', filterCss: 'grayscale(1)' }
]

export const MOOD_OPTIONS = [
  { id: 'chill', emoji: '🖤', label: 'CHILL', color: 'bg-zinc-800 text-zinc-100' },
  { id: 'retro', emoji: '💿', label: 'RETRO', color: 'bg-zinc-200 text-zinc-900 border border-zinc-900' },
  { id: 'calm', emoji: '☕', label: 'CALM', color: 'bg-zinc-700 text-zinc-100' },
  { id: 'cyber', emoji: '💻', label: 'CYBER', color: 'bg-zinc-900 text-zinc-100' },
  { id: 'dreamy', emoji: '☁️', label: 'DREAMY', color: 'bg-zinc-100 text-zinc-900 border border-zinc-400' },
  { id: 'night', emoji: '🌙', label: 'NIGHT', color: 'bg-black text-white' }
]

export const WEATHER_OPTIONS = [
  { id: 'sunny', emoji: '☀️', label: 'CLEAR' },
  { id: 'cloudy', emoji: '☁️', label: 'CLOUDY' },
  { id: 'rainy', emoji: '🌧️', label: 'RAIN' },
  { id: 'snowy', emoji: '❄️', label: 'SNOW' },
  { id: 'windy', emoji: '🍃', label: 'WIND' }
]
