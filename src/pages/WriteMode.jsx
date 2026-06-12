import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const GENRES = [
  'Romance', 'Fantasy', 'Mystery', 'Thriller', 'Horror',
  'Sci-Fi', 'Historical', 'Teen Fiction', 'Adventure', 'Poetry'
]

const STATUS_OPTIONS = ['ongoing', 'complete', 'hiatus']

// Simple Rich Text Toolbar
function EditorToolbar({ onFormat, onInsertImage }) {
  const tools = [
    { label: 'B', cmd: 'bold', title: 'Bold' },
    { label: 'I', cmd: 'italic', title: 'Italic' },
    { label: 'U', cmd: 'underline', title: 'Underline' },
    { label: '"', cmd: 'blockquote', title: 'Quote' },
  ]

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-ink-200 bg-ink-50/50">
      {tools.map(tool => (
        <button
          key={tool.cmd}
          onMouseDown={e => { e.preventDefault(); onFormat(tool.cmd) }}
          title={tool.title}
          className={`w-8 h-8 rounded-lg text-sm font-bold text-ink-600 hover:bg-ink-200 transition-colors flex items-center justify-center ${
            tool.label === 'B' ? 'font-extrabold' :
            tool.label === 'I' ? 'italic' :
            tool.label === 'U' ? 'underline' : ''
          }`}
        >
          {tool.label}
        </button>
      ))}
      <div className="w-px h-5 bg-ink-200 mx-1" />
      {[
        { title: 'Align Left', cmd: 'justifyLeft', icon: 'M4 6h16M4 12h10M4 18h16' },
        { title: 'Align Center', cmd: 'justifyCenter', icon: 'M4 6h16M7 12h10M4 18h16' },
        { title: 'Align Right', cmd: 'justifyRight', icon: 'M4 6h16M10 12h10M4 18h16' },
      ].map(tool => (
        <button
          key={tool.cmd}
          onMouseDown={e => { e.preventDefault(); onFormat(tool.cmd) }}
          title={tool.title}
          className="w-8 h-8 rounded-lg text-ink-600 hover:bg-ink-200 transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
          </svg>
        </button>
      ))}
      <div className="w-px h-5 bg-ink-200 mx-1" />
      {/* Insert Image */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={onInsertImage}
        title="Insert Image"
        className="w-8 h-8 rounded-lg text-ink-600 hover:bg-ink-200 transition-colors flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <div className="w-px h-5 bg-ink-200 mx-1" />
      {/* Font size */}
      <select
        onMouseDown={e => e.stopPropagation()}
        onChange={e => onFormat('fontSize', e.target.value)}
        className="text-xs text-ink-600 bg-transparent border-none outline-none cursor-pointer"
        defaultValue="3"
      >
        <option value="2">Small</option>
        <option value="3">Normal</option>
        <option value="4">Large</option>
        <option value="5">Larger</option>
      </select>
    </div>
  )
}

export default function WriteMode() {
  const { storyId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isNew = storyId === 'new'

  // Story state
  const [story, setStory] = useState({
    title: '',
    description: '',
    genre: '',
    tags: [],
    status: 'ongoing',
    cover_url: null,
    is_published: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)

  // Chapters state
  const [chapters, setChapters] = useState([])
  const [activeChapter, setActiveChapter] = useState(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedStoryId, setSavedStoryId] = useState(isNew ? null : storyId)

  // Active tab
  const [tab, setTab] = useState('details')
  const [showPreview, setShowPreview] = useState(false)

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef()

  const editorRef = useRef()

  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (!isNew) fetchStory()
  }, [user, storyId])

  const fetchStory = async () => {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()
    if (data) {
      setStory(data)
      setCoverPreview(data.cover_url)
      setSavedStoryId(data.id)
    }
    fetchChapters()
  }

  const fetchChapters = async () => {
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true })
    setChapters(data || [])
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Cover must be under 5MB'); return }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const uploadCover = async (storyId) => {
    if (!coverFile) return story.cover_url
    setUploadingCover(true)
    const ext = coverFile.name.split('.').pop()
    const path = `covers/${storyId}.${ext}`
    const { error } = await supabase.storage.from('covers').upload(path, coverFile, { upsert: true })
    if (error) { toast.error('Cover upload failed'); return null }
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    setUploadingCover(false)
    return data.publicUrl
  }

  const handleSaveStory = async () => {
    if (!story.title.trim()) { toast.error('Title is required'); return }
    if (!story.genre) { toast.error('Please select a genre'); return }
    setSaving(true)

    try {
      let coverUrl = story.cover_url

      if (isNew || !savedStoryId) {
        const { data: newStory, error } = await supabase
          .from('stories')
          .insert({ ...story, author_id: user.id, cover_url: null })
          .select()
          .single()
        if (error) throw error
        setSavedStoryId(newStory.id)

        if (coverFile) {
          coverUrl = await uploadCover(newStory.id)
          await supabase.from('stories').update({ cover_url: coverUrl }).eq('id', newStory.id)
        }
        toast.success('Story created! 🎉')
        navigate(`/write/${newStory.id}`, { replace: true })
      } else {
        if (coverFile) coverUrl = await uploadCover(savedStoryId)
        const { error } = await supabase
          .from('stories')
          .update({ ...story, cover_url: coverUrl })
          .eq('id', savedStoryId)
        if (error) throw error
        toast.success('Story saved!')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (tag && !story.tags.includes(tag) && story.tags.length < 8) {
        setStory(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setStory(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  // Chapter functions
  const handleNewChapter = async () => {
    if (!savedStoryId) { toast.error('Save story details first!'); return }
    const num = chapters.length + 1
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        story_id: savedStoryId,
        chapter_number: num,
        title: `Chapter ${num}`,
        content: '',
        is_published: false,
      })
      .select()
      .single()
    if (error) { toast.error(error.message); return }
    setChapters(prev => [...prev, data])
    setActiveChapter(data)
    setChapterTitle(data.title)
    if (editorRef.current) editorRef.current.innerHTML = ''
  }

  const handleSelectChapter = (chapter) => {
    setActiveChapter(chapter)
    setChapterTitle(chapter.title)
    if (editorRef.current) editorRef.current.innerHTML = chapter.content || ''
  }

  const handleSaveChapter = async () => {
    if (!activeChapter) return
    setSaving(true)
    const content = editorRef.current?.innerHTML || ''
    const wordCount = editorRef.current?.innerText?.trim().split(/\s+/).filter(Boolean).length || 0

    const { error } = await supabase
      .from('chapters')
      .update({
        title: chapterTitle,
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeChapter.id)

    if (error) toast.error(error.message)
    else {
      toast.success('Chapter saved!')
      setChapters(prev => prev.map(c =>
        c.id === activeChapter.id ? { ...c, title: chapterTitle, content, word_count: wordCount } : c
      ))
    }
    setSaving(false)
  }

  const handleToggleChapterPublish = async (chapter) => {
    const { error } = await supabase
      .from('chapters')
      .update({ is_published: !chapter.is_published })
      .eq('id', chapter.id)
    if (error) toast.error(error.message)
    else {
      setChapters(prev => prev.map(c =>
        c.id === chapter.id ? { ...c, is_published: !c.is_published } : c
      ))
      toast.success(chapter.is_published ? 'Chapter unpublished' : 'Chapter published!')
    }
  }

  const handleFormat = (cmd, value) => {
    if (cmd === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote')
    } else if (cmd === 'fontSize') {
      document.execCommand('fontSize', false, value)
    } else {
      document.execCommand(cmd, false, null)
    }
    editorRef.current?.focus()
  }

  // Image insertion
  const handleInsertImage = () => {
    if (!savedStoryId) { toast.error('Save story details first!'); return }
    imageInputRef.current?.click()
  }

  const handleImageFileSelected = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `chapter-images/${savedStoryId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('covers').upload(path, file)
      if (error) throw error

      const { data } = supabase.storage.from('covers').getPublicUrl(path)

      editorRef.current?.focus()
      const img = `<img src="${data.publicUrl}" alt="story image" style="max-width: 100%; border-radius: 12px; margin: 16px auto; display: block;" />`
      document.execCommand('insertHTML', false, img)

      toast.success('Image inserted!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  // Auto-save chapter every 30 seconds
  useEffect(() => {
    if (!activeChapter) return
    const interval = setInterval(() => {
      handleSaveChapter()
    }, 30000)
    return () => clearInterval(interval)
  }, [activeChapter, chapterTitle])

  return (
    <div className="min-h-screen bg-parchment">

      {/* Hidden file input for chapter images */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelected}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-parchment/95 backdrop-blur-sm border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/my-stories" className="text-ink-400 hover:text-midnight transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <h1 className="font-display font-bold text-midnight text-lg flex-1 truncate">
            {story.title || 'Untitled Story'}
          </h1>

          <div className="flex items-center gap-1 bg-ink-100 rounded-full p-1">
            {['details', 'chapters'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all ${
                  tab === t ? 'bg-parchment text-midnight shadow-sm' : 'text-ink-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'details' ? (
            <button
              onClick={handleSaveStory}
              disabled={saving || uploadingCover}
              className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-4 py-2 rounded-full hover:bg-ink-600 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-parchment border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            activeChapter && (
              <button
                onClick={handleSaveChapter}
                disabled={saving}
                className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-4 py-2 rounded-full hover:bg-ink-600 transition-colors text-sm disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-parchment border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save Chapter'}
              </button>
            )
          )}
        </div>
      </div>

      {/* DETAILS TAB */}
      {tab === 'details' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-3">
                Cover Image
              </label>
              <label className="block cursor-pointer">
                <div className={`aspect-[3/4.2] rounded-2xl overflow-hidden border-2 transition-all ${
                  coverPreview ? 'border-ink-300' : 'border-dashed border-ink-300 hover:border-ink-500'
                } bg-ink-50 flex items-center justify-center relative group`}>
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-midnight/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-parchment text-sm font-semibold">Change Cover</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <svg className="w-10 h-10 text-ink-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-ink-400 font-medium">Click to upload</p>
                      <p className="text-xs text-ink-300 mt-1">PNG, JPG up to 5MB</p>
                      <p className="text-xs text-ink-300">Recommended: 300×420px</p>
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </label>

              <div className="mt-4">
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Status</label>
                <div className="flex flex-col gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setStory(prev => ({ ...prev, status: s }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                        story.status === s
                          ? 'bg-ink-500 border-ink-500 text-parchment'
                          : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        s === 'complete' ? 'bg-green-400' :
                        s === 'hiatus' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-5">

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={story.title}
                  onChange={e => setStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your story a title..."
                  maxLength={100}
                  className="w-full px-4 py-3 text-base border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white font-display font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={story.description}
                  onChange={e => setStory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is your story about? Hook your readers..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white resize-none leading-relaxed"
                />
                <p className="text-xs text-ink-400 text-right mt-1">{story.description?.length || 0}/500</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">
                  Genre <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => setStory(prev => ({ ...prev, genre: g }))}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                        story.genre === g
                          ? 'bg-ink-500 border-ink-500 text-parchment'
                          : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Tags <span className="text-ink-300 font-normal normal-case">(up to 8, press Enter)</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-ink-200 rounded-xl bg-white min-h-[48px]">
                  {story.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-ink-100 text-ink-700 px-2.5 py-1 rounded-full font-medium">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={story.tags?.length >= 8 ? 'Max tags reached' : 'Add tag...'}
                    disabled={story.tags?.length >= 8}
                    className="text-xs outline-none bg-transparent flex-1 min-w-[100px] placeholder-ink-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-ink-200 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-midnight">Mature Content</p>
                  <p className="text-xs text-ink-400">Mark if your story contains adult themes</p>
                </div>
                <button
                  onClick={() => setStory(prev => ({ ...prev, is_mature: !prev.is_mature }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    story.is_mature ? 'bg-ink-500' : 'bg-ink-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    story.is_mature ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CHAPTERS TAB */}
      {tab === 'chapters' && (
        <div className="flex h-[calc(100vh-56px)]">

          <div className="w-64 flex-shrink-0 border-r border-ink-200 bg-white flex flex-col">
            <div className="p-4 border-b border-ink-200">
              <button
                onClick={handleNewChapter}
                className="w-full flex items-center justify-center gap-2 bg-ink-500 text-parchment font-semibold py-2.5 rounded-xl hover:bg-ink-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chapter
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chapters.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-xs text-ink-400">No chapters yet. Create your first one!</p>
                </div>
              ) : (
                chapters.map(chapter => (
                  <button
                    key={chapter.id}
                    onClick={() => handleSelectChapter(chapter)}
                    className={`w-full text-left px-4 py-3 border-b border-ink-100 hover:bg-ink-50 transition-colors ${
                      activeChapter?.id === chapter.id ? 'bg-ink-50 border-l-2 border-l-ink-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-ink-400">Ch. {chapter.chapter_number}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        chapter.is_published ? 'bg-green-100 text-green-600' : 'bg-ink-100 text-ink-400'
                      }`}>
                        {chapter.is_published ? '✓' : '·'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-midnight truncate">{chapter.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{chapter.word_count || 0} words</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeChapter ? (
              <>
                <div className="px-6 py-3 border-b border-ink-200 bg-white flex items-center gap-3">
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={e => setChapterTitle(e.target.value)}
                    className="flex-1 text-base font-display font-bold text-midnight outline-none bg-transparent placeholder-ink-300"
                    placeholder="Chapter title..."
                  />
                  <button
                    onClick={() => handleToggleChapterPublish(activeChapter)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      activeChapter.is_published
                        ? 'border-ink-300 text-ink-600 hover:bg-ink-50'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {activeChapter.is_published ? 'Unpublish' : 'Publish Chapter'}
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-ink-300 text-ink-600 hover:bg-ink-50 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  <span className="text-xs text-ink-400">
                    {editorRef.current?.innerText?.trim().split(/\s+/).filter(Boolean).length || 0} words
                  </span>
                </div>

                <EditorToolbar onFormat={handleFormat} onInsertImage={handleInsertImage} />

                {uploadingImage && (
                  <div className="px-6 py-2 bg-ink-100 text-ink-600 text-xs font-medium flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
                    Uploading image...
                  </div>
                )}

                <div className="flex-1 overflow-y-auto bg-white">
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {}}
                    className="min-h-full px-12 py-10 text-midnight leading-relaxed text-base outline-none font-body"
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '16px',
                      lineHeight: '1.8',
                      maxWidth: '680px',
                      margin: '0 auto',
                    }}
                    data-placeholder="Start writing your story here..."
                  />
                </div>

                <div className="px-6 py-2 border-t border-ink-200 bg-white flex items-center justify-between">
                  <p className="text-xs text-ink-400">Auto-saves every 30 seconds</p>
                  <button
                    onClick={handleSaveChapter}
                    disabled={saving}
                    className="text-xs font-semibold text-ink-500 hover:text-midnight transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save now'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-ink-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="font-display text-xl font-bold text-midnight mb-2">Ready to write?</p>
                  <p className="text-sm text-ink-400 mb-4">
                    {chapters.length === 0
                      ? 'Create your first chapter to get started.'
                      : 'Select a chapter from the sidebar.'}
                  </p>
                  {savedStoryId ? (
                    <button
                      onClick={handleNewChapter}
                      className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-5 py-2.5 rounded-full hover:bg-ink-600 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {chapters.length === 0 ? 'Create First Chapter' : 'New Chapter'}
                    </button>
                  ) : (
                    <p className="text-xs text-ink-400">Save story details first!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm">
          <div className="bg-parchment rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 bg-white">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-semibold text-midnight">Reader Preview</span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-ink-400 hover:text-midnight transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-midnight">
              <div className="max-w-2xl mx-auto px-8 py-12">
                <p className="text-center text-xs uppercase tracking-widest text-ink-300 mb-2">
                  {story.title || 'Untitled Story'}
                </p>
                <h1 className="font-display text-3xl font-bold text-parchment text-center mb-8">
                  {chapterTitle || 'Untitled Chapter'}
                </h1>

                <div
                  className="prose prose-invert max-w-none text-parchment/90 leading-loose"
                  style={{ fontFamily: 'Georgia, serif', fontSize: '17px', lineHeight: '1.9' }}
                  dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '<p class="text-ink-300 italic">Nothing written yet...</p>' }}
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-ink-200 bg-white flex items-center justify-between">
              <p className="text-xs text-ink-400">This is how readers will see this chapter</p>
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs font-semibold bg-ink-500 text-parchment px-4 py-2 rounded-full hover:bg-ink-600 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}