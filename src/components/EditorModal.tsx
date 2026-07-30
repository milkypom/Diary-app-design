import { useState, useRef, type ChangeEvent } from 'react'
import type { Memo, Weather, Mood, EditorData } from '../lib/types'
import { addMemo, updateMemo } from '../lib/storage'

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

function ImageSlider({
  images,
  imgIdx,
  setImgIdx,
  interactive = true,
}: {
  images: string[]
  imgIdx: number
  setImgIdx: (i: number) => void
  interactive?: boolean
}) {
  if (images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-[#faf9f7] border-2 border-dashed border-[#e8e3dd] flex flex-col items-center justify-center gap-2">
        <span className="text-4xl opacity-40">📷</span>
        <p className="text-[12px] text-[#aaa]">No photos yet</p>
      </div>
    )
  }
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#f5f0eb]">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            i === imgIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}
      {interactive && images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-lg z-10"
            onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)}
          >
            ‹
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-lg z-10"
            onClick={() => setImgIdx((imgIdx + 1) % images.length)}
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                className={`h-1.5 rounded-full bg-white transition-all ${
                  i === imgIdx ? 'w-4 opacity-100' : 'w-1.5 opacity-50'
                }`}
                onClick={() => setImgIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-5">
      {[1, 2, 3].map((s, i) => (
        <span key={s} className="contents">
          {i > 0 && <span className="w-8 h-px bg-[#f0ede8] block" />}
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all select-none ${
              current === s
                ? 'bg-[#1a1a1a] text-white'
                : current > s
                ? 'bg-[#c87941] text-white'
                : 'bg-[#f0ede8] text-[#9a9a9a]'
            }`}
          >
            {current > s ? '✓' : s}
          </span>
        </span>
      ))}
    </div>
  )
}

const inputCls =
  'w-full px-4 py-3 border border-[#e8e3dd] rounded-xl bg-[#faf9f7] text-[13px] outline-none focus:border-[#bbb] focus:bg-white transition-colors'

export default function EditorModal({ memo, onSave, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<string[]>(memo?.images || [])
  const [imgIdx, setImgIdx] = useState(0)
  const [date, setDate] = useState(memo?.date || getToday())
  const [weather, setWeather] = useState<Weather>(memo?.weather || '')
  const [mood, setMood] = useState<Mood>(memo?.mood || '')
  const [title, setTitle] = useState(memo?.title || '')
  const [content, setContent] = useState(memo?.content || '')
  const [tagsInput, setTagsInput] = useState(
    memo?.tags?.map(t => '#' + t).join(' ') || ''
  )
  const [location, setLocation] = useState(memo?.location || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const results = await Promise.all(
      files.map(
        f =>
          new Promise<string>((res, rej) => {
            const reader = new FileReader()
            reader.onload = ev => res(ev.target!.result as string)
            reader.onerror = rej
            reader.readAsDataURL(f)
          })
      )
    )
    setImages(prev => {
      const next = [...prev, ...results]
      setImgIdx(next.length - 1)
      return next
    })
    e.target.value = ''
  }

  const removeImage = () => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== imgIdx)
      setImgIdx(Math.max(0, Math.min(imgIdx, next.length - 1)))
      return next
    })
  }

  const save = () => {
    const data: EditorData = {
      images,
      date,
      weather,
      mood,
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsInput),
      location: location.trim(),
    }
    if (memo) {
      updateMemo(memo.id, data)
    } else {
      addMemo(data)
    }
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[480px] max-h-[93vh] overflow-y-auto bg-white rounded-t-[26px]"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#e8e3dd]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center px-5 py-3.5 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8]">
          <h2 className="flex-1 font-serif text-[17px] font-semibold italic text-[#1a1a1a]">
            {memo ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center text-[#aaa] text-[22px] hover:text-[#555] transition-colors leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <StepDots current={step} />

        {/* Step body */}
        <div className="px-5 pb-10">
          {/* ── Step 1: Photos ── */}
          {step === 1 && (
            <div>
              <div className="mb-5">
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#bbb] uppercase mb-1">
                  Step 1
                </p>
                <h3 className="font-serif text-[21px] font-semibold italic text-[#1a1a1a]">
                  Today's Photos
                </h3>
                <p className="text-[12px] text-[#9a9a9a] mt-0.5">Add photos to your entry</p>
              </div>

              <ImageSlider
                images={images}
                imgIdx={imgIdx}
                setImgIdx={setImgIdx}
                interactive
              />

              {images.length > 0 && (
                <div className="flex items-center justify-between mt-2 px-1">
                  <p className="text-[11px] text-[#bbb]">
                    {imgIdx + 1} / {images.length}
                  </p>
                  <button
                    className="text-[11px] text-[#bbb] hover:text-red-400 transition-colors"
                    onClick={removeImage}
                  >
                    Remove this photo
                  </button>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 border border-dashed border-[#ddd] rounded-xl text-[13px] text-[#888] hover:bg-[#faf9f7] cursor-pointer transition-colors">
                <span className="text-lg">+</span> Add Photo
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                />
              </label>

              <div className="mt-7">
                <button
                  className="w-full py-3.5 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition-colors"
                  onClick={() => setStep(2)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Date / Weather / Mood ── */}
          {step === 2 && (
            <div>
              <div className="mb-5">
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#bbb] uppercase mb-1">
                  Step 2
                </p>
                <h3 className="font-serif text-[21px] font-semibold italic text-[#1a1a1a]">
                  Today's State
                </h3>
                <p className="text-[12px] text-[#9a9a9a] mt-0.5">
                  How was your day?
                </p>
              </div>

              {images.length > 0 && (
                <div className="mb-5">
                  <ImageSlider
                    images={images}
                    imgIdx={imgIdx}
                    setImgIdx={() => {}}
                    interactive={false}
                  />
                </div>
              )}

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
                <label className="block text-[12px] font-semibold mb-2">Weather</label>
                <div className="grid grid-cols-4 gap-2">
                  {WEATHER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`py-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                        weather === opt.value
                          ? 'border-[#1a1a1a] bg-[#f5f0eb] shadow-sm'
                          : 'border-[#eee] bg-[#fafafa] hover:bg-[#fdf4f0]'
                      }`}
                      onClick={() =>
                        setWeather(weather === opt.value ? '' : opt.value)
                      }
                    >
                      <span className="text-[22px]">{opt.icon}</span>
                      <small className="text-[10px] text-[#777]">{opt.label}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[12px] font-semibold mb-2">Mood</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`py-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                        mood === opt.value
                          ? 'border-[#1a1a1a] bg-[#f5f0eb] shadow-sm'
                          : 'border-[#eee] bg-[#fafafa] hover:bg-[#fdf4f0]'
                      }`}
                      onClick={() =>
                        setMood(mood === opt.value ? '' : opt.value)
                      }
                    >
                      <span className="text-[22px]">{opt.icon}</span>
                      <small className="text-[10px] text-[#777]">{opt.label}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  className="flex-1 py-3.5 border border-[#eee] bg-[#fafafa] text-[#777] rounded-xl text-[13px] font-semibold hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  className="flex-1 py-3.5 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition-colors"
                  onClick={() => setStep(3)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Content ── */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#bbb] uppercase mb-1">
                  Step 3
                </p>
                <h3 className="font-serif text-[21px] font-semibold italic text-[#1a1a1a]">
                  Today's Record
                </h3>
                <p className="text-[12px] text-[#9a9a9a] mt-0.5">Write about your day</p>
              </div>

              {images.length > 0 && (
                <div className="mb-4">
                  <ImageSlider
                    images={images}
                    imgIdx={imgIdx}
                    setImgIdx={() => {}}
                    interactive={false}
                  />
                </div>
              )}

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
                <input
                  type="text"
                  value={tagsInput}
                  placeholder="#café #daily #travel"
                  onChange={e => setTagsInput(e.target.value)}
                  className={inputCls}
                />
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
                  onClick={() => setStep(2)}
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
