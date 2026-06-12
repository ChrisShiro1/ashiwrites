import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DUMMY_STORIES } from '../data/stories'
import StoryCard from '../components/StoryCard'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [myStories, setMyStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    // Fetch user's stories
    const { data: storiesData } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })
    setMyStories(storiesData || [])

    setLoading(false)
  }

  // Recommended stories based on favorite genres
  const recommended = profile?.favorite_genres?.length
    ? DUMMY_STORIES.filter(s => profile.favorite_genres.includes(s.genre))
    : DUMMY_STORIES.slice(0, 6)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Welcome Header */}
        <div className="flex items-center gap-4 mb-10">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-ink-200" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-ink-500 flex items-center justify-center text-xl font-bold text-parchment">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold text-midnight">
              Welcome back, {profile?.display_name || 'Writer'} 👋
            </h1>
            <p className="text-sm text-ink-500">@{profile?.username}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            {
              icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
              label: 'Write a Story',
              desc: 'Start something new',
              to: '/write/new',
              color: 'bg-ink-500 text-parchment',
            },
            {
              icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
              label: 'My Stories',
              desc: 'Manage your work',
              to: '/my-stories',
              color: 'bg-ink-100 text-midnight',
            },
            {
              icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
              label: 'Browse',
              desc: 'Discover stories',
              to: '/browse',
              color: 'bg-ink-100 text-midnight',
            },
            {
              icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
              label: 'Settings',
              desc: 'Edit your profile',
              to: '/settings',
              color: 'bg-ink-100 text-midnight',
            },
          ].map(item => (
            <Link
              key={item.label}
              to={item.to}
              className={`${item.color} rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-all`}
            >
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs opacity-60">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* My Stories Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-midnight">My Stories</h2>
            <Link to="/my-stories" className="text-sm text-ink-500 hover:text-ink-700 font-medium">
              See all →
            </Link>
          </div>

          {myStories.length === 0 ? (
            <div className="bg-white border border-ink-200 rounded-2xl p-10 text-center">
              <svg className="w-12 h-12 text-ink-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-ink-400 text-sm mb-4">You haven't written any stories yet.</p>
              <Link
                to="/write/new"
                className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-5 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create your first story
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {myStories.slice(0, 5).map(story => (
                <Link key={story.id} to={`/write/${story.id}`} className="group block">
                  <div className="aspect-[3/4.2] rounded-xl bg-ink-100 overflow-hidden mb-2 relative">
                    {story.cover_url ? (
                      <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      story.is_published ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-600'
                    }`}>
                      {story.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-midnight truncate group-hover:text-ink-600 transition-colors">{story.title}</p>
                  <p className="text-xs text-ink-400">{story.genre || 'No genre'}</p>
                </Link>
              ))}

              {/* Add new story card */}
              <Link
                to="/write/new"
                className="aspect-[3/4.2] rounded-xl border-2 border-dashed border-ink-200 hover:border-ink-400 flex flex-col items-center justify-center gap-2 text-ink-400 hover:text-ink-600 transition-all group"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">New Story</span>
              </Link>
            </div>
          )}
        </div>

        {/* Recommended For You */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-midnight">Recommended For You</h2>
              {profile?.favorite_genres?.length > 0 && (
                <p className="text-xs text-ink-400 mt-0.5">
                  Based on: {profile.favorite_genres.join(', ')}
                </p>
              )}
            </div>
            <Link to="/browse" className="text-sm text-ink-500 hover:text-ink-700 font-medium">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommended.slice(0, 6).map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}