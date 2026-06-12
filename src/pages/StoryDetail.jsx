import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'


export default function StoryDetail() {
  const { id } = useParams()
  const story = DUMMY_STORIES.find(s => s.id === id) || DUMMY_STORIES[0]
  const chapters = DUMMY_CHAPTERS[story.id] || []
  const [voted, setVoted] = useState(false)
  const [inLibrary, setInLibrary] = useState(false)
  const [activeTab, setActiveTab] = useState('chapters')

  return (
    <div className="min-h-screen bg-parchment">

      {/* ── HERO BANNER ── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={story.cover}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/60 to-transparent" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── TOP CARD: floats over hero ── */}
        <div className="relative -mt-36 md:-mt-44 mb-8">
          <div className="bg-parchment rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-0">

              {/* Cover */}
              <div className="flex-shrink-0 flex justify-center md:justify-start p-6 pb-0 md:pb-6">
                <div className="relative">
                  <img
                    src={story.cover}
                    alt={story.title}
                    className="w-36 md:w-44 rounded-xl shadow-xl object-cover aspect-[3/4.2]"
                  />
                  {/* Status badge */}
                  <span className={`absolute -top-2 -right-2 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                    story.status === 'complete'
                      ? 'bg-green-500 text-white'
                      : 'bg-ink-500 text-parchment'
                  }`}>
                    {story.status === 'complete' ? 'Complete' : 'Ongoing'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-6 pt-4 md:pt-8">
                {/* Genre */}
                <span className="inline-block text-xs font-semibold text-ink-500 uppercase tracking-widest mb-2">
                  {story.genre}
                </span>

                {/* Title */}
                <h1 className="font-display text-2xl md:text-4xl font-bold text-midnight leading-tight mb-2">
                  {story.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-2 mb-4">
                  <img src={story.author_avatar} alt={story.author} className="w-6 h-6 rounded-full" />
                  <span className="text-sm text-ink-600 font-medium">@{story.author}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {story.tags.map(tag => (
                    <span key={tag} className="text-xs bg-ink-100 text-ink-700 px-2.5 py-1 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm">
                  {[
                    { icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', label: 'Reads', value: story.reads },
                    { icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Votes', value: story.votes, filled: true },
                    { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Chapters', value: story.chapters },
                  ].map(stat => (
                    <div key={stat.label} className="text-center bg-ink-50 rounded-xl p-3">
                      <svg className="w-4 h-4 mx-auto mb-1 text-ink-400" fill={stat.filled ? 'currentColor' : 'none'} stroke={stat.filled ? 'none' : 'currentColor'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                      </svg>
                      <p className="font-mono text-sm font-bold text-midnight">{stat.value}</p>
                      <p className="text-xs text-ink-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/story/${story.id}/chapter/1`}
                    className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-2.5 rounded-full hover:bg-ink-600 transition-all hover:scale-[1.02] text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Start Reading
                  </Link>

                  <button
                    onClick={() => setInLibrary(!inLibrary)}
                    className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full border transition-all text-sm ${
                      inLibrary
                        ? 'bg-ink-100 border-ink-300 text-ink-700'
                        : 'border-ink-300 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={inLibrary ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {inLibrary ? 'In Library' : 'Add to Library'}
                  </button>

                  <button
                    onClick={() => setVoted(!voted)}
                    className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full border transition-all text-sm ${
                      voted
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-ink-300 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {voted ? 'Voted!' : 'Vote'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 border-b border-ink-200 mb-6">
          {['chapters', 'about', 'comments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors relative ${
                activeTab === tab
                  ? 'text-ink-600'
                  : 'text-ink-400 hover:text-midnight'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: CHAPTERS ── */}
        {activeTab === 'chapters' && (
          <div className="grid gap-2 pb-16">
            {chapters.map((ch, i) => (
              <Link
                key={ch.number}
                to={`/story/${story.id}/chapter/${ch.number}`}
                className="group flex items-center gap-4 bg-white hover:bg-ink-50 border border-ink-200 hover:border-ink-300 rounded-xl px-5 py-4 transition-all"
              >
                {/* Chapter number */}
                <div className="w-10 h-10 rounded-lg bg-ink-100 group-hover:bg-ink-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <span className="font-mono text-sm font-bold text-ink-600">{String(ch.number).padStart(2, '0')}</span>
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-midnight group-hover:text-ink-700 transition-colors text-sm truncate">
                    {ch.title}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">{ch.read_time} · {ch.word_count.toLocaleString()} words</p>
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-ink-300 group-hover:text-ink-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* ── TAB: ABOUT ── */}
        {activeTab === 'about' && (
          <div className="max-w-2xl pb-16">
            <div className="bg-white border border-ink-200 rounded-2xl p-6 mb-4">
              <h3 className="font-display text-lg font-bold text-midnight mb-3">Description</h3>
              <p className="text-midnight/70 leading-relaxed text-sm">{story.description}</p>
            </div>
            <div className="bg-white border border-ink-200 rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold text-midnight mb-3">About the Author</h3>
              <div className="flex items-center gap-3">
                <img src={story.author_avatar} alt={story.author} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-semibold text-midnight">@{story.author}</p>
                  <p className="text-xs text-ink-400">Writer on Ashiwrites</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: COMMENTS ── */}
        {activeTab === 'comments' && (
          <div className="max-w-2xl pb-16">
            <div className="bg-white border border-ink-200 rounded-2xl p-6 text-center">
              <svg className="w-10 h-10 text-ink-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-ink-400 text-sm">Comments coming soon. Log in to be the first!</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}