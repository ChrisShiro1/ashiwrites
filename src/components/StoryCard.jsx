import { Link } from 'react-router-dom'

export default function StoryCard({ story, size = 'md' }) {
  const isLarge = size === 'lg'

  return (
    <Link
      to={`/story/${story.id}`}
      className="group block"
    >
      <div className={`relative overflow-hidden rounded-xl bg-ink-100 ${isLarge ? 'aspect-[3/4.2]' : 'aspect-[3/4.2]'} mb-3`}>
        <img
          src={story.cover}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            story.status === 'complete'
              ? 'bg-green-100 text-green-800'
              : story.status === 'hiatus'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-ink-100/90 text-ink-700'
          }`}>
            {story.status === 'complete' ? 'Complete' : story.status === 'hiatus' ? 'Hiatus' : 'Ongoing'}
          </span>
        </div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex items-center gap-3 text-white/90 text-xs font-medium">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {story.reads}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {story.votes}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className={`font-display font-semibold text-midnight leading-tight group-hover:text-ink-600 transition-colors line-clamp-1 ${isLarge ? 'text-base' : 'text-sm'}`}>
          {story.title}
        </h3>
        <p className="text-xs text-ink-500 font-medium">by {story.author}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {story.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
