import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-midnight text-parchment/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-ink-400 rounded-lg flex items-center justify-center">
                <span className="text-midnight font-display font-bold text-sm">A</span>
              </div>
              <span className="font-display font-bold text-xl text-parchment">Ashiwrites</span>
            </div>
            <p className="text-sm leading-relaxed">
              Where stories find their readers, and readers find their worlds.
            </p>
          </div>

          <div>
            <h4 className="text-parchment font-semibold text-sm mb-4">Discover</h4>
            <ul className="space-y-2 text-sm">
              {['Romance', 'Fantasy', 'Mystery', 'Thriller', 'Sci-Fi'].map(g => (
                <li key={g}>
                  <Link to={`/browse/${g.toLowerCase()}`} className="hover:text-parchment transition-colors">{g}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-parchment font-semibold text-sm mb-4">Create</h4>
            <ul className="space-y-2 text-sm">
              {['Start Writing', 'Writing Tips', 'Community', 'Contests'].map(item => (
                <li key={item}><a href="#" className="hover:text-parchment transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-parchment font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About', 'Privacy', 'Terms', 'Contact'].map(item => (
                <li key={item}><a href="#" className="hover:text-parchment transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 Ashiwrites. All rights reserved.</p>
          <p className="text-xs">Made with stories ✦</p>
        </div>
      </div>
    </footer>
  )
}
