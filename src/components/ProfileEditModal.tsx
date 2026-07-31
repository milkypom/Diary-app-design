import { useState, useRef, type ChangeEvent } from 'react'
import type { Profile } from '../lib/storage'
import { saveProfile } from '../lib/storage'

const AVATAR_COLORS = [
  'from-[#f5e6d8] to-[#e8c4a2]',
  'from-[#e8c4a2] to-[#c4a2e8]',
  'from-[#a2c4e8] to-[#a2e8c4]',
  'from-[#e8d0a2] to-[#e8a2c4]',
  'from-[#d0c9c4] to-[#c4d0c9]',
]

const AVATAR_EMOJIS = ['🌿', '📖', '✨', '🌸', '🍃', '🌙', '⭐', '🎨', '📝', '💫']

interface Props {
  profile: Profile
  onSave: () => void
  onClose: () => void
}

const inputCls =
  'w-full px-4 py-3 border border-[#e8e3dd] rounded-xl bg-[#faf9f7] text-[13px] outline-none focus:border-[#bbb] focus:bg-white transition-colors'

export default function ProfileEditModal({ profile, onSave, onClose }: Props) {
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji)
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    
    const reader = new FileReader()
    reader.onload = ev => {
      setAvatar(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    saveProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatar,
      avatarEmoji,
      avatarColor,
    })
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
        <div className="sticky top-0 z-10 flex items-center justify-end px-5 py-3.5 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8]">
          <button
            className="w-8 h-8 flex items-center justify-center text-[#aaa] text-[22px] hover:text-[#555] transition-colors leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-10">
          {/* Avatar preview */}
          <div className="flex flex-col items-center mb-6">
            <div 
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-4xl shadow-lg mb-3`}
            >
              {avatar ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                avatarEmoji
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-[13px] text-[#c87941] font-medium"
            >
              Change Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Avatar emoji selection */}
          <div className="mb-5">
            <label className="block text-[12px] font-semibold mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-[#faf9f7] hover:bg-[#f5f0eb]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar color selection */}
          <div className="mb-5">
            <label className="block text-[12px] font-semibold mb-2">Background</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} transition-all ${
                    avatarColor === color ? 'ring-2 ring-[#1a1a1a] ring-offset-2' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-[12px] font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              placeholder="Your name"
              onChange={e => setName(e.target.value)}
              className={inputCls}
              maxLength={30}
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-[12px] font-semibold mb-2">Bio</label>
            <textarea
              value={bio}
              placeholder="Tell us about yourself"
              onChange={e => setBio(e.target.value)}
              className={inputCls}
              rows={3}
              maxLength={100}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}