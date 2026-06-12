import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'


const THEMES = {
  parchment: {
    name: 'Parchment',
    bg: '#fdf6e9',
    text: '#0f0e17',
    muted: '#a35e12',
    border: '#f2d5a8',
    nav: '#fdf6e9',
  },
  white: {
    name: 'White',
    bg: '#ffffff',
    text: '#1a1a2e',
    muted: '#6b7280',
    border: '#e5e7eb',
    nav: '#ffffff',
  },
  dark: {
    name: 'Dark',
    bg: '#0f0e17',
    text: '#fdf6e9',
    muted: '#e8b86d',
    border: '#2a2940',
    nav: '#0f0e17',
  },
  sepia: {
    name: 'Sepia',
    bg: '#f4ecd8',
    text: '#3b2f1e',
    muted: '#7d5a3c',
    border: '#d4b896',
    nav: '#f4ecd8',
  },
}

const FONT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl']
const FONT_SIZE_LABELS = ['S', 'M', 'L', 'XL']

export default function ReadMode() {
  const { id, num } = useParams()
  const navigate = useNavigate()
  const story = DUMMY_STORIES.find(s => s.id === id) || DUMMY_STORIES[0]
  const chapters = DUMMY_CHAPTERS[story.id] || []
  const chapterNum = parseInt(num) || 1
  const chapter = chapters.find(c => c.number === chapterNum) || chapters[0]
  const prevChapter = chapters.find(c => c.number === chapterNum - 1)
  const nextChapter = chapters.find(c => c.number === chapterNum + 1)

  const [theme, setTheme] = useState('parchment')
  const [fontSizeIdx, setFontSizeIdx] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [navVisible, setNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const t = THEMES[theme]

  // Scroll progress + hide/show nav
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0)
      setNavVisible(scrollY < lastScrollY || scrollY < 80)
      setLastScrollY(scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close panels on outside click
  useEffect(() => {
    const close = () => { setShowSettings(false); setShowChapters(false) }
    if (showSettings || showChapters) {
      setTimeout(() => document.addEventListener('click', close), 100)
      return () => document.removeEventListener('click', close)
    }
  }, [showSettings, showChapters])

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-ink-400">Chapter not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg, color: t.text }}>

      {/* ── PROGRESS BAR ── */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: t.border }}>
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${scrollProgress}%`, background: '#c97d1e' }}
        />
      </div>

      {/* ── TOP NAV ── */}
      <div
        className="fixed top-0.5 left-0 right-0 z-40 transition-transform duration-300"
        style={{
          background: t.nav,
          borderBottom: `1px solid ${t.border}`,
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Back */}
          <Link
            to={`/story/${story.id}`}
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity opacity-60 hover:opacity-100 flex-shrink-0"
            style={{ color: t.text }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:block">{story.title}</span>
          </Link>

          {/* Center: chapter info */}
          <div className="flex-1 text-center">
            <p className="text-xs font-semibold truncate" style={{ color: t.muted }}>
              Chapter {chapter.number} of {chapters.length}
            </p>
            <p className="text-xs truncate opacity-60" style={{ color: t.text }}>{chapter.title}</p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Chapters list */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowChapters(!showChapters); setShowSettings(false) }}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: t.text }}
                title="Chapters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>

              {showChapters && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl overflow-hidden z-50"
                  style={{ background: t.nav, border: `1px solid ${t.border}` }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 border-b" style={{ borderColor: t.border }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t.muted }}>Chapters</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {chapters.map(ch => (
                      <button
                        key={ch.number}
                        onClick={() => { navigate(`/story/${story.id}/chapter/${ch.number}`); setShowChapters(false) }}
                        className="w-full text-left px-4 py-3 text-sm transition-opacity hover:opacity-70 flex items-center gap-3"
                        style={{
                          color: t.text,
                          background: ch.number === chapterNum ? t.border : 'transparent',
                          fontWeight: ch.number === chapterNum ? '600' : '400',
                        }}
                      >
                        <span className="font-mono text-xs opacity-50">{String(ch.number).padStart(2, '0')}</span>
                        <span className="truncate">{ch.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowSettings(!showSettings); setShowChapters(false) }}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: t.text }}
                title="Reading settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              {showSettings && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-xl p-4 z-50"
                  style={{ background: t.nav, border: `1px solid ${t.border}` }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Theme */}
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.muted }}>Theme</p>
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {Object.entries(THEMES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
                        style={{
                          border: `2px solid ${theme === key ? '#c97d1e' : t.border}`,
                          background: val.bg,
                        }}
                      >
                        <div className="w-5 h-5 rounded-full" style={{ background: val.bg, border: `2px solid ${val.border}` }} />
                        <span className="text-xs font-medium" style={{ color: val.text, fontSize: '10px' }}>{val.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Font size */}
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.muted }}>Font Size</p>
                  <div className="flex items-center gap-2">
                    {FONT_SIZE_LABELS.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => setFontSizeIdx(i)}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: fontSizeIdx === i ? '#c97d1e' : t.border,
                          color: fontSizeIdx === i ? '#fdf6e9' : t.text,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CHAPTER CONTENT ── */}
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-32">

        {/* Chapter header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: t.muted }}>
            Chapter {chapter.number}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: t.text }}>
            {chapter.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs" style={{ color: t.muted }}>
            <span>{chapter.read_time}</span>
            <span>·</span>
            <span>{chapter.word_count.toLocaleString()} words</span>
          </div>
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16" style={{ background: t.border }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.muted, opacity: 0.5 }} />
            <div className="h-px w-16" style={{ background: t.border }} />
          </div>
        </div>

        {/* Chapter body */}
        <div
          className={`leading-relaxed ${FONT_SIZES[fontSizeIdx]} space-y-6`}
          style={{ color: t.text, fontFamily: '"DM Sans", sans-serif' }}
        >
          {chapter.content.split('\n\n').map((para, i) => (
            para.trim() && (
              <p key={i} className="leading-[1.9]">
                {para}
              </p>
            )
          ))}
        </div>

        {/* ── END OF CHAPTER ── */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-16" style={{ background: t.border }} />
            <span className="text-lg" style={{ color: t.muted }}>✦</span>
            <div className="h-px w-16" style={{ background: t.border }} />
          </div>

          <p className="text-sm mb-6" style={{ color: t.muted }}>End of Chapter {chapter.number}</p>

          {/* Prev / Next */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {prevChapter ? (
              <Link
                to={`/story/${story.id}/chapter/${prevChapter.number}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                style={{ border: `1.5px solid ${t.border}`, color: t.text }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            ) : <div />}

            {nextChapter ? (
              <Link
                to={`/story/${story.id}/chapter/${nextChapter.number}`}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: '#c97d1e', color: '#fdf6e9' }}
              >
                Next Chapter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="px-6 py-2.5 rounded-full text-sm font-semibold opacity-40" style={{ border: `1.5px solid ${t.border}`, color: t.text }}>
                Last Chapter
              </div>
            )}
          </div>

          {/* Back to story */}
          <Link
            to={`/story/${story.id}`}
            className="inline-block mt-6 text-sm transition-opacity opacity-50 hover:opacity-80"
            style={{ color: t.text }}
          >
            ← Back to story details
          </Link>
        </div>
      </div>

      {/* ── BOTTOM FIXED NAV (mobile-friendly) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300"
        style={{ background: t.nav, borderTop: `1px solid ${t.border}` }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {prevChapter ? (
            <Link
              to={`/story/${story.id}/chapter/${prevChapter.number}`}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity opacity-60 hover:opacity-100"
              style={{ color: t.text }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Ch. {prevChapter.number}
            </Link>
          ) : <div />}

          {/* Progress */}
          <span className="text-xs font-mono" style={{ color: t.muted }}>
            {Math.round(scrollProgress)}% read
          </span>

          {nextChapter ? (
            <Link
              to={`/story/${story.id}/chapter/${nextChapter.number}`}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity opacity-60 hover:opacity-100"
              style={{ color: t.text }}
            >
              Ch. {nextChapter.number}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div />}
        </div>
      </div>

    </div>
  )
}