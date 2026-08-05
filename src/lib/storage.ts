import type { Memo, EditorData, Comment, Mood, Weather } from './types'

const KEY = 'daylog_memos'
const PROFILE_KEY = 'daylog_profile'
const SETTINGS_KEY = 'daylog_settings'

export interface Profile {
  name: string
  bio: string
  avatar: string
  avatarEmoji: string
  avatarColor: string
}

export function getProfile(): Profile {
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    return data ? JSON.parse(data) : {
      name: 'My Diary',
      bio: 'Personal journal',
      avatar: '',
      avatarEmoji: '🌿',
      avatarColor: 'from-[#f5e6d8] to-[#e8c4a2]'
    }
  } catch {
    return {
      name: 'My Diary',
      bio: 'Personal journal',
      avatar: '',
      avatarEmoji: '🌿',
      avatarColor: 'from-[#f5e6d8] to-[#e8c4a2]'
    }
  }
}

export function saveProfile(profile: Profile): boolean {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    return true
  } catch {
    return false
  }
}

export function getMemos(): Memo[] {
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveMemos(memos: Memo[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(memos))
    return true
  } catch (e: unknown) {
    const err = e as { name?: string; code?: number }
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      alert('Storage is full. Please delete some entries or reduce image sizes.')
    } else {
      alert('Failed to save. Please try again.')
    }
    return false
  }
}

export function getMemo(id: number): Memo | null {
  return getMemos().find(m => m.id === id) ?? null
}

export function addMemo(data: EditorData): Memo {
  const memos = getMemos()
  const memo: Memo = {
    id: Date.now(),
    title: data.title || '',
    content: data.content || '',
    date: data.date || new Date().toISOString().split('T')[0],
    tags: data.tags || [],
    location: data.location || '',
    images: data.images || [],
    weather: data.weather || '',
    mood: data.mood || '',
    bookmark: false,
    deleted: false,
    createdAt: new Date().toISOString(),
  }
  memos.unshift(memo)
  saveMemos(memos)
  return memo
}

export function updateMemo(id: number, data: EditorData): boolean {
  const memos = getMemos()
  const idx = memos.findIndex(m => m.id === id)
  if (idx === -1) return false
  memos[idx] = {
    ...memos[idx],
    title: data.title || '',
    content: data.content || '',
    date: data.date || memos[idx].date,
    tags: data.tags || [],
    location: data.location || '',
    images: data.images || [],
    weather: data.weather || '',
    mood: data.mood || '',
    updatedAt: new Date().toISOString(),
  }
  saveMemos(memos)
  return true
}

export function deleteMemo(id: number): boolean {
  const memos = getMemos()
  const memo = memos.find(m => m.id === id)
  if (!memo) return false
  memo.deleted = true
  memo.deletedAt = new Date().toISOString()
  return saveMemos(memos)
}

export function restoreMemo(id: number): boolean {
  const memos = getMemos()
  const memo = memos.find(m => m.id === id)
  if (!memo) return false
  memo.deleted = false
  delete memo.deletedAt
  return saveMemos(memos)
}

export function getDeletedMemos(): Memo[] {
  return getMemos().filter(m => m.deleted)
}

export function permanentDeleteMemo(id: number): boolean {
  const memos = getMemos()
  const idx = memos.findIndex(m => m.id === id)
  if (idx === -1) return false
  memos.splice(idx, 1)
  return saveMemos(memos)
}

export function emptyTrash(): boolean {
  const memos = getMemos().filter(m => !m.deleted)
  return saveMemos(memos)
}

export function toggleBookmark(id: number): boolean {
  const memos = getMemos()
  const memo = memos.find(m => m.id === id)
  if (!memo) return false
  memo.bookmark = !memo.bookmark
  saveMemos(memos)
  return memo.bookmark
}

export function searchMemos(keyword: string): Memo[] {
  if (!keyword.trim()) return []
  const lower = keyword.toLowerCase()
  return getMemos().filter(m => {
    if (m.deleted) return false
    return (
      m.title?.toLowerCase().includes(lower) ||
      m.content?.toLowerCase().includes(lower) ||
      m.tags?.some(t => t.toLowerCase().includes(lower))
    )
  })
}

export interface SearchFilters {
  keyword: string
  tags: string[]
  mood: Mood | ''
  weather: Weather | ''
  dateFrom: string
  dateTo: string
  bookmarked: boolean
}

export interface SearchOptions {
  filters: SearchFilters
  sortBy: 'date' | 'title' | 'modified'
  sortOrder: 'asc' | 'desc'
}

export function advancedSearch(options: SearchOptions): Memo[] {
  const { filters, sortBy, sortOrder } = options
  let results = getMemos().filter(m => {
    if (m.deleted) return false

    // Keyword search
    if (filters.keyword.trim()) {
      const lower = filters.keyword.toLowerCase()
      const matchesKeyword =
        m.title?.toLowerCase().includes(lower) ||
        m.content?.toLowerCase().includes(lower) ||
        m.tags?.some(t => t.toLowerCase().includes(lower))
      if (!matchesKeyword) return false
    }

    // Tag filter
    if (filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => m.tags?.includes(tag))
      if (!hasTag) return false
    }

    // Mood filter
    if (filters.mood && m.mood !== filters.mood) {
      return false
    }

    // Weather filter
    if (filters.weather && m.weather !== filters.weather) {
      return false
    }

    // Date range filter
    if (filters.dateFrom) {
      const memoDate = new Date(m.date || m.createdAt?.split('T')[0] || '')
      const fromDate = new Date(filters.dateFrom)
      if (memoDate < fromDate) return false
    }

    if (filters.dateTo) {
      const memoDate = new Date(m.date || m.createdAt?.split('T')[0] || '')
      const toDate = new Date(filters.dateTo)
      if (memoDate > toDate) return false
    }

    // Bookmark filter
    if (filters.bookmarked && !m.bookmark) {
      return false
    }

    return true
  })

  // Sort results
  results.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date || a.createdAt || '').getTime() - new Date(b.date || b.createdAt || '').getTime()
        break
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '')
        break
      case 'modified':
        comparison = new Date(a.updatedAt || a.createdAt || '').getTime() - new Date(b.updatedAt || b.createdAt || '').getTime()
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return results
}

export function getAllTags(): string[] {
  const memos = getMemos()
  const tags = new Set<string>()
  memos.forEach(m => {
    if (m.tags) {
      m.tags.forEach(t => {
        if (t) tags.add(t)
      })
    }
  })
  return Array.from(tags).sort()
}

export function renameTag(oldTag: string, newTag: string): boolean {
  if (!oldTag.trim() || !newTag.trim()) return false
  const cleanOldTag = oldTag.trim()
  const cleanNewTag = newTag.trim()
  if (cleanOldTag === cleanNewTag) return false

  const memos = getMemos()
  let changed = false
  memos.forEach(memo => {
    if (memo.tags && memo.tags.includes(cleanOldTag)) {
      memo.tags = memo.tags.map(t => t === cleanOldTag ? cleanNewTag : t)
      changed = true
    }
  })
  if (changed) {
    saveMemos(memos)
  }
  return changed
}

export function deleteTag(tag: string): boolean {
  if (!tag.trim()) return false
  const cleanTag = tag.trim()
  const memos = getMemos()
  let changed = false
  memos.forEach(memo => {
    if (memo.tags && memo.tags.includes(cleanTag)) {
      memo.tags = memo.tags.filter(t => t !== cleanTag)
      changed = true
    }
  })
  if (changed) {
    saveMemos(memos)
  }
  return changed
}

export function initSampleData(): void {
  if (getMemos().length > 0) return
  const now = Date.now()
  const samples: Memo[] = [
    {
      id: now,
      title: 'Morning coffee at the corner café',
      content:
        "Found this quiet little spot near the station. The espresso was perfect — not too bitter, with a hint of chocolate. The kind of place you want to keep all to yourself.",
      date: new Date().toISOString().split('T')[0],
      tags: ['café', 'morning', 'daily'],
      location: 'Corner Café, Seongsu-dong',
      images: [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop&auto=format',
      ],
      bookmark: true,
      deleted: false,
      createdAt: new Date().toISOString(),
      weather: 'sunny',
      mood: 'happy',
    },
    {
      id: now + 1,
      title: 'Evening riverside ride',
      content:
        "Cool breeze off the water, city lights just starting to come on. There's something meditative about cycling along the Han River at dusk. All the stress just falls away.",
      date: new Date(now - 86400000).toISOString().split('T')[0],
      tags: ['cycling', 'hanriver', 'evening'],
      location: 'Ttukseom Hangang Park',
      images: [
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=600&fit=crop&auto=format',
      ],
      bookmark: false,
      deleted: false,
      createdAt: new Date(now - 86400000).toISOString(),
      weather: 'cloudy',
      mood: 'grateful',
    },
    {
      id: now + 2,
      title: 'Rainy afternoon with a good book',
      content:
        "Rain against the window, chamomile tea, Murakami open on my lap. Sometimes the best days are the ones where nothing happens but everything feels right.",
      date: new Date(now - 172800000).toISOString().split('T')[0],
      tags: ['reading', 'cozy', 'rainy'],
      location: 'Home',
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&auto=format',
      ],
      bookmark: true,
      deleted: false,
      createdAt: new Date(now - 172800000).toISOString(),
      weather: 'rainy',
      mood: 'tired',
    },
    {
      id: now + 3,
      title: 'Exciting news at work!',
      content:
        "Got the promotion I've been working towards for months. All the late nights and extra effort finally paid off. Time to celebrate!",
      date: new Date(now - 259200000).toISOString().split('T')[0],
      tags: ['work', 'celebration', 'career'],
      location: 'Office',
      images: [
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=600&fit=crop&auto=format',
      ],
      bookmark: false,
      deleted: false,
      createdAt: new Date(now - 259200000).toISOString(),
      weather: 'sunny',
      mood: 'excited',
    },
    {
      id: now + 4,
      title: 'Feeling overwhelmed',
      content:
        "Too many deadlines piling up. Not sure how I'm going to manage everything this week. Need to take a breath and prioritize.",
      date: new Date(now - 345600000).toISOString().split('T')[0],
      tags: ['stress', 'work', 'overwhelmed'],
      location: 'Home office',
      images: [
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=600&fit=crop&auto=format',
      ],
      bookmark: false,
      deleted: false,
      createdAt: new Date(now - 345600000).toISOString(),
      weather: 'cloudy',
      mood: 'anxious',
    },
  ]
  saveMemos(samples)
}

// ── Comments ──────────────────────────────────────────────

const COMMENTS_KEY = 'daylog_comments'

function getAllComments(): Comment[] {
  try {
    const data = localStorage.getItem(COMMENTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAllComments(comments: Comment[]): void {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
  } catch {
    // ignore quota errors for comments
  }
}

export function getComments(memoId: number): Comment[] {
  return getAllComments().filter(c => c.memoId === memoId)
}

export function addComment(memoId: number, text: string): Comment {
  const all = getAllComments()
  const comment: Comment = {
    id: Date.now(),
    memoId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  }
  all.push(comment)
  saveAllComments(all)
  return comment
}

export function deleteComment(id: number): void {
  const all = getAllComments().filter(c => c.id !== id)
  saveAllComments(all)
}

// ── Export/Import ──────────────────────────────────────────────

export interface ExportData {
  memos: Memo[]
  comments: Comment[]
  profile: Profile
  exportedAt: string
  version: string
}

export function exportData(): ExportData {
  return {
    memos: getMemos(),
    comments: getAllComments(),
    profile: getProfile(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }
}

export function importData(data: ExportData): { success: boolean; message: string } {
  try {
    // Validate data structure
    if (!data.memos || !Array.isArray(data.memos)) {
      return { success: false, message: 'Invalid data format: missing memos' }
    }
    
    if (!data.comments || !Array.isArray(data.comments)) {
      return { success: false, message: 'Invalid data format: missing comments' }
    }
    
    if (!data.profile || typeof data.profile !== 'object') {
      return { success: false, message: 'Invalid data format: missing profile' }
    }
    
    // Save data
    if (!saveMemos(data.memos)) {
      return { success: false, message: 'Failed to save memos (storage quota exceeded)' }
    }
    
    saveAllComments(data.comments)
    saveProfile(data.profile)

    return { success: true, message: 'Data imported successfully' }
  } catch (error) {
    return { success: false, message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export function downloadExportFile(): void {
  const data = exportData()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daylog-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
