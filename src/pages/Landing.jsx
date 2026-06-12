import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StoryCard from '../components/StoryCard'
import { DUMMY_STORIES, GENRES, TRENDING_TAGS } from '../data/stories'

const GENRE_ICONS = {
  Romance: '🌹', Fantasy: '✨', Mystery: '🔍', Thriller: '⚡',
  Horror: '🌑', 'Sci-Fi': '🚀', Historical: '📜', 'Teen Fiction': '🎒',
  Adventure: '🗺️', Poetry: '🪶'
}

export default function Landing() {
  const [activeGenre, setActiveGenre] = useState('All')
  const [heroIndex, setHeroIndex] = useState(0)
  const heroStory = DUMMY_STORIES[heroIndex]
  const filteredStories = activeGenre === 'All'
    ? DUMMY_STORIES
    : DUMMY_STORIES.filter(s => s.genre === activeGenre)

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % DUMMY_STORIES.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-midnight min-h-[80vh] flex items-center">

        {/* Ambient background from cover art */}
        <div
          key={heroIndex}
          className="absolute inset-0 transition-all duration-1000"
          style={{
            backgroundImage: `url(${heroStory.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) brightness(0.25) saturate(1.5)',
            transform: 'scale(1.1)',
          }}
        />

        {/* Decorative grain overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

          {/* Text side */}
          <div className="text-parchment">
            {/* Label */}
            <div className="inline-flex items-center gap-2 bg-ink-500/20 border border-ink-400/30 rounded-full px-4 py-1.5 text-xs font-semibold text-ink-300 mb-8 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-pulse" />
              Featured Story
            </div>

            <div
              key={heroIndex}
              className="animate-fade-in"
            >
              <div className="inline-block bg-ink-500/30 text-ink-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {heroStory.genre}
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-none mb-6">
                {heroStory.title}
              </h1>

              <p className="text-sm text-parchment/60 mb-2">
                by <span className="text-parchment/80 font-medium">@{heroStory.author}</span>
              </p>

              <p className="text-parchment/70 text-lg leading-relaxed mb-8 max-w-lg">
                {heroStory.description}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 mb-10 text-sm text-parchment/50">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {heroStory.reads} reads
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {heroStory.votes} votes
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {heroStory.chapters} chapters
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to={`/story/${heroStory.id}/chapter/1`}
                  className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Start Reading
                </Link>
                <Link
                  to={`/story/${heroStory.id}`}
                  className="inline-flex items-center gap-2 text-parchment/60 hover:text-parchment text-sm font-medium transition-colors"
                >
                  View details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Slide dots */}
            <div className="flex items-center gap-2 mt-10">
              {DUMMY_STORIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === heroIndex ? 'w-8 bg-ink-400' : 'w-2 bg-parchment/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Cover side */}
          <div className="hidden lg:flex justify-center items-center">
            <div
              key={heroIndex}
              className="relative animate-slide-up"
            >
              {/* Shadow stack */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-ink-500/20 rotate-3" />
              <div className="absolute -bottom-2 -right-2 w-full h-full rounded-2xl bg-ink-300/10 rotate-1.5" />
              <img
                src={heroStory.cover}
                alt={heroStory.title}
                className="relative w-64 xl:w-72 rounded-2xl shadow-2xl object-cover aspect-[3/4.2]"
              />
              {/* Tags overlay */}
              <div className="absolute -left-4 bottom-16 flex flex-col gap-2">
                {heroStory.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="text-xs bg-midnight/80 backdrop-blur-sm text-parchment/80 px-3 py-1 rounded-full border border-white/10"
                    style={{ transform: `translateX(${i * -8}px)` }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING TAGS ─────────────────────────────────── */}
      <section className="bg-ink-900 py-4 overflow-x-auto">
        <div className="flex items-center gap-3 max-w-7xl mx-auto px-6 whitespace-nowrap">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-widest flex-shrink-0">Trending</span>
          {TRENDING_TAGS.map(tag => (
            <Link
              key={tag}
              to={`/browse?tag=${tag}`}
              className="text-xs text-parchment/50 hover:text-parchment transition-colors border border-white/10 hover:border-white/20 rounded-full px-3 py-1 flex-shrink-0"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      {/* ── BROWSE BY GENRE ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-midnight">Browse by Genre</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {GENRES.map(genre => (
            <Link
              key={genre}
              to={`/browse/${genre.toLowerCase().replace(' ', '-')}`}
              className="group relative overflow-hidden bg-white border border-ink-200 rounded-2xl p-4 text-center hover:border-ink-400 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">{GENRE_ICONS[genre] || '📖'}</div>
              <span className="text-sm font-semibold text-midnight group-hover:text-ink-600 transition-colors">{genre}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── STORY GRID: ALL STORIES ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-midnight">Handpicked for You</h2>
          <Link to="/browse" className="text-sm text-ink-500 hover:text-ink-700 font-medium flex items-center gap-1">
            See all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Genre filter pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['All', ...GENRES.slice(0, 7)].map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full flex-shrink-0 transition-all ${
                activeGenre === g
                  ? 'bg-midnight text-parchment'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* ── FEATURED HORIZONTAL CARD ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20">
        <div className="relative overflow-hidden bg-midnight rounded-3xl p-8 md:p-12">
          {/* BG decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10"
            style={{
              background: 'radial-gradient(circle, #c97d1e 0%, transparent 70%)',
            }}
          />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-ink-500/20 border border-ink-400/30 rounded-full px-4 py-1.5 text-xs font-semibold text-ink-300 mb-6 uppercase tracking-wider">
                Complete Story
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-parchment mb-4 leading-tight">
                The Last Oracle
              </h2>
              <p className="text-parchment/60 text-sm leading-relaxed mb-6">
                Every generation, one child is born who can see the end of the world. Mira never wanted to be that child.
              </p>
              <div className="flex items-center gap-6 text-sm text-parchment/40 mb-8">
                <span>5.1M reads</span>
                <span>412K votes</span>
                <span>5 chapters</span>
              </div>
              <Link
                to="/story/2/chapter/1"
                className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-400 transition-colors"
              >
                Read Now — It's Free
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://picsum.photos/seed/oracle/300/420"
                alt="The Last Oracle"
                className="w-40 md:w-52 rounded-xl shadow-2xl object-cover aspect-[3/4.2]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-4">
        <div className="text-center bg-ink-50 rounded-3xl p-12 md:p-16 border border-ink-200">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-4">For Writers</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-midnight mb-4 leading-tight">
            Your story deserves<br/>to be read.
          </h2>
          <p className="text-ink-500 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of writers sharing their stories. No experience required — just words.
          </p>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-8 py-3.5 rounded-full hover:bg-ink-600 transition-all hover:scale-[1.02] text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Start Writing Today
          </Link>
        </div>
      </section>

    </div>
  )
}