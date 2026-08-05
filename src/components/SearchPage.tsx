import { useState } from 'react'
import { searchMemos, advancedSearch, getAllTags, type SearchFilters, type SearchOptions } from '../lib/storage'
import type { Memo } from '../lib/types'

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
  onEdit: (memo: Memo) => void
  onRefresh: () => void
  onSelectMemo?: (id: number) => void
}

export default function SearchPage({ onEdit, onRefresh, onSelectMemo }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Memo[]>([])
  const [searched, setSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'modified'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [selectedWeather, setSelectedWeather] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  const allTags = getAllTags()

  const moodOptions: { value: string; label: string; icon: string }[] = [
    { value: '', label: 'All', icon: '😊' },
    { value: 'happy', label: 'Happy', icon: '😊' },
    { value: 'normal', label: 'Okay', icon: '😐' },
    { value: 'sad', label: 'Sad', icon: '😢' },
    { value: 'angry', label: 'Angry', icon: '😡' },
    { value: 'excited', label: 'Excited', icon: '🤩' },
    { value: 'tired', label: 'Tired', icon: '😴' },
    { value: 'anxious', label: 'Anxious', icon: '😰' },
    { value: 'grateful', label: 'Grateful', icon: '🙏' },
  ]

  const weatherOptions: { value: string; label: string; icon: string }[] = [
    { value: '', label: 'All', icon: '🌤️' },
    { value: 'sunny', label: 'Sunny', icon: '☀️' },
    { value: 'cloudy', label: 'Cloudy', icon: '☁️' },
    { value: 'rainy', label: 'Rainy', icon: '🌧️' },
    { value: 'snowy', label: 'Snowy', icon: '❄️' },
  ]

  const handleSearch = () => {
    const filters: SearchFilters = {
      keyword: query,
      tags: selectedTags,
      mood: selectedMood,
      weather: selectedWeather,
      dateFrom,
      dateTo,
      bookmarked: bookmarkedOnly,
    }

    const options: SearchOptions = {
      filters,
      sortBy,
      sortOrder,
    }

    if (query.trim() || selectedTags.length > 0 || selectedMood || selectedWeather || dateFrom || dateTo || bookmarkedOnly) {
      setResults(advancedSearch(options))
      setSearched(true)
    } else {
      setResults([])
      setSearched(false)
    }
  }

  const handleSimpleSearch = (val: string) => {
    setQuery(val)
    if (val.trim() && !showFilters) {
      setResults(searchMemos(val))
      setSearched(true)
    } else if (!val.trim() && !showFilters) {
      setResults([])
      setSearched(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedMood('')
    setSelectedWeather('')
    setDateFrom('')
    setDateTo('')
    setBookmarkedOnly(false)
    setQuery('')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="space-y-3">
      <div className="px-4 pt-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[15px] pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={e => handleSimpleSearch(e.target.value)}
            placeholder="Search by title, content, or tag…"
            className="w-full pl-10 pr-14 py-3 bg-white dark:bg-zinc-950 text-black dark:text-white text-[13px] outline-none border-2 border-black dark:border-white focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-mono uppercase"
            autoFocus
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white transition-colors text-[10px] font-black"
            aria-label="Toggle filters"
          >
            {showFilters ? '✕' : '⚙️'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mx-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 font-mono">
          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-zinc-500 mb-2 uppercase">// TAG_FILTER</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 border text-[10px] font-bold uppercase transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-black text-white border-black dark:border-white'
                        : 'bg-transparent text-zinc-600 border-zinc-400 hover:bg-black hover:text-white hover:border-black'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood */}
          <div>
            <p className="text-[10px] font-black text-zinc-500 mb-2 uppercase">// MOOD_FILTER</p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`px-3 py-1 border text-[10px] font-bold uppercase transition-all ${
                    selectedMood === option.value
                      ? 'bg-black text-white border-black dark:border-white'
                      : 'bg-transparent text-zinc-600 border-zinc-400 hover:bg-black hover:text-white hover:border-black'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div>
            <p className="text-[10px] font-black text-zinc-500 mb-2 uppercase">// WEATHER_FILTER</p>
            <div className="flex flex-wrap gap-2">
              {weatherOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedWeather(option.value)}
                  className={`px-3 py-1 border text-[10px] font-bold uppercase transition-all ${
                    selectedWeather === option.value
                      ? 'bg-black text-white border-black dark:border-white'
                      : 'bg-transparent text-zinc-600 border-zinc-400 hover:bg-black hover:text-white hover:border-black'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-[10px] font-black text-zinc-500 mb-2 uppercase">// DATE_RANGE</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent text-[12px] outline-none border border-zinc-500 focus:border-black dark:focus:border-white"
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent text-[12px] outline-none border border-zinc-500 focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Bookmark Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bookmarked"
              checked={bookmarkedOnly}
              onChange={e => setBookmarkedOnly(e.target.checked)}
              className="w-4 h-4 accent-[#1a1a1a]"
            />
            <label htmlFor="bookmarked" className="text-[11px] font-bold text-zinc-600 uppercase">
              BOOKMARKED_ONLY
            </label>
          </div>

          {/* Sort Options */}
          <div>
            <p className="text-[10px] font-black text-zinc-500 mb-2 uppercase">// SORT_ORDER</p>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'title' | 'modified')}
                className="flex-1 px-3 py-2 bg-transparent text-[12px] outline-none border border-zinc-500 focus:border-black dark:focus:border-white"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="modified">Last Modified</option>
              </select>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="flex-1 px-3 py-2 bg-transparent text-[12px] outline-none border border-zinc-500 focus:border-black dark:focus:border-white"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 bg-black text-white border-2 border-black text-[11px] font-black uppercase hover:bg-zinc-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-transparent text-black dark:text-white border-2 border-black dark:border-white text-[11px] font-black uppercase hover:bg-black hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {!searched && (
        <div className="mx-4 flex flex-col items-center py-14 gap-2 border-2 border-dashed border-zinc-400 text-center">
          <span className="text-5xl opacity-20">🔍</span>
          <p className="text-[14px] text-[#9a9a9a]">Search your diary entries</p>
          <p className="text-[12px] text-[#bbb]">Use ⚙️ for advanced filters</p>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="mx-4 flex flex-col items-center py-14 gap-2 border-2 border-dashed border-zinc-400 text-center">
          <span className="text-4xl opacity-30">📭</span>
          <p className="text-[14px] text-[#9a9a9a]">No results found</p>
          <button
            onClick={clearFilters}
            className="text-[13px] text-[#1a1a1a] font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {searched && results.length > 0 && (
        <div className="px-4 py-1">
          <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">[ {results.length} MATCH{results.length !== 1 ? 'ES' : ''}_FOUND ]</p>
        </div>
      )}

      {searched && results.length > 0 && (
        <div className="mx-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {results.map(memo => (
            <button
              key={memo.id}
              className="w-full text-left px-3 py-3 border-b last:border-b-0 border-black dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-3"
              onClick={() => onSelectMemo ? onSelectMemo(memo.id) : onEdit(memo)}
            >
              {memo.images?.[0] ? (
                <img
                  src={memo.images[0]}
                  alt=""
                  className="w-11 h-11 border border-black dark:border-white object-cover flex-shrink-0 grayscale"
                />
              ) : (
                <div className="w-11 h-11 border border-black dark:border-white bg-black text-white flex items-center justify-center flex-shrink-0 text-lg">
                  {memo.mood ? MOOD_ICON[memo.mood] : '📝'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-black text-black dark:text-white uppercase leading-snug truncate">
                  {memo.title || 'Untitled'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{memo.content}</p>
                <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">
                  {memo.date || memo.createdAt?.split('T')[0]}
                </p>
              </div>
              <span className="text-[#ddd] text-sm flex-shrink-0">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
