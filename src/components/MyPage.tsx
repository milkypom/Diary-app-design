import { useState, useEffect } from 'react'
import { getMemos, getProfile } from '../lib/storage'
import type { Memo } from '../lib/types'
import ProfileEditModal from './ProfileEditModal.tsx'
import { useTheme } from '../contexts/ThemeContext'

const MOOD_ICON: Record<string, string> = {
  happy: '😊',
  normal: '😐',
  sad: '😢',
  angry: '😡',
  excited: '🤩',
  tired: '😴',
  anxious: '😰',
  grateful: '🙏',
}

interface Props {
  refreshKey: number
  onEdit: (memo: Memo) => void
  onSelectMemo: (id: number) => void
}

export default function MyPage({ refreshKey, onEdit, onSelectMemo }: Props) {
  const { theme } = useTheme()
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [memos, setMemos] = useState<Memo[]>([])
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [profile, setProfile] = useState(getProfile())
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [yearInput, setYearInput] = useState(calYear.toString())

  useEffect(() => {
    const all = getMemos()
      .filter(m => !m.deleted)
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt).getTime() -
          new Date(a.date || a.createdAt).getTime()
      )
    setMemos(all)
    setProfile(getProfile())
  }, [refreshKey])

  useEffect(() => {
    setYearInput(calYear.toString())
  }, [calYear])

  const totalWords = memos.reduce((acc, m) => acc + (m.content?.length || 0), 0)
  const tagCount = new Set(memos.flatMap(m => m.tags || [])).size

  // Calendar
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const memosByDate = new Map<string, Memo[]>()
  memos.forEach(m => {
    const d = m.date || m.createdAt?.split('T')[0]
    if (d) {
      if (!memosByDate.has(d)) memosByDate.set(d, [])
      memosByDate.get(d)!.push(m)
    }
  })

  const prevMonth = () => {
    setSelectedDate(null)
    if (calMonth === 0) {
      setCalYear(y => {
        setYearInput((y - 1).toString())
        return y - 1
      })
      setCalMonth(11)
    } else {
      setCalMonth(m => m - 1)
    }
  }
  const nextMonth = () => {
    setSelectedDate(null)
    if (calMonth === 11) {
      setCalYear(y => {
        setYearInput((y + 1).toString())
        return y + 1
      })
      setCalMonth(0)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  const selectedMemos = selectedDate ? (memosByDate.get(selectedDate) || []) : []

  return (
    <div>
      {/* Profile header */}
      <div className={`flex items-center justify-between px-5 py-5 border-b-2 ${theme.border}`}>
        <button
          onClick={() => setShowProfileEdit(true)}
          className="flex items-center gap-3 flex-1"
        >
          <div
            className={`w-14 h-14 border-2 border-black dark:border-white ${theme.cardBg} flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.avatarEmoji
            )}
          </div>
          <div className="text-left">
            <p className={`font-black text-[15px] ${theme.textPrimary} uppercase tracking-wider`}>{profile.name}</p>
            <p className={`text-[11px] font-bold ${theme.textSecondary}`}>{profile.bio}</p>
          </div>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className={`text-[18px] font-black ${theme.textPrimary} leading-none`}>{memos.length}</p>
              <p className={`text-[10px] font-bold ${theme.textSecondary} mt-1 uppercase`}>LOGS</p>
            </div>
            <div>
              <p className={`text-[18px] font-black ${theme.textPrimary} leading-none`}>
                {totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
              </p>
              <p className={`text-[10px] font-bold ${theme.textSecondary} mt-1 uppercase`}>CHARS</p>
            </div>
            <div>
              <p className={`text-[18px] font-black ${theme.textPrimary} leading-none`}>{tagCount}</p>
              <p className={`text-[10px] font-bold ${theme.textSecondary} mt-1 uppercase`}>TAGS</p>
            </div>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className={`flex border-b-2 ${theme.border}`}>
        {(['grid', 'calendar'] as const).map(v => (
          <button
            key={v}
            className={`flex-1 py-2.5 text-[13px] font-black transition-all border-b-2 capitalize tracking-wider ${
              view === v
                ? `border-black dark:border-white ${theme.textPrimary}`
                : `border-transparent ${theme.textSecondary} hover:text-black dark:hover:text-white`
            }`}
            onClick={() => setView(v)}
          >
            {v === 'grid' ? '[ GRID ]' : '[ CALENDAR ]'}
          </button>
        ))}
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {memos.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center py-16 gap-2">
              <span className="text-4xl opacity-20">📝</span>
              <p className={`text-[14px] font-bold ${theme.textSecondary}`}>[ NO_LOGS_YET ]</p>
            </div>
          ) : (
            memos.map(memo => (
              <button
                key={memo.id}
                className={`aspect-square ${theme.bg} border border-black dark:border-white overflow-hidden relative hover:opacity-90 active:opacity-75 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                onClick={() => onSelectMemo(memo.id)}
              >
                {memo.images?.[0] ? (
                  <img
                    src={memo.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 bg-zinc-900 text-zinc-300">
                    {memo.mood ? (
                      <span className="text-[22px]">{MOOD_ICON[memo.mood]}</span>
                    ) : (
                      <span className="text-[22px] opacity-30">📝</span>
                    )}
                    <p className="text-[10px] text-zinc-400 text-center leading-tight line-clamp-2 px-1 font-bold uppercase">
                      {memo.title || 'LOG'}
                    </p>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <div>
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4">
            <button
              className={`w-9 h-9 border-2 ${theme.border} ${theme.chipBg} flex items-center justify-center ${theme.textSecondary} hover:bg-black hover:text-white transition-colors text-lg font-black`}
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="flex items-center gap-1">
              <button
                className={`font-black text-[15px] ${theme.textPrimary} hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider`}
                onClick={() => {
                  setYearInput(calYear.toString())
                  setShowYearPicker(true)
                }}
              >
                {calYear}
              </button>
              <span className={theme.textSecondary}>·</span>
              <button
                className={`font-black text-[15px] ${theme.textPrimary} hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider`}
                onClick={() => setShowMonthPicker(true)}
              >
                {new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long' })}
              </button>
            </div>
            <button
              className={`w-9 h-9 border-2 ${theme.border} ${theme.chipBg} flex items-center justify-center ${theme.textSecondary} hover:bg-black hover:text-white transition-colors text-lg font-black`}
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 px-3">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div
                key={d}
                className={`text-center text-[10px] ${theme.textSecondary} py-1 font-black uppercase`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {Array(firstDayOfWeek)
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayMemos = memosByDate.get(dateStr) || []
              const isSelected = selectedDate === dateStr
              const isToday = dateStr === todayStr

              return (
                <button
                  key={day}
                  className={`aspect-square border-2 ${theme.border} flex flex-col items-center justify-center relative text-[12px] font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : isToday
                      ? `${theme.chipBg} ${theme.textPrimary}`
                      : dayMemos.length > 0
                      ? `${theme.bg} ${theme.textPrimary} hover:bg-black hover:text-white`
                      : `${theme.textSecondary} hover:bg-black hover:text-white`
                  }`}
                  onClick={() =>
                    setSelectedDate(prev => (prev === dateStr ? null : dateStr))
                  }
                >
                  {day}
                  {dayMemos.length > 0 && (
                    <span
                      className={`absolute bottom-1 right-1 text-[10px] font-bold ${
                        isSelected ? 'text-white/90 dark:text-black/90' : theme.textPrimary
                      }`}
                    >
                      +{dayMemos.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected date entries */}
          {selectedDate && (
            <div className={`border-t-2 ${theme.border}`}>
              <p className={`px-5 py-3 text-[11px] font-black tracking-widest ${theme.textSecondary} uppercase`}>
                [ {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })} ]
              </p>
              {selectedMemos.length === 0 ? (
                <p className={`text-center py-6 text-[13px] font-bold ${theme.textSecondary}`}>
                  [ NO_LOGS_ON_THIS_DAY ]
                </p>
              ) : (
                selectedMemos.map(m => (
                  <button
                    key={m.id}
                    className={`w-full text-left px-5 py-3.5 border-b-2 ${theme.border} ${theme.bg} hover:bg-black hover:text-white transition-colors flex items-center gap-3`}
                    onClick={() => onSelectMemo(m.id)}
                  >
                    {m.images?.[0] ? (
                      <img
                        src={m.images[0]}
                        alt=""
                        className="w-10 h-10 border-2 border-black dark:border-white object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-10 h-10 border-2 ${theme.border} ${theme.chipBg} flex items-center justify-center flex-shrink-0 text-lg`}>
                        {m.mood ? MOOD_ICON[m.mood] : '📝'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`font-black text-[14px] ${theme.textPrimary} leading-snug truncate uppercase`}>
                        {m.title || 'UNTITLED'}
                      </p>
                      <p className={`text-[12px] ${theme.textSecondary} mt-0.5 truncate`}>{m.content}</p>
                    </div>
                    <span className={`${theme.textSecondary} text-sm flex-shrink-0`}>›</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Profile edit modal */}
      {showProfileEdit && (
        <ProfileEditModal
          profile={profile}
          onSave={() => {
            setShowProfileEdit(false)
            setProfile(getProfile())
          }}
          onClose={() => setShowProfileEdit(false)}
        />
      )}

      {/* Month picker modal */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setShowMonthPicker(false)}
          />
          <div className={`relative w-full max-w-sm ${theme.cardBg} border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
            <h3 className={`text-[18px] font-black tracking-widest uppercase ${theme.textPrimary} mb-4`}>[ SELECT_MONTH ]</h3>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i).map(month => {
                const isSelected = month === calMonth
                return (
                  <button
                    key={month}
                    onClick={() => {
                      setCalMonth(month)
                      setShowMonthPicker(false)
                    }}
                    className={`py-3 px-4 border-2 text-[13px] font-black transition-all uppercase ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : `${theme.chipBg} ${theme.textPrimary} border-zinc-700 hover:bg-black hover:text-white hover:border-white`
                    }`}
                  >
                    {new Date(calYear, month).toLocaleString('en-US', { month: 'short' })}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Year picker modal */}
      {showYearPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setShowYearPicker(false)}
          />
          <div className={`relative w-full max-w-sm ${theme.cardBg} border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
            <h3 className={`text-[18px] font-black tracking-widest uppercase ${theme.textPrimary} mb-4`}>[ SELECT_YEAR ]</h3>
            <input
              type="number"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-full px-4 py-3 border-2 border-zinc-700 bg-zinc-900 text-white text-[15px] outline-none focus:border-white uppercase font-mono mb-4"
              placeholder="ENTER_YEAR"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowYearPicker(false)}
                className={`flex-1 px-4 py-3 border-2 ${theme.border} ${theme.chipBg} ${theme.textPrimary} text-[14px] font-black rounded-xl hover:bg-black hover:text-white transition-colors uppercase`}
              >
                [ CANCEL ]
              </button>
              <button
                onClick={() => {
                  const year = parseInt(yearInput)
                  if (year && year > 1900 && year < 2100) {
                    setCalYear(year)
                    setShowYearPicker(false)
                  }
                }}
                className="flex-1 px-4 py-3 bg-black text-white border-2 border-black text-[14px] font-black rounded-xl hover:bg-zinc-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
              >
                [ CONFIRM ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
