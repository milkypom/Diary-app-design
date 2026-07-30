import { useState } from 'react'
import { searchMemos } from '../lib/storage'
import type { Memo } from '../lib/types'
import PostCard from './PostCard'

interface Props {
  onEdit: (memo: Memo) => void
  onRefresh: () => void
}

export default function SearchPage({ onEdit, onRefresh }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Memo[]>([])
  const [searched, setSearched] = useState(false)

  const handleInput = (val: string) => {
    setQuery(val)
    if (val.trim()) {
      setResults(searchMemos(val))
      setSearched(true)
    } else {
      setResults([])
      setSearched(false)
    }
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
            onChange={e => handleInput(e.target.value)}
            placeholder="Search by title, content, or tag…"
            className="w-full pl-10 pr-4 py-3 bg-[#f5f1ee] rounded-xl text-[13px] outline-none border border-transparent focus:border-[#ddd] focus:bg-white transition-all"
            autoFocus
          />
        </div>
      </div>

      {!searched && (
        <div className="flex flex-col items-center py-16 gap-2">
          <span className="text-5xl opacity-20">🔍</span>
          <p className="text-[14px] text-[#9a9a9a]">Search your diary entries</p>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-2">
          <span className="text-4xl opacity-30">📭</span>
          <p className="text-[14px] text-[#9a9a9a]">No results for "{query}"</p>
        </div>
      )}

      {results.map(memo => (
        <PostCard
          key={memo.id}
          memo={memo}
          onEdit={onEdit}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
