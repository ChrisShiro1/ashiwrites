import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export default function MyStories() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchStories()
  }, [user])

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, chapters(count)')
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) toast.error(error.message)
    else setStories(data || [])
    setLoading(false)
  }

  const handleDelete = async (storyId, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(storyId)
    const { error } = await supabase.from('stories').delete().eq('id', storyId)
    if (error) toast.error(error.message)
    else {
      toast.success('Story deleted')
      setStories(prev => prev.filter(s => s.id !== storyId))
    }
    setDeleting(null)
  }

  const handleTogglePublish = async (story) => {
    const { error } = await supabase
      .from('stories')
      .update({ is_published: !story.is_published })
      .eq('id', story.id)

    if (error) toast.error(error.message)
    else {
      toast.success(story.is_published ? 'Story unpublished' : 'Story published! 🎉')
      setStories(prev => prev.map(s =>
        s.id === story.id ? { ...s, is_published: !s.is_published } : s
      ))
    }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-midnight">My Stories</h1>
            <p className="text-sm text-ink-400 mt-1">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</p>
          </div>
          <Link
            to="/write/new"
            className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-5 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Story
          </Link>
        </div>

        {/* Empty state */}
        {stories.length === 0 ? (
          <div className="bg-white border border-ink-200 rounded-2xl p-16 text-center">
            <svg className="w-14 h-14 text-ink-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="font-display text-xl font-bold text-midnight mb-2">No stories yet</h2>
            <p className="text-ink-400 text-sm mb-6">Your stories will appear here once you create them.</p>
            <Link
              to="/write/new"
              className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {stories.map(story => (
              <div
                key={story.id}
                className="bg-white border border-ink-200 rounded-2xl p-4 flex gap-4 hover:border-ink-300 transition-all"
              >
                {/* Cover */}
                <div className="flex-shrink-0 w-16 sm:w-20">
                  <div className="aspect-[3/4.2] rounded-lg overflow-hidden bg-ink-100">
                    {story.cover_url ? (
                      <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-midnight text-base leading-tight line-clamp-1">
                      {story.title || 'Untitled Story'}
                    </h3>
                    {/* Publish badge */}
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      story.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-ink-100 text-ink-500'
                    }`}>
                      {story.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-xs text-ink-400 mb-2">
                    {story.genre || 'No genre'} · {story.chapters?.[0]?.count || 0} chapters
                  </p>

                  {story.description && (
                    <p className="text-sm text-midnight/60 line-clamp-2 mb-3 hidden sm:block">
                      {story.description}
                    </p>
                  )}

                  {/* Tags */}
                  {story.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-xs bg-ink-100 text-ink-500 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/write/${story.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-ink-500 text-parchment px-3 py-1.5 rounded-full hover:bg-ink-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </Link>

                    <button
                      onClick={() => handleTogglePublish(story)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        story.is_published
                          ? 'border-ink-300 text-ink-600 hover:bg-ink-50'
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                          story.is_published
                            ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                            : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        } />
                      </svg>
                      {story.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    {story.is_published && (
                      <Link
                        to={`/story/${story.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View
                      </Link>
                    )}

                    <button
                      onClick={() => handleDelete(story.id, story.title)}
                      disabled={deleting === story.id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deleting === story.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}