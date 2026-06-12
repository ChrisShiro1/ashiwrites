import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DUMMY_STORIES, GENRES } from '../data/stories'

const SORT_OPTIONS = ['Hot', 'New', 'Completed']
const GENRE_ICONS = {
  Romance: '🌹', Fantasy: '✨', Mystery: '🔍', Thriller: '⚡',
  Horror: '🌑', 'Sci-Fi': '🚀', Historical: '📜', 'Teen Fiction': '🎒',
  Adventure: '🗺️', Poetry: '🪶'
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState('Hot')
  const [view, setView] = useState('list')
  const [dbStories, setDbStories] = useState([])
  const [loading, setLoading] = useState(true)

  const genreParam = searchParams.get('genre')
  const searchQuery = searchParams.get('q')

  const activeGenre = genreParam
    ? GENRES.find(g => g.toLowerCase().replace(' ', '-') === genreParam) || null
    : null

  useEffect(() => {
    fetchStories()
  }, [activeGenre, searchQuery, sort])

  const fetchStories = async () => {
    setLoading(true)
    let query = supabase
      .from('stories')
      .select('*, profiles(username, avatar_url)')
      .eq('is_published', true)

    if (activeGenre) query = query.eq('genre', activeGenre)
    if (sort === 'Completed') query = query.eq('status', 'complete')
    if (sort === 'New') query = query.order('created_at', { ascending: false })
    else query = query.order('reads', { ascending: false })

    const { data } = await query
    setDbStories(data || [])
    setLoading(false)
  }

  // Merge DB stories + dummy stories, filter by search
  const allStories = [
    ...dbStories.map(s => ({
      ...s,
      cover: s.cover_url,
      author: s.profiles?.username || 'unknown',
      votes: s.votes || 0,
      reads: s.reads || 0,
      chapters: s.chapter_count || 0,
      tags: s.tags || [],
    })),
    ...DUMMY_STORIES,
  ]

  const filtered = allStories.filter(story => {
    if (activeGenre && story.genre !== activeGenre) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return story.title?.toLowerCase().includes(q) ||
             story.description?.toLowerCase().includes(q) ||
             story.author?.toLowerCase().includes(q)
    }
    if (sort === 'Completed' && story.status !== 'complete') return false
    return true
  })

  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          {searchQuery ? (
            <>
              <p className="text-sm text-ink-400 mb-1">Search results for</p>
              <h1 className="font-display text-3xl font-bold text-midnight">"{searchQuery}"</h1>
              <p className="text-sm text-ink-400 mt-1">{filtered.length} stories found</p>
            </>
          ) : activeGenre ? (
            <>
              <div className="text-3xl mb-2">{GENRE_ICONS[activeGenre]}</div>
              <h1 className="font-display text-3xl font-bold text-midnight">{activeGenre} Stories</h1>
              <p className="text-sm text-ink-400 mt-1">{filtered.length} stories</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-midnight">Browse Stories</h1>
              <p className="text-sm text-ink-400 mt-1">Discover your next favorite read</p>
            </>
          )}
        </div>

        {/* Genre pills */}
        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
            <button
              onClick={() => setSearchParams({})}
              className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                !activeGenre ? 'bg-midnight text-parchment' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              All
            </button>
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setSearchParams({ genre: g.toLowerCase().replace(' ', '-') })}
                className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                  activeGenre === g ? 'bg-midnight text-parchment' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {GENRE_ICONS[g]} {g}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ink-500">
            <span className="font-semibold text-midnight">{filtered.length}</span> stories
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-ink-100 rounded-full p-1">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => setSort(option)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    sort === option ? 'bg-parchment text-midnight shadow-sm' : 'text-ink-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-ink-100 rounded-full p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-full transition-all ${view === 'grid' ? 'bg-parchment shadow-sm' : 'text-ink-400'}`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3A1.5 1.5 0 0115 10.5v3A1.5 1.5 0 0113.5 15h-3A1.5 1.5 0 019 13.5v-3z"/>
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-full transition-all ${view === 'list' ? 'bg-parchment shadow-sm' : 'text-ink-400'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-display text-xl font-bold text-midnight mb-2">No stories found</p>
            <p className="text-ink-400 text-sm">Try a different genre or search term</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(story => (
              <Link key={story.id} to={`/story/${story.id}`} className="group block">
                <div className="aspect-[3/4.2] rounded-xl bg-ink-100 overflow-hidden mb-2 relative">
                  <img
                    src={story.cover || story.cover_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    story.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-ink-100/90 text-ink-700'
                  }`}>
                    {story.status === 'complete' ? 'Complete' : 'Ongoing'}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-midnight truncate group-hover:text-ink-600">{story.title}</h3>
                <p className="text-xs text-ink-400">by {story.author}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((story, i) => (
              <Link
                key={story.id}
                to={`/story/${story.id}`}
                className="group flex gap-4 bg-white border border-ink-200 hover:border-ink-300 rounded-2xl p-4 transition-all hover:shadow-md"
              >
                <div className="hidden sm:flex w-8 flex-shrink-0 items-start justify-center pt-1">
                  <span className={`font-mono font-bold text-sm ${i < 3 ? 'text-ink-500' : 'text-ink-300'}`}>
                    {i + 1}
                  </span>
                </div>
                <div className="flex-shrink-0 w-16 sm:w-20">
                  <div className="aspect-[3/4.2] rounded-lg overflow-hidden bg-ink-100">
                    <img
                      src={story.cover || story.cover_url || `https://picsum.photos/seed/${story.id}/300/420`}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-ink-500">{story.genre}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      story.status === 'complete' ? 'bg-green-100 text-green-700'
                      : story.status === 'hiatus' ? 'bg-amber-100 text-amber-700'
                      : 'bg-ink-100 text-ink-600'
                    }`}>
                      {story.status === 'complete' ? 'Complete' : story.status === 'hiatus' ? 'Hiatus' : 'Ongoing'}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-midnight text-base sm:text-lg leading-tight mb-0.5 group-hover:text-ink-600 transition-colors line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-xs text-ink-500 mb-2">by <span className="font-medium">@{story.author}</span></p>
                  <p className="text-sm text-midnight/60 leading-relaxed line-clamp-2 mb-3 hidden sm:block">
                    {story.description}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {story.reads}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {story.votes}
                    </span>
                    {story.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-ink-100 text-ink-500 px-2 py-0.5 rounded-full hidden sm:inline">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center self-center">
                  <svg className="w-4 h-4 text-ink-300 group-hover:text-ink-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}