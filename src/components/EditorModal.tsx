import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import type { Memo, Weather, Mood, EditorData } from '../lib/types'
import { addMemo, updateMemo, getMemos } from '../lib/storage'
import { useTheme } from '../contexts/ThemeContext'
import { PHOTO_FILTERS } from '../lib/theme'
import { resolveImageUrl, storeImage, toStoredImageReference } from '../lib/imageStore'

function ImageThumbnailGrid({
  images,
  onRemove,
  onReorder,
  onAddImages,
  enableSlide = true,
  showThumbnails = true,
  selectedFilter,
}: {
  images: string[]
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onAddImages: (files: File[]) => void
  enableSlide?: boolean
  showThumbnails?: boolean
  selectedFilter?: string
}) {
  const { theme } = useTheme()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const filterObj = PHOTO_FILTERS.find(f => f.id === selectedFilter) || PHOTO_FILTERS[0]

  // Reset preview index when enableSlide changes or images change
  useEffect(() => {
    if (!enableSlide) {
      setPreviewIndex(0)
    }
  }, [enableSlide, images.length])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) {
      onAddImages(files)
    }
    e.target.value = ''
  }

  const handlePrev = () => {
    setPreviewIndex(i => (i - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setPreviewIndex(i => (i + 1) % images.length)
  }

  return (
    <div>
      {/* Large Preview */}
      {images.length > 0 && (
        <div className="relative w-full aspect-square border-2 border-black dark:border-white bg-black overflow-hidden mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <img
            src={resolveImageUrl(enableSlide ? images[previewIndex] : images[0])}
            alt={`Preview ${enableSlide ? previewIndex + 1 : 1}`}
            className="w-full h-full object-cover"
            style={{ filter: filterObj.filterCss }}
          />
          <div className="absolute top-3 right-3 bg-black text-white border border-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest">
            [ {filterObj.name} ]
          </div>
          {enableSlide && images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/80 border border-white text-white flex items-center justify-center text-xl shadow-sm z-10 hover:bg-white hover:text-black transition-colors"
                onClick={handlePrev}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/80 border border-white text-white flex items-center justify-center text-xl shadow-sm z-10 hover:bg-white hover:text-black transition-colors"
                onClick={handleNext}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-3 bg-black/80 text-zinc-300 font-mono text-[10px] px-2 py-0.5 border border-zinc-700 tracking-widest">
            {enableSlide ? `${previewIndex + 1}/${images.length}` : `1/${images.length}`}
          </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      {showThumbnails && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => enableSlide && setPreviewIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-move border-2 transition-all ${
                draggedIndex === index ? 'opacity-50 border-[#1a1a1a]' :
                (enableSlide && previewIndex === index) ? 'border-[#1a1a1a]' : 'border-transparent hover:border-[#e8e3dd]'
              }`}
            >
              <img
                src={resolveImageUrl(src)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(index)
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/70 transition-colors"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-lg border-2 border-dashed border-[#ddd] flex items-center justify-center cursor-pointer hover:border-[#1a1a1a] hover:bg-[#faf9f7] transition-colors">
            <span className="text-2xl text-[#888]">+</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  )
}

const WEATHER_OPTIONS = [
  { value: 'sunny' as Weather, icon: '☀️', label: 'Sunny' },
  { value: 'cloudy' as Weather, icon: '☁️', label: 'Cloudy' },
  { value: 'rainy' as Weather, icon: '🌧️', label: 'Rainy' },
  { value: 'snowy' as Weather, icon: '❄️', label: 'Snowy' },
]

const MOOD_OPTIONS = [
  { value: 'happy' as Mood, icon: '😊', label: 'Happy' },
  { value: 'normal' as Mood, icon: '😐', label: 'Okay' },
  { value: 'sad' as Mood, icon: '😢', label: 'Sad' },
  { value: 'angry' as Mood, icon: '😡', label: 'Angry' },
  { value: 'excited' as Mood, icon: '🤩', label: 'Excited' },
  { value: 'tired' as Mood, icon: '😴', label: 'Tired' },
  { value: 'anxious' as Mood, icon: '😰', label: 'Anxious' },
  { value: 'grateful' as Mood, icon: '🙏', label: 'Grateful' },
]

const WEATHER_ICON: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
}
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

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function parseTags(val: string): string[] {
  return val
    .split(/\s+/)
    .map(t => t.replace(/^#/, '').trim())
    .filter(Boolean)
}

interface Props {
  memo?: Memo | null
  onSave: () => void
  onClose: () => void
}

const inputCls =
  'w-full px-4 py-3 border-2 border-zinc-700 bg-zinc-900 text-white text-[13px] outline-none focus:border-white transition-colors font-mono uppercase'

export default function EditorModal({ memo, onSave, onClose }: Props) {
  const { theme } = useTheme()
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<string[]>(memo?.images || [])
  const [date, setDate] = useState(memo?.date || getToday())
  const [weather, setWeather] = useState<Weather>(memo?.weather || '')
  const [mood, setMood] = useState<Mood>(memo?.mood || '')
  const [title, setTitle] = useState(memo?.title || '')
  const [content, setContent] = useState(memo?.content || '')
  const [tags, setTags] = useState<string[]>(memo?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [location, setLocation] = useState(memo?.location || '')
  const [selectedFilter, setSelectedFilter] = useState('monoHigh')

  useEffect(() => {
    const allMemos = getMemos()
    const tags = Array.from(new Set(allMemos.flatMap(m => m.tags || []))).filter(Boolean)
    setExistingTags(tags)
  }, [])

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [moved] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, moved)
      return newImages
    })
  }

  const handleAddImages = async (files: File[]) => {
    try {
      const results = await Promise.all(files.map(storeImage))
      setImages(prev => [...prev, ...results])
    } catch {
      alert('Unable to store image locally. Please try again.')
    }
  }

  const save = () => {
    const data: EditorData = {
      images: images.map(toStoredImageReference),
      date,
      weather,
      mood,
      title: title.trim(),
      content: content.trim(),
      tags,
      location: location.trim(),
    }
    if (memo) {
      updateMemo(memo.id, data)
    } else {
      addMemo(data)
    }
    onSave()
  }

  const addTag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '').trim()
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags(prev => [...prev, cleanTag])
    }
    setTagInput('')
    setShowTagSuggestions(false)
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const filteredTags = existingTags.filter(tag => 
    !tags.includes(tag) && 
    tag.toLowerCase().includes(tagInput.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-[480px] max-h-[93vh] overflow-y-auto border-2 border-white bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)] font-mono`}
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
          <div>
            <h3 className="text-[21px] font-black tracking-widest uppercase text-white">
              {step === 1 && "[ WRITE_NEW_MONO_LOG.EXE ]"}
              {step === 2 && "[ PHOTO_FILTER ]"}
              {step === 3 && "[ STATE_CONFIG ]"}
              {step === 4 && "[ CONTENT_INPUT ]"}
            </h3>
            <p className="text-[12px] text-zinc-400 mt-0.5 font-bold">
              {step === 1 && "// SELECT_PHOTOS"}
              {step === 2 && "// SWIPE_PHOTO & SELECT_FILTER"}
              {step === 3 && "// HOW_WAS_YOUR_DAY?"}
              {step === 4 && "// WRITE_ABOUT_YOUR_DAY"}
            </p>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-zinc-400 text-[22px] hover:text-white transition-colors leading-none border border-zinc-700 bg-zinc-900"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Step body */}
        <div className="px-5 pb-10">
          {/* ── Step 1: Photos ── */}
          {step === 1 && (
            <div>
              <ImageThumbnailGrid
                images={images}
                onRemove={removeImage}
                onReorder={reorderImages}
                onAddImages={handleAddImages}
                enableSlide={true}
                selectedFilter={selectedFilter}
              />

              <div className="mt-7">
                <button
                  className="w-full py-3.5 bg-white text-black border-2 border-white rounded-xl text-[13px] font-black hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => setStep(2)}
                >
                  [ NEXT_STEP ] →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Date / Weather / Mood ── */}
          {step === 2 && (
            <div>
              <ImageThumbnailGrid
                images={images}
                onRemove={removeImage}
                onReorder={reorderImages}
                onAddImages={handleAddImages}
                enableSlide={true}
                showThumbnails={false}
                selectedFilter={selectedFilter}
              />

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">// SELECT_PHOTO_FILTER</label>
                  <span className="text-[9px] text-zinc-500 font-bold">SWIPE →</span>
                </div>
                <div className="-mx-5 px-5 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none text-[10px] pb-2">
                  {PHOTO_FILTERS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFilter(f.id)}
                      aria-pressed={selectedFilter === f.id}
                      className={`shrink-0 snap-start min-w-[132px] px-3 py-2.5 border-2 text-left font-bold transition uppercase ${
                        selectedFilter === f.id
                          ? 'bg-white text-black border-white shadow-[3px_3px_0px_0px_rgba(82,82,91,1)]'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-white'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button className="flex-1 py-3.5 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 rounded-xl text-[13px] font-black hover:bg-black hover:text-white transition-colors" onClick={() => setStep(1)}>
                  [ BACK ]
                </button>
                <button className="flex-1 py-3.5 bg-white text-black border-2 border-white rounded-xl text-[13px] font-black hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onClick={() => setStep(3)}>
                  [ NEXT ] →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>

              <div className="mb-5">
                <label className="block text-[12px] font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="mb-5">
                <label className="text-[10px] font-bold text-zinc-400 block mb-2 uppercase">// WEATHER</label>
                <div className="grid grid-cols-4 gap-2">
                  {WEATHER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`py-3 border-2 border-black dark:border-white flex flex-col items-center gap-1.5 transition-all ${
                        weather === opt.value
                          ? 'bg-transparent text-white border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.45)]'
                          : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-white hover:text-white'
                      }`}
                      onClick={() =>
                        setWeather(weather === opt.value ? '' : opt.value)
                      }
                    >
                      <span className="text-[22px]">{opt.icon}</span>
                      <small className="text-[10px] font-bold">{opt.label}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[10px] font-bold text-zinc-400 block mb-2 uppercase">// MOOD</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`py-3 border-2 border-black dark:border-white flex flex-col items-center gap-1.5 transition-all ${
                        mood === opt.value
                          ? 'bg-transparent text-white border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.45)]'
                          : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-white hover:text-white'
                      }`}
                      onClick={() =>
                        setMood(mood === opt.value ? '' : opt.value)
                      }
                    >
                      <span className="text-[22px]">{opt.icon}</span>
                      <small className="text-[10px] font-bold">{opt.label}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  className="flex-1 py-3.5 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 rounded-xl text-[13px] font-black hover:bg-black hover:text-white transition-colors"
                  onClick={() => setStep(2)}
                >
                  [ BACK ]
                </button>
                <button
                  className="flex-1 py-3.5 bg-white text-black border-2 border-white rounded-xl text-[13px] font-black hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => setStep(4)}
                >
                  [ NEXT ] →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Content ── */}
          {step === 4 && (
            <div>

              {/* Summary */}
              <div className="flex items-center gap-2 mb-5 text-[12px] text-[#9a9a9a]">
                <span>{date}</span>
                {weather && <span>{WEATHER_ICON[weather]}</span>}
                {mood && <span>{MOOD_ICON[mood]}</span>}
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  placeholder="Capture today in one line…"
                  onChange={e => setTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold mb-2">Entry</label>
                <textarea
                  value={content}
                  rows={7}
                  placeholder="How was your day?"
                  onChange={e => setContent(e.target.value)}
                  className={`${inputCls} resize-y leading-relaxed`}
                />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold mb-2">Tags</label>
                
                {/* Selected tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map(tag => (
                      <div
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-white rounded-full text-[12px] font-medium"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tag input with suggestions */}
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    placeholder="Add tag..."
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    className={inputCls}
                  />

                  {/* Tag suggestions dropdown */}
                  {showTagSuggestions && filteredTags.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e8e3dd] rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                      {filteredTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full px-4 py-2.5 text-left text-[13px] text-[#1a1a1a] hover:bg-[#faf9f7] transition-colors flex items-center justify-between"
                        >
                          <span>#{tag}</span>
                          <span className="text-[11px] text-[#999]">+</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  maxLength={100}
                  placeholder="Where were you?"
                  onChange={e => setLocation(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  className="flex-1 py-3.5 border border-[#eee] bg-[#fafafa] text-[#777] rounded-xl text-[13px] font-semibold hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => setStep(3)}
                >
                  ← Back
                </button>
                <button
                  className="flex-1 py-3.5 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition-colors"
                  onClick={save}
                >
                  {memo ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
