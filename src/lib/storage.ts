import type { Memo, EditorData, Comment } from './types'

const KEY = 'daylog_memos'
const PROFILE_KEY = 'daylog_profile'

export interface Profile {
  name: string
  bio: string
  avatar: string
  avatarEmoji: string
  avatarColor: string
}
 
export function getTagListStyle(): TagListStyle {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) {
      const settings = JSON.parse(data)
      return settings.tagListStyle || 'circle'
    }
  } catch {
    // ignore error
  }
  return 'circle'
}
 
export function saveTagListStyle(tagListStyle: TagListStyle): boolean {
  try {
    const currentSettings = localStorage.getItem(SETTINGS_KEY)
    const settings = currentSettings ? JSON.parse(currentSettings) : {}
    settings.tagListStyle = tagListStyle
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
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
