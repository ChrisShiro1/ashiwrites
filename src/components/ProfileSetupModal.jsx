import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const PRESET_AVATARS = [
  { id: 1, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=luna&backgroundColor=ffd5dc' },
  { id: 2, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=nova&backgroundColor=d1f4e0' },
  { id: 3, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=ash&backgroundColor=dbeafe' },
  { id: 4, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=mira&backgroundColor=ede9fe' },
  { id: 5, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=zion&backgroundColor=fef3c7' },
  { id: 6, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=raven&backgroundColor=fee2e2' },
  { id: 7, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=cleo&backgroundColor=ccfbf1' },
  { id: 8, url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=sol&backgroundColor=fce7f3' },
]

const GENRES = [
  'Romance', 'Fantasy', 'Mystery', 'Thriller',
  'Horror', 'Sci-Fi', 'Historical', 'Teen Fiction',
  'Adventure', 'Poetry'
]

const STEPS = ['Avatar', 'About You', 'Interests']

export default function ProfileSetupModal({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Pre-fill from Google metadata if available
  const googleName = user?.user_metadata?.full_name || ''
  const googleAvatar = user?.user_metadata?.avatar_url || null

  const [avatarMode, setAvatarMode] = useState(googleAvatar ? 'google' : 'preset')
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AVATARS[0].url)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedPreview, setUploadedPreview] = useState(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState(googleName)
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [favoriteGenres, setFavoriteGenres] = useState([])

  const currentAvatar =
    avatarMode === 'google' && googleAvatar ? googleAvatar
    : avatarMode === 'upload' && uploadedPreview ? uploadedPreview
    : selectedPreset

  const toggleGenre = (genre) => {
    setFavoriteGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : prev.length < 3 ? [...prev, genre] : prev
    )
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    setUploadedFile(file)
    setUploadedPreview(URL.createObjectURL(file))
    setAvatarMode('upload')
  }

  const handleNext = () => {
    if (step === 1) {
      if (!username.trim()) { toast.error('Username is required'); return }
      if (username.length < 3) { toast.error('Username must be at least 3 characters'); return }
      if (!displayName.trim()) { toast.error('Display name is required'); return }
      if (age && (parseInt(age) < 10 || parseInt(age) > 100)) {
        toast.error('Please enter a valid age'); return
      }
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (favoriteGenres.length === 0) {
      toast.error('Pick at least 1 genre')
      return
    }

    setLoading(true)
    try {
      let avatarUrl = selectedPreset

      if (avatarMode === 'google' && googleAvatar) {
        avatarUrl = googleAvatar
      } else if (avatarMode === 'upload' && uploadedFile) {
        const ext = uploadedFile.name.split('.').pop()
        const path = `avatars/${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, uploadedFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        age: age ? parseInt(age) : null,
        bio: bio.trim(),
        avatar_url: avatarUrl,
        favorite_genres: favoriteGenres,
        profile_complete: true,
      })

      if (error) throw error

      toast.success('Profile set up! Welcome to Ashiwrites 🎉')
      onComplete()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-midnight/60 backdrop-blur-sm" />

<div className="relative bg-parchment rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Progress bar */}
        <div className="h-1 bg-ink-100">
          <div
            className="h-full bg-ink-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-5">

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                  i === step ? 'bg-ink-500 text-parchment'
                  : i < step ? 'bg-ink-200 text-ink-700'
                  : 'bg-ink-100 text-ink-400'
                }`}>
                  {i < step ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : <span>{i + 1}</span>}
                  {s}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px ${i < step ? 'bg-ink-300' : 'bg-ink-100'}`} />
                )}
              </div>
            ))}
          </div>

          {/* STEP 0: Avatar */}
          {step === 0 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-midnight">Choose your avatar</h2>
                <p className="text-sm text-ink-500 mt-1">Pick a preset or upload your own photo</p>
              </div>

              <div className="flex justify-center mb-5">
                <div className="relative">
                  <img
                    src={currentAvatar}
                    alt="avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-ink-200 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-ink-500 rounded-full flex items-center justify-center border-2 border-parchment">
                    <svg className="w-3.5 h-3.5 text-parchment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Mode tabs — show Google tab if available */}
              <div className="flex rounded-xl bg-ink-100 p-1 mb-4">
                {[
                  ...(googleAvatar ? [{ key: 'google', label: '🔵 Google' }] : []),
                  { key: 'preset', label: '🎨 Preset' },
                  { key: 'upload', label: '📷 Upload' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAvatarMode(key)}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      avatarMode === key ? 'bg-parchment text-midnight shadow-sm' : 'text-ink-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {avatarMode === 'google' && (
                <div className="text-center py-4">
                  <img src={googleAvatar} alt="Google avatar" className="w-20 h-20 rounded-full mx-auto border-4 border-ink-300 shadow" />
                  <p className="text-xs text-ink-400 mt-2">Using your Google profile photo</p>
                </div>
              )}

              {avatarMode === 'preset' && (
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map(av => (
                    <button
                      key={av.id}
                      onClick={() => setSelectedPreset(av.url)}
                      className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                        selectedPreset === av.url && avatarMode === 'preset'
                          ? 'border-ink-500 scale-105 shadow-md'
                          : 'border-transparent hover:border-ink-300'
                      }`}
                    >
                      <img src={av.url} alt="avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {avatarMode === 'upload' && (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-ink-300 rounded-xl cursor-pointer hover:bg-ink-50 transition-colors">
                    <svg className="w-8 h-8 text-ink-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-ink-500 font-medium">Click to upload photo</span>
                    <span className="text-xs text-ink-400 mt-1">PNG, JPG up to 2MB</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                  {uploadedPreview && (
                    <p className="text-xs text-green-600 text-center mt-2 font-medium">✓ Photo uploaded!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 1: About You */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-midnight">Tell us about you</h2>
                <p className="text-sm text-ink-500 mt-1">This is how others will see you</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.replace(/\s/g, '_').toLowerCase())}
                      placeholder="your_pen_name"
                      maxLength={30}
                      className="w-full pl-8 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white"
                    />
                  </div>
                  <p className="text-xs text-ink-400 mt-1">Lowercase, underscores allowed. No spaces.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="How you want to be called"
                    maxLength={50}
                    className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="Your age"
                    min={10} max={100}
                    className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="A little something about yourself..."
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white resize-none"
                  />
                  <p className="text-xs text-ink-400 text-right mt-1">{bio.length}/160</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Interests */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-midnight">What do you love reading?</h2>
                <p className="text-sm text-ink-500 mt-1">Pick up to 3 favorite genres</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {GENRES.map(genre => {
                  const selected = favoriteGenres.includes(genre)
                  const maxed = favoriteGenres.length >= 3 && !selected
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      disabled={maxed}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left ${
                        selected ? 'bg-ink-500 border-ink-500 text-parchment'
                        : maxed ? 'border-ink-100 text-ink-300 cursor-not-allowed'
                        : 'border-ink-200 text-midnight hover:border-ink-400 hover:bg-ink-50'
                      }`}
                    >
                      {selected && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {genre}
                    </button>
                  )
                })}
              </div>
              {favoriteGenres.length > 0 && (
                <p className="text-xs text-ink-500 text-center mt-3">{favoriteGenres.length}/3 selected</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-ink-200">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-midnight transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm"
              >
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish Setup 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}