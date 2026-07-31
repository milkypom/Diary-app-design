export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | ''
export type Mood = 'happy' | 'normal' | 'sad' | 'angry' | 'excited' | 'tired' | 'anxious' | 'grateful' | ''
export type Page = 'home' | 'search' | 'my' | 'bookmark' | 'settings'
export type TagListStyle = 'circle' | 'folder'

export interface Memo {
  id: number
  title: string
  content: string
  date: string
  tags: string[]
  location: string
  images: string[]
  bookmark: boolean
  deleted: boolean
  createdAt: string
  updatedAt?: string
  weather: Weather
  mood: Mood
}

export interface Comment {
  id: number
  memoId: number
  text: string
  createdAt: string
}

export interface EditorData {
  images: string[]
  date: string
  weather: Weather
  mood: Mood
  location: string
  title: string
  content: string
  tags: string[]
}
