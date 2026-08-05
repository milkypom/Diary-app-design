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
    <div>
      <div className="px-4 py-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] text-[15px] pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={e => handleSimpleSearch(e.target.value)}
            placeholder="Search by title, content, or tag…"
            className="w-full pl-10 pr-4 py-3 bg-[#f5f1ee] rounded-xl text-[13px] outline-none border border-transparent focus:border-[#ddd] focus:bg-white transition-all"
            autoFocus
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555] transition-colors text-sm"
            aria-label="Toggle filters"
          >
            {showFilters ? '✕' : '⚙️'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-[#f0ede8] space-y-4">
          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <p className="text-[12px] text-[#999] mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-[#1a1a1a] text-white'
                        : 'bg-[#faf9f7] text-[#666] hover:bg-[#f0ede8]'
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
            <p className="text-[12px] text-[#999] mb-2">Mood</p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`px-3 py-1 rounded-full text-[11px] transition-all ${
                    selectedMood === option.value
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-[#faf9f7] text-[#666] hover:bg-[#f0ede8]'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div>
            <p className="text-[12px] text-[#999] mb-2">Weather</p>
            <div className="flex flex-wrap gap-2">
              {weatherOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedWeather(option.value)}
                  className={`px-3 py-1 rounded-full text-[11px] transition-all ${
                    selectedWeather === option.value
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-[#faf9f7] text-[#666] hover:bg-[#f0ede8]'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-[12px] text-[#999] mb-2">Date Range</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#faf9f7] rounded-lg text-[12px] outline-none border border-[#e8e3dd] focus:border-[#bbb]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#faf9f7] rounded-lg text-[12px] outline-none border border-[#e8e3dd] focus:border-[#bbb]"
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
            <label htmlFor="bookmarked" className="text-[12px] text-[#666]">
              Bookmarked only
            </label>
          </div>

          {/* Sort Options */}
          <div>
            <p className="text-[12px] text-[#999] mb-2">Sort by</p>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'title' | 'modified')}
                className="flex-1 px-3 py-2 bg-[#faf9f7] rounded-lg text-[12px] outline-none border border-[#e8e3dd] focus:border-[#bbb]"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="modified">Last Modified</option>
              </select>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="flex-1 px-3 py-2 bg-[#faf9f7] rounded-lg text-[12px] outline-none border border-[#e8e3dd] focus:border-[#bbb]"
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
              className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-xl hover:bg-[#333] transition-colors"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#faf9f7] text-[#1a1a1a] text-[13px] font-medium rounded-xl hover:bg-[#f0ede8] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {!searched && (
        <div className="flex flex-col items-center py-16 gap-2">
          <span className="text-5xl opacity-20">🔍</span>
          <p className="text-[14px] text-[#9a9a9a]">Search your diary entries</p>
          <p className="text-[12px] text-[#bbb]">Use ⚙️ for advanced filters</p>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-2">
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
        <div className="px-4 py-2">
          <p className="text-[12px] text-[#999]">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
        </div>
      )}

      {searched && results.length > 0 && (
        <div className="border-t border-[#f0ede8]">
          {results.map(memo => (
            <button
              key={memo.id}
              className="w-full text-left px-5 py-3.5 border-b border-[#f0ede8] hover:bg-[#faf9f7] transition-colors flex items-center gap-3"
              onClick={() => onSelectMemo ? onSelectMemo(memo.id) : onEdit(memo)}
            >
              {memo.images?.[0] ? (
                <img
                  src={memo.images[0]}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#f5f0eb] flex items-center justify-center flex-shrink-0 text-lg">
                  {memo.mood ? MOOD_ICON[memo.mood] : '📝'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="italic text-[14px] font-semibold text-[#1a1a1a] leading-snug truncate">
                  {memo.title || 'Untitled'}
                </p>
                <p className="text-[12px] text-[#9a9a9a] mt-0.5 truncate">{memo.content}</p>
                <p className="text-[11px] text-[#bbb] mt-1">
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
