import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const GENRE_ICONS = {
  Romance: '🌹', Fantasy: '✨', Mystery: '🔍', Thriller: '⚡',
  Horror: '🌑', 'Sci-Fi': '🚀', Historical: '📜', 'Teen Fiction': '🎒',
  Adventure: '🗺️', Poetry: '🪶'
}

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: storiesData } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', profileData.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    setStories(storiesData || [])
    setLoading(false)
  }

  const isOwnProfile = user?.id === profile?.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="font-display text-2xl font-bold text-midnight mb-2">User not found</h1>
          <p className="text-ink-400 text-sm mb-6">@{username} doesn't exist on Ashiwrites.</p>
          <Link to="/" className="text-ink-500 hover:text-ink-700 font-medium text-sm">← Back to home</Link>
        </div>
      </div>
    )
  }

  // Calculate total stats
  const totalReads = stories.reduce((sum, s) => sum + (s.reads || 0), 0)
  const totalVotes = stories.reduce((sum, s) => sum + (s.votes || 0), 0)

  return (
    <div className="min-h-screen bg-parchment">

      {/* Cover banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-br from-ink-400 via-ink-500 to-midnight relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Profile header */}
        <div className="relative -mt-12 sm:-mt-16 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <img
              src={profile.avatar_url || `https://api.dicebear.com/8.x/adventurer/svg?seed=${profile.username}`}
              alt={profile.display_name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-parchment shadow-xl bg-white"
            />

            {/* Name + actions */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-1">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-midnight">
                  {profile.display_name}
                </h1>
                <p className="text-sm text-ink-500">@{profile.username}</p>
              </div>

              {isOwnProfile && (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 border border-ink-300 text-ink-600 font-semibold px-4 py-2 rounded-full hover:bg-ink-50 transition-colors text-sm self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-midnight/70 leading-relaxed mt-4 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div>
              <span className="font-bold text-midnight">{stories.length}</span>
              <span className="text-ink-400 ml-1">{stories.length === 1 ? 'story' : 'stories'}</span>
            </div>
            <div>
              <span className="font-bold text-midnight">{totalReads.toLocaleString()}</span>
              <span className="text-ink-400 ml-1">reads</span>
            </div>
            <div>
              <span className="font-bold text-midnight">{totalVotes.toLocaleString()}</span>
              <span className="text-ink-400 ml-1">votes</span>
            </div>
          </div>

          {/* Favorite genres */}
          {profile.favorite_genres?.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-xs text-ink-400 font-medium">Loves reading:</span>
              {profile.favorite_genres.map(genre => (
                <span key={genre} className="text-xs bg-ink-100 text-ink-600 px-2.5 py-1 rounded-full font-medium">
                  {GENRE_ICONS[genre]} {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Published Stories */}
        <div className="pb-16">
          <h2 className="font-display text-xl font-bold text-midnight mb-4">
            {isOwnProfile ? 'My Published Stories' : `Stories by ${profile.display_name}`}
          </h2>

          {stories.length === 0 ? (
            <div className="bg-white border border-ink-200 rounded-2xl p-10 text-center">
              <svg className="w-12 h-12 text-ink-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-ink-400 text-sm">
                {isOwnProfile ? "You haven't published any stories yet." : "No published stories yet."}
              </p>
              {isOwnProfile && (
                <Link
                  to="/write/new"
                  className="inline-flex items-center gap-2 mt-4 bg-ink-500 text-parchment font-semibold px-5 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm"
                >
                  Start writing
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {stories.map(story => (
                <Link key={story.id} to={`/story/${story.id}`} className="group block">
                  <div className="aspect-[3/4.2] rounded-xl bg-ink-100 overflow-hidden mb-2 relative">
                    {story.cover_url ? (
                      <img
                        src={story.cover_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-ink-50">
                        <svg className="w-8 h-8 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      story.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-ink-100/90 text-ink-700'
                    }`}>
                      {story.status === 'complete' ? 'Complete' : 'Ongoing'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-midnight truncate group-hover:text-ink-600 transition-colors">{story.title}</h3>
                  <p className="text-xs text-ink-400">{story.genre}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}