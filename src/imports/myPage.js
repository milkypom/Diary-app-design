import { useState, useEffect } from 'react'
import { getMemos, getProfile } from '../lib/storage'
import type { Memo } from '../lib/types'
import ProfileEditModal from './ProfileEditModal'

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
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [memos, setMemos] = useState<Memo[]>([])
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [profile, setProfile] = useState(getProfile())
  const [showProfileEdit, setShowProfileEdit] = useState(false)

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
      setCalYear(y => y - 1)
      setCalMonth(11)
    } else {
      setCalMonth(m => m - 1)
    }
  }
  const nextMonth = () => {
    setSelectedDate(null)
    if (calMonth === 11) {
      setCalYear(y => y + 1)
      setCalMonth(0)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  const selectedMemos = selectedDate ? (memosByDate.get(selectedDate) || []) : []

  return (
    <div>
      {/* Profile header */}
      <div className="flex items-center justify-between px-5 py-5">
        <button 
          onClick={() => setShowProfileEdit(true)}
          className="flex items-center gap-3 flex-1"
        >
          <div 
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center text-2xl shadow-sm`}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.avatarEmoji
            )}
          </div>
          <div className="text-left">
            <p className="font-semibold text-[15px] text-[#1a1a1a]">{profile.name}</p>
            <p className="text-[11px] text-[#9a9a9a]">{profile.bio}</p>
          </div>
        </button>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 flex items-center justify-center text-[#bbb] hover:text-[#555] transition-colors text-lg">
            ⚙️
          </button>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-[18px] font-bold text-[#1a1a1a] leading-none">{memos.length}</p>
              <p className="text-[10px] text-[#9a9a9a] mt-1">Entries</p>
            </div>
            <div>
              <p className="text-[18px] font-bold text-[#1a1a1a] leading-none">
                {totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
              </p>
              <p className="text-[10px] text-[#9a9a9a] mt-1">Chars</p>
            </div>
            <div>
              <p className="text-[18px] font-bold text-[#1a1a1a] leading-none">{tagCount}</p>
              <p className="text-[10px] text-[#9a9a9a] mt-1">Tags</p>
            </div>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex border-b border-[#f0ede8]">
        {(['grid', 'calendar'] as const).map(v => (
          <button
            key={v}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-all border-b-2 capitalize ${
              view === v
                ? 'border-[#1a1a1a] text-[#1a1a1a]'
                : 'border-transparent text-[#bbb] hover:text-[#777]'
            }`}
            onClick={() => setView(v)}
          >
            {v === 'grid' ? 'Grid' : 'Calendar'}
          </button>
        ))}
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {memos.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center py-16 gap-2">
              <span className="text-4xl opacity-20">📝</span>
              <p className="text-[14px] text-[#9a9a9a]">No entries yet</p>
            </div>
          ) : (
            memos.map(memo => (
              <button
                key={memo.id}
                className="aspect-square bg-[#f5f0eb] overflow-hidden relative hover:opacity-90 active:opacity-75 transition-opacity"
                onClick={() => onSelectMemo(memo.id)}
              >
                {memo.images?.[0] ? (
                  <img
                    src={memo.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 bg-gradient-to-br from-[#fdf4f0] to-[#f0e8de]">
                    {memo.mood ? (
                      <span className="text-[22px]">{MOOD_ICON[memo.mood]}</span>
                    ) : (
                      <span className="text-[22px] opacity-30">📝</span>
                    )}
                    <p className="text-[10px] text-[#999] text-center leading-tight line-clamp-2 px-1">
                      {memo.title || 'Entry'}
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
              className="w-9 h-9 rounded-full border border-[#eee] flex items-center justify-center text-[#777] hover:bg-[#f5f0eb] transition-colors text-lg"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <p className="font-semibold text-[15px] text-[#1a1a1a]">
              {calYear} ·{' '}
              {new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long' })}
            </p>
            <button
              className="w-9 h-9 rounded-full border border-[#eee] flex items-center justify-center text-[#777] hover:bg-[#f5f0eb] transition-colors text-lg"
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
                className="text-center text-[10px] text-[#bbb] py-1 font-medium"
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
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative text-[12px] font-medium transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white'
                      : isToday
                      ? 'bg-[#f5f0eb] text-[#1a1a1a] font-bold'
                      : dayMemos.length > 0
                      ? 'hover:bg-[#fdf4f0] text-[#1a1a1a]'
                      : 'text-[#9a9a9a] hover:bg-[#faf9f7]'
                  }`}
                  onClick={() =>
                    setSelectedDate(prev => (prev === dateStr ? null : dateStr))
                  }
                >
                  {day}
                  {dayMemos.length > 0 && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white/70' : 'bg-[#c87941]'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected date entries */}
          {selectedDate && (
            <div className="border-t border-[#f0ede8]">
              <p className="px-5 py-3 text-[11px] font-bold tracking-widest text-[#bbb] uppercase">
                {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {selectedMemos.length === 0 ? (
                <p className="text-center py-6 text-[13px] text-[#9a9a9a]">
                  No entries on this day
                </p>
              ) : (
                selectedMemos.map(m => (
                  <button
                    key={m.id}
                    className="w-full text-left px-5 py-3.5 border-b border-[#f0ede8] hover:bg-[#faf9f7] transition-colors flex items-center gap-3"
                    onClick={() => onSelectMemo(m.id)}
                  >
                    {m.images?.[0] ? (
                      <img
                        src={m.images[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#f5f0eb] flex items-center justify-center flex-shrink-0 text-lg">
                        {m.mood ? MOOD_ICON[m.mood] : '📝'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="italic text-[14px] font-semibold text-[#1a1a1a] leading-snug truncate">
                        {m.title || 'Untitled'}
                      </p>
                      <p className="text-[12px] text-[#9a9a9a] mt-0.5 truncate">{m.content}</p>
                    </div>
                    <span className="text-[#ddd] text-sm flex-shrink-0">›</span>
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
    </div>
  )
}
