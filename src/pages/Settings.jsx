import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

const TABS = ['Profile', 'Account']

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile fields
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [age, setAge] = useState('')
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarMode, setAvatarMode] = useState('preset')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedPreview, setUploadedPreview] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setUsername(data.username || '')
      setOriginalUsername(data.username || '')
      setDisplayName(data.display_name || '')
      setBio(data.bio || '')
      setAge(data.age || '')
      setFavoriteGenres(data.favorite_genres || [])
      setAvatarUrl(data.avatar_url || '')
    }
    setLoading(false)
  }

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
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setUploadedFile(file)
    setUploadedPreview(URL.createObjectURL(file))
    setAvatarMode('upload')
  }

  const currentAvatarPreview = avatarMode === 'upload' && uploadedPreview
    ? uploadedPreview
    : avatarUrl

  const handleSave = async () => {
    if (!username.trim() || username.length < 3) {
      toast.error('Username must be at least 3 characters'); return
    }
    if (!displayName.trim()) {
      toast.error('Display name is required'); return
    }
    if (favoriteGenres.length === 0) {
      toast.error('Pick at least 1 favorite genre'); return
    }

    setSaving(true)
    try {
      // Check username uniqueness if changed
      if (username.toLowerCase() !== originalUsername.toLowerCase()) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .neq('id', user.id)
          .maybeSingle()

        if (existing) {
          toast.error('Username already taken')
          setSaving(false)
          return
        }
      }

      let newAvatarUrl = avatarUrl
      if (avatarMode === 'upload' && uploadedFile) {
        const ext = uploadedFile.name.split('.').pop()
        const path = `${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, uploadedFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        newAvatarUrl = data.publicUrl + `?t=${Date.now()}` // cache bust
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim().toLowerCase(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          age: age ? parseInt(age) : null,
          favorite_genres: favoriteGenres,
          avatar_url: newAvatarUrl,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated! 🎉')
      setOriginalUsername(username)
      setAvatarUrl(newAvatarUrl)
      setUploadedFile(null)
      setUploadedPreview(null)

      // Redirect if username changed
      if (username.toLowerCase() !== originalUsername.toLowerCase()) {
        navigate(`/profile/${username.toLowerCase()}`)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        <h1 className="font-display text-3xl font-bold text-midnight mb-2">Settings</h1>
        <p className="text-sm text-ink-400 mb-8">Manage your profile and account</p>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-ink-100 rounded-full p-1 mb-8 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold px-5 py-2 rounded-full transition-all ${
                activeTab === tab ? 'bg-parchment text-midnight shadow-sm' : 'text-ink-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'Profile' && (
          <div className="space-y-6">

            {/* Avatar */}
            <div className="bg-white border border-ink-200 rounded-2xl p-6">
              <h3 className="font-semibold text-midnight mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <img
                  src={currentAvatarPreview || `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}`}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-ink-100"
                />
                <div className="flex-1">
                  <div className="flex rounded-xl bg-ink-100 p-1 mb-3 max-w-xs">
                    {['preset', 'upload'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setAvatarMode(mode)}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-lg capitalize transition-all ${
                          avatarMode === mode ? 'bg-parchment text-midnight shadow-sm' : 'text-ink-500'
                        }`}
                      >
                        {mode === 'preset' ? '🎨 Preset' : '📷 Upload'}
                      </button>
                    ))}
                  </div>

                  {avatarMode === 'preset' ? (
                    <div className="grid grid-cols-8 gap-2 max-w-md">
                      {PRESET_AVATARS.map(av => (
                        <button
                          key={av.id}
                          onClick={() => setAvatarUrl(av.url)}
                          className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                            avatarUrl === av.url ? 'border-ink-500 scale-105' : 'border-transparent hover:border-ink-300'
                          }`}
                        >
                          <img src={av.url} alt="avatar option" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 border border-ink-200 rounded-xl px-4 py-2 cursor-pointer hover:bg-ink-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white border border-ink-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-midnight">About You</h3>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/\s/g, '_').toLowerCase())}
                    maxLength={30}
                    className="w-full pl-8 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
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
                  min={10} max={100}
                  className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white max-w-[120px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white resize-none"
                />
                <p className="text-xs text-ink-400 text-right mt-1">{bio.length}/160</p>
              </div>
            </div>

            {/* Favorite Genres */}
            <div className="bg-white border border-ink-200 rounded-2xl p-6">
              <h3 className="font-semibold text-midnight mb-1">Favorite Genres</h3>
              <p className="text-xs text-ink-400 mb-4">Pick up to 3 — helps us recommend stories for you</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRES.map(genre => {
                  const selected = favoriteGenres.includes(genre)
                  const maxed = favoriteGenres.length >= 3 && !selected
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      disabled={maxed}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${
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
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-600 transition-colors text-sm disabled:opacity-50"
              >
                {saving && <div className="w-4 h-4 border-2 border-parchment border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'Account' && (
          <div className="space-y-6">
            <div className="bg-white border border-ink-200 rounded-2xl p-6">
              <h3 className="font-semibold text-midnight mb-1">Email</h3>
              <p className="text-sm text-ink-500">{user.email}</p>
            </div>

            <div className="bg-white border border-red-200 rounded-2xl p-6">
              <h3 className="font-semibold text-red-600 mb-1">Sign Out</h3>
              <p className="text-xs text-ink-400 mb-4">You'll need to log in again to access your account.</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 border border-red-300 text-red-500 font-semibold px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}