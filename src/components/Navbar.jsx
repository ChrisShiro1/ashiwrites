import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const GENRES = [
  'Romance', 'Fantasy', 'Mystery', 'Thriller', 'Horror',
  'Sci-Fi', 'Historical', 'Teen Fiction', 'Adventure', 'Poetry'
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [browseOpen, setBrowseOpen] = useState(false)
  const [writeOpen, setWriteOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authModal, setAuthModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  // Fetch profile for avatar + username
  useEffect(() => {
    if (!user) { setProfile(null); return }
    supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [user])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setProfileOpen(false)
    navigate('/')
  }

  // Close dropdowns on outside click
  const browseRef = useRef()
  const writeRef = useRef()
  const profileRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (browseRef.current && !browseRef.current.contains(e.target)) setBrowseOpen(false)
      if (writeRef.current && !writeRef.current.contains(e.target)) setWriteOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Lazy import AuthModal
  const [AuthModal, setAuthModal2] = useState(null)
  useEffect(() => {
    import('./AuthModal').then(m => setAuthModal2(() => m.default))
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-ink-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-ink-500 rounded-lg flex items-center justify-center">
              <span className="text-parchment font-display font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold text-xl text-midnight hidden sm:block">Ashiwrites</span>
          </Link>

          {/* Browse Dropdown */}
          <div className="relative hidden md:block" ref={browseRef}>
            <button
              onClick={() => setBrowseOpen(!browseOpen)}
              className="flex items-center gap-1 text-sm font-medium text-midnight/70 hover:text-midnight transition-colors px-3 py-2 rounded-lg hover:bg-ink-100"
            >
              Browse
              <svg className={`w-4 h-4 transition-transform ${browseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {browseOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-parchment border border-ink-200 rounded-xl shadow-xl p-3 z-50">
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest px-2 mb-2">Genres</p>
                <div className="grid grid-cols-2 gap-1">
                  {GENRES.map(genre => (
                    <Link
                      key={genre}
                      to={`/browse?genre=${genre.toLowerCase().replace(' ', '-')}`}
                      onClick={() => setBrowseOpen(false)}
                      className="text-sm text-midnight/70 hover:text-ink-600 hover:bg-ink-50 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-ink-100 mt-2 pt-2">
                  <Link
                    to="/browse"
                    onClick={() => setBrowseOpen(false)}
                    className="text-sm text-ink-500 hover:text-ink-700 font-medium px-2 py-1.5 rounded-lg hover:bg-ink-50 flex items-center gap-1 transition-colors"
                  >
                    Browse all stories →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stories..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-ink-200 rounded-full focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 transition-all"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <>
                {/* Write Dropdown */}
                <div className="relative hidden sm:block" ref={writeRef}>
                  <button
                    onClick={() => setWriteOpen(!writeOpen)}
                    className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-700 px-3 py-2 rounded-lg hover:bg-ink-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Write
                    <svg className={`w-3.5 h-3.5 transition-transform ${writeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {writeOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-parchment border border-ink-200 rounded-xl shadow-xl py-2 z-50">
                      <Link
                        to="/write/new"
                        onClick={() => setWriteOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create a new story
                      </Link>
                      <Link
                        to="/my-stories"
                        onClick={() => setWriteOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        My Stories
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-ink-100 transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-ink-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-ink-500 flex items-center justify-center text-sm font-bold text-parchment">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-parchment border border-ink-200 rounded-xl shadow-xl py-2 z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-ink-100">
                        <p className="font-semibold text-sm text-midnight truncate">{profile?.display_name || 'Writer'}</p>
                        <p className="text-xs text-ink-400 truncate">@{profile?.username || '...'}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          to={`/profile/${profile?.username}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          to={`/profile/${profile?.username}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          My Stories
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-ink-100 py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthModal('login')}
                  className="text-sm font-medium text-midnight/70 hover:text-midnight px-3 py-2 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="text-sm font-semibold bg-ink-500 text-parchment px-4 py-2 rounded-full hover:bg-ink-600 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {authModal && AuthModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(m) => setAuthModal(m)}
        />
      )}
    </>
  )
}