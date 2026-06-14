import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export default function MyStories() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState(null)
  const menuRef = useRef()

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchStories()
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchStories = async () => {
    const { data } = await supabase
      .from('stories')
      .select('*, chapters(count)')
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })
    setStories(data || [])
    setLoading(false)
  }

  const handleTogglePublish = async (story) => {
    const { error } = await supabase
      .from('stories')
      .update({ is_published: !story.is_published })
      .eq('id', story.id)
    if (error) toast.error(error.message)
    else {
      setStories(prev => prev.map(s =>
        s.id === story.id ? { ...s, is_published: !s.is_published } : s
      ))
      toast.success(story.is_published ? 'Story unpublished' : 'Story published! 🎉')
    }
    setOpenMenu(null)
  }

  const handleDelete = async (story) => {
    if (!confirm(`Delete "${story.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('stories').delete().eq('id', story.id)
    if (error) toast.error(error.message)
    else {
      setStories(prev => prev.filter(s => s.id !== story.id))
      toast.success('Story deleted')
    }
    setOpenMenu(null)
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-midnight">My Stories</h1>
          <Link
            to="/write/new"
            className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-4 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Story
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">✍️</p>
            <p className="font-display text-xl font-bold text-midnight mb-2">No stories yet</p>
            <p className="text-ink-400 text-sm mb-6">Start writing your first story!</p>
            <Link to="/write/new"
              className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-600 transition-colors text-sm">
              Create Story
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4" ref={menuRef}>
            {stories.map(story => {
              const chapterCount = story.chapters?.[0]?.count || 0
              const draftCount = 0 // simplified
              return (
                <div key={story.id} className="bg-white border border-ink-200 rounded-2xl p-4 sm:p-5 flex gap-4 items-start hover:border-ink-300 hover:shadow-sm transition-all">

                  {/* Cover */}
                  <Link to={`/write/${story.id}`} className="flex-shrink-0">
                    <div className="w-16 sm:w-20 aspect-[3/4.2] rounded-xl overflow-hidden bg-ink-100">
                      {story.cover_url ? (
                        <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ink-300 to-ink-500">
                          <span className="text-parchment font-display font-bold text-xl">
                            {story.title?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/write/${story.id}`}>
                      <h3 className="font-display font-bold text-midnight text-base sm:text-lg truncate hover:text-ink-600 transition-colors">
                        {story.title || 'Untitled Story'}
                      </h3>
                    </Link>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
                      {!story.is_published && <span className="ml-2 text-amber-500 font-medium">· Draft</span>}
                      {story.is_published && <span className="ml-2 text-green-500 font-medium">· Published</span>}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Updated {new Date(story.updated_at || story.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {story.reads || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {story.votes || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 relative">
                    {/* Continue writing button */}
                    <Link
                      to={`/write/${story.id}`}
                      className="hidden sm:flex items-center gap-1.5 bg-ink-500 text-parchment font-semibold px-4 py-2 rounded-full hover:bg-ink-600 transition-colors text-sm"
                    >
                      Continue writing
                    </Link>

                    {/* 3-dot menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === story.id ? null : story.id)}
                        className="w-9 h-9 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition-colors text-ink-500"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                        </svg>
                      </button>

                      {openMenu === story.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-ink-200 rounded-xl shadow-xl z-20 overflow-hidden">
                          <Link
                            to={`/write/${story.id}`}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors sm:hidden"
                            onClick={() => setOpenMenu(null)}
                          >
                            ✏️ Continue writing
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(story)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors text-left"
                          >
                            {story.is_published ? '🔒 Unpublish' : '🌐 Publish'}
                          </button>
                          <Link
                            to={`/profile/${user?.user_metadata?.username}`}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-midnight hover:bg-ink-50 transition-colors"
                            onClick={() => setOpenMenu(null)}
                          >
                            👁️ View as reader
                          </Link>
                          <div className="border-t border-ink-100" />
                          <button
                            onClick={() => handleDelete(story)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                          >
                            🗑️ Delete story
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}