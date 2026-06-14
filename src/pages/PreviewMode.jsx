import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PreviewMode() {
  const { storyId, chapterId } = useParams()
  const [story, setStory] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [author, setAuthor] = useState(null)
  const [allChapters, setAllChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [storyId, chapterId])

  const fetchData = async () => {
    const { data: storyData } = await supabase
      .from('stories')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('id', storyId)
      .single()

    const { data: chapterData } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('id, title, chapter_number, is_published')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true })

    setStory(storyData)
    setChapter(chapterData)
    setAuthor(storyData?.profiles)
    setAllChapters(chaptersData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentIndex = allChapters.findIndex(c => c.id === chapterId)
  const nextChapter = allChapters[currentIndex + 1]
  const prevChapter = allChapters[currentIndex - 1]

  return (
    <div className="min-h-screen bg-white">

      {/* Preview banner */}
      <div className="bg-amber-400 text-midnight text-center text-xs font-bold py-2 px-4">
        👁️ Reader Preview — save your chapter to see the latest changes
        <button onClick={() => window.close()} className="ml-3 underline hover:no-underline">
          Close preview
        </button>
      </div>

      {/* Wattpad-style top nav */}
      <div className="sticky top-0 z-40 bg-white border-b border-ink-100 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-8 h-12">
          <div className="flex items-center gap-3">
            <button onClick={() => window.close()} className="text-ink-400 hover:text-midnight transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-ink-400 truncate max-w-[160px] sm:max-w-xs">{story?.title}</p>
              <p className="text-sm font-bold text-midnight truncate max-w-[160px] sm:max-w-xs">{chapter?.title}</p>
            </div>
          </div>
          <Link
            to={`/write/${storyId}`}
            className="text-xs font-semibold text-ink-500 border border-ink-200 px-3 py-1.5 rounded-full hover:bg-ink-50 transition-colors"
          >
            ✏️ Edit part
          </Link>
        </div>
      </div>

      {/* Chapter cover image */}
      {chapter?.cover_url && (
        <div className="w-full bg-ink-100" style={{ maxHeight: '400px', overflow: 'hidden' }}>
          <img
            src={chapter.cover_url}
            alt="Chapter cover"
            className="w-full object-cover"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}

      {/* Chapter header */}
      <div className="max-w-2xl mx-auto px-6 sm:px-8 pt-10 pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-midnight text-center mb-4 leading-tight">
          {chapter?.title}
          {!chapter?.is_published && (
            <span className="ml-3 text-sm font-normal text-ink-400">(Draft)</span>
          )}
        </h1>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-ink-400 mb-6">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {chapter?.reads || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {chapter?.votes || 0}
          </span>
        </div>

        <hr className="border-ink-100 mb-8" />

        {/* Author */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src={author?.avatar_url || `https://api.dicebear.com/8.x/adventurer/svg?seed=${author?.username}`}
            alt={author?.display_name}
            className="w-12 h-12 rounded-full object-cover bg-ink-100"
          />
          <div>
            <p className="text-xs text-ink-400">by</p>
            <p className="font-semibold text-midnight text-sm">{author?.display_name || author?.username}</p>
          </div>
        </div>
      </div>

      {/* Chapter content */}
      <div className="max-w-2xl mx-auto px-6 sm:px-8 pb-16">
        <div
          className="text-midnight leading-relaxed"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '17px',
            lineHeight: '1.9',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
          dangerouslySetInnerHTML={{
            __html: chapter?.content || '<p style="color:#999;font-style:italic">Nothing written yet...</p>'
          }}
        />
      </div>

      {/* Continue to next part — Wattpad style */}
      <div className="border-t border-ink-100 py-8 px-6">
        <div className="max-w-2xl mx-auto">
          {nextChapter ? (
            <Link
              to={`/preview/${storyId}/${nextChapter.id}`}
              className="block w-full text-center bg-midnight text-parchment font-bold py-4 rounded-2xl hover:bg-ink-700 transition-colors text-base"
            >
              Continue to next part
            </Link>
          ) : (
            <div className="text-center">
              <p className="text-ink-400 text-sm font-medium mb-4">You've reached the end of published parts.</p>
              <Link
                to={`/write/${storyId}`}
                className="inline-block bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-600 transition-colors text-sm"
              >
                Back to Editor
              </Link>
            </div>
          )}

          {/* Chapter navigation */}
          {(prevChapter || nextChapter) && (
            <div className="flex items-center justify-between mt-4 gap-3">
              {prevChapter ? (
                <Link
                  to={`/preview/${storyId}/${prevChapter.id}`}
                  className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-midnight transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {prevChapter.title}
                </Link>
              ) : <div />}
              {nextChapter && (
                <Link
                  to={`/preview/${storyId}/${nextChapter.id}`}
                  className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-midnight transition-colors"
                >
                  {nextChapter.title}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}