import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const GENRES = [
  'Romance', 'Fantasy', 'Mystery', 'Thriller', 'Horror',
  'Sci-Fi', 'Historical', 'Teen Fiction', 'Adventure', 'Poetry'
]
const STATUS_OPTIONS = ['ongoing', 'complete', 'hiatus']

function EditorToolbar({ onFormat, onInsertImage }) {
  const tools = [
    { label: 'B', cmd: 'bold', title: 'Bold' },
    { label: 'I', cmd: 'italic', title: 'Italic' },
    { label: 'U', cmd: 'underline', title: 'Underline' },
    { label: '"', cmd: 'blockquote', title: 'Quote' },
  ]
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-ink-200 bg-ink-50/50 flex-wrap">
      {tools.map(tool => (
        <button key={tool.cmd}
          onMouseDown={e => { e.preventDefault(); onFormat(tool.cmd) }}
          title={tool.title}
          className={`w-8 h-8 rounded-lg text-sm font-bold text-ink-600 hover:bg-ink-200 transition-colors flex items-center justify-center ${
            tool.label === 'B' ? 'font-extrabold' : tool.label === 'I' ? 'italic' : tool.label === 'U' ? 'underline' : ''
          }`}>{tool.label}</button>
      ))}
      <div className="w-px h-5 bg-ink-200 mx-1" />
      {[
        { title: 'Align Left', cmd: 'justifyLeft', icon: 'M4 6h16M4 12h10M4 18h16' },
        { title: 'Align Center', cmd: 'justifyCenter', icon: 'M4 6h16M7 12h10M4 18h16' },
        { title: 'Align Right', cmd: 'justifyRight', icon: 'M4 6h16M10 12h10M4 18h16' },
      ].map(tool => (
        <button key={tool.cmd}
          onMouseDown={e => { e.preventDefault(); onFormat(tool.cmd) }}
          title={tool.title}
          className="w-8 h-8 rounded-lg text-ink-600 hover:bg-ink-200 transition-colors flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
          </svg>
        </button>
      ))}
      <div className="w-px h-5 bg-ink-200 mx-1" />
      <button onMouseDown={e => e.preventDefault()} onClick={onInsertImage} title="Insert Image"
        className="w-8 h-8 rounded-lg text-ink-600 hover:bg-ink-200 transition-colors flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <div className="w-px h-5 bg-ink-200 mx-1" />
      <select onMouseDown={e => e.stopPropagation()}
        onChange={e => onFormat('fontSize', e.target.value)}
        className="text-xs text-ink-600 bg-transparent border-none outline-none cursor-pointer" defaultValue="3">
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

  const [story, setStory] = useState({
    title: '', description: '', genre: '', tags: [],
    status: 'ongoing', cover_url: null, is_published: false, is_mature: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [chapters, setChapters] = useState([])
  const [activeChapter, setActiveChapter] = useState(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedStoryId, setSavedStoryId] = useState(isNew ? null : storyId)

  // Notes state
  const [notes, setNotes] = useState({
    protagonist_name: '',
    protagonist_other_names: '',
    protagonist_pronoun: '',
    protagonist_attributes: '',
    story_goal: '',
    story_outcome: '',
  })

  const [tab, setTab] = useState('details') // 'details' | 'toc' | 'notes' | 'chapters'
  const [showChapterDropdown, setShowChapterDropdown] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '' | 'saving' | 'saved'
  const [chapterCoverFile, setChapterCoverFile] = useState(null)
  const [chapterCoverPreview, setChapterCoverPreview] = useState(null)
  const [uploadingChapterCover, setUploadingChapterCover] = useState(false)
  const chapterCoverInputRef = useRef()

  const editorRef = useRef()
  const imageInputRef = useRef()
  const dropdownRef = useRef()
  const autoSaveTimer = useRef()
  const lastContentRef = useRef('')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (!isNew) fetchStory()
  }, [user, storyId])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowChapterDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchStory = async () => {
    const { data } = await supabase.from('stories').select('*').eq('id', storyId).single()
    if (data) {
      setStory(data)
      setCoverPreview(data.cover_url)
      setSavedStoryId(data.id)
      if (data.notes) setNotes(data.notes)
    }
    fetchChapters()
  }

  const fetchChapters = async () => {
    const { data } = await supabase.from('chapters').select('*')
      .eq('story_id', storyId).order('chapter_number', { ascending: true })
    setChapters(data || [])
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Cover must be under 5MB'); return }
    setCoverFile(file); setCoverPreview(URL.createObjectURL(file))
  }

  const uploadCover = async (id) => {
    if (!coverFile) return story.cover_url
    setUploadingCover(true)
    const ext = coverFile.name.split('.').pop()
    const path = `covers/${id}.${ext}`
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
        const { data: newStory, error } = await supabase.from('stories')
          .insert({ ...story, author_id: user.id, cover_url: null }).select().single()
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
        const { error } = await supabase.from('stories')
          .update({ ...story, cover_url: coverUrl, notes }).eq('id', savedStoryId)
        if (error) throw error
        toast.success('Story saved!')
      }
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleSaveNotes = async () => {
    if (!savedStoryId) { toast.error('Save story details first!'); return }
    const { error } = await supabase.from('stories').update({ notes }).eq('id', savedStoryId)
    if (error) toast.error(error.message)
    else toast.success('Notes saved!')
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (tag && !story.tags.includes(tag) && story.tags.length < 8)
        setStory(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const removeTag = (tag) => setStory(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  const handleNewChapter = async () => {
    if (!savedStoryId) { toast.error('Save story details first!'); return }
    const num = chapters.length + 1
    const { data, error } = await supabase.from('chapters').insert({
      story_id: savedStoryId, chapter_number: num,
      title: `Chapter ${num}`, content: '', is_published: false,
    }).select().single()
    if (error) { toast.error(error.message); return }
    setChapters(prev => [...prev, data])
    setActiveChapter(data)
    setChapterCoverPreview(null)
    setChapterCoverFile(null)
    setChapterTitle(data.title)
    if (editorRef.current) editorRef.current.innerHTML = ''
    lastContentRef.current = ''
    setShowChapterDropdown(false)
    setTab('chapters')
  }

  const handleSelectChapter = (chapter) => {
    setActiveChapter(chapter)
    setChapterTitle(chapter.title)
    if (editorRef.current) editorRef.current.innerHTML = chapter.content || ''
    lastContentRef.current = chapter.content || ''
    setChapterCoverPreview(chapter.cover_url || null)
    setChapterCoverFile(null)
    setShowChapterDropdown(false)
    setTab('chapters')
  }

  const handleChapterCoverUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setChapterCoverFile(file)
    setChapterCoverPreview(URL.createObjectURL(file))
  }

  const handleRemoveChapterCover = () => {
    setChapterCoverFile(null)
    setChapterCoverPreview(null)
  }

  // Debounced auto-save — triggers on content change, not timer
  const debouncedSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      if (!activeChapter) return
      const content = editorRef.current?.innerHTML || ''
      if (content === lastContentRef.current) return // no change, skip
      lastContentRef.current = content
      setAutoSaveStatus('saving')
      const wordCount = editorRef.current?.innerText?.trim().split(/\s+/).filter(Boolean).length || 0
      const { error } = await supabase.from('chapters').update({
        title: chapterTitle, content, word_count: wordCount,
        updated_at: new Date().toISOString(),
      }).eq('id', activeChapter.id)
      if (!error) {
        setChapters(prev => prev.map(c =>
          c.id === activeChapter.id ? { ...c, title: chapterTitle, content, word_count: wordCount } : c
        ))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(''), 2000)
      } else {
        setAutoSaveStatus('')
      }
    }, 1500) // save 1.5 seconds after user stops typing
  }, [activeChapter, chapterTitle])

  const handleSaveChapter = async () => {
  if (!activeChapter) return
  setSaving(true)
  const content = editorRef.current?.innerHTML || ''
  lastContentRef.current = content
  const wordCount = editorRef.current?.innerText?.trim().split(/\s+/).filter(Boolean).length || 0

  let coverUrl = activeChapter.cover_url || null

  // Upload chapter cover if new file selected
  if (chapterCoverFile) {
    setUploadingChapterCover(true)
    const ext = chapterCoverFile.name.split('.').pop()
    const path = `chapter-covers/${activeChapter.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('covers').upload(path, chapterCoverFile, { upsert: true })
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path)
      coverUrl = urlData.publicUrl
    }
    setUploadingChapterCover(false)
    setChapterCoverFile(null)
  } else if (!chapterCoverPreview) {
    // Cover was removed
    coverUrl = null
  }

  const { error } = await supabase.from('chapters').update({
    title: chapterTitle,
    content,
    word_count: wordCount,
    cover_url: coverUrl,
    updated_at: new Date().toISOString(),
  }).eq('id', activeChapter.id)

  if (error) toast.error(error.message)
  else {
    toast.success('Chapter saved!')
    setChapters(prev => prev.map(c =>
      c.id === activeChapter.id
        ? { ...c, title: chapterTitle, content, word_count: wordCount, cover_url: coverUrl }
        : c
    ))
    setActiveChapter(prev => ({ ...prev, cover_url: coverUrl }))
  }
  setSaving(false)
}

  const handlePreview = async () => {
    if (!activeChapter) return
    await handleSaveChapter()
    window.open(`/preview/${savedStoryId}/${activeChapter.id}`, '_blank')
  }

  const handleToggleChapterPublish = async (chapter) => {
    const { error } = await supabase.from('chapters')
      .update({ is_published: !chapter.is_published }).eq('id', chapter.id)
    if (error) toast.error(error.message)
    else {
      setChapters(prev => prev.map(c =>
        c.id === chapter.id ? { ...c, is_published: !c.is_published } : c
      ))
      setActiveChapter(prev => prev?.id === chapter.id ? { ...prev, is_published: !prev.is_published } : prev)
      toast.success(chapter.is_published ? 'Chapter unpublished' : 'Chapter published!')
    }
  }

  const handleDeleteChapter = async (chapter) => {
    if (!confirm(`Delete "${chapter.title}"?`)) return
    const { error } = await supabase.from('chapters').delete().eq('id', chapter.id)
    if (error) { toast.error(error.message); return }
    setChapters(prev => prev.filter(c => c.id !== chapter.id))
    if (activeChapter?.id === chapter.id) {
      setActiveChapter(null); setChapterTitle('')
      if (editorRef.current) editorRef.current.innerHTML = ''
    }
    toast.success('Chapter deleted')
  }

  // Drag-to-reorder chapters (TOC)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = (index) => { dragItem.current = index }
  const handleDragEnter = (index) => { dragOverItem.current = index }
  const handleDragEnd = async () => {
    const newChapters = [...chapters]
    const draggedItem = newChapters.splice(dragItem.current, 1)[0]
    newChapters.splice(dragOverItem.current, 0, draggedItem)
    // Update chapter_number
    const updated = newChapters.map((c, i) => ({ ...c, chapter_number: i + 1 }))
    setChapters(updated)
    dragItem.current = null; dragOverItem.current = null
    // Persist to DB
    await Promise.all(updated.map(c =>
      supabase.from('chapters').update({ chapter_number: c.chapter_number }).eq('id', c.id)
    ))
    toast.success('Chapter order updated!')
  }

  const handleFormat = (cmd, value) => {
    if (cmd === 'blockquote') document.execCommand('formatBlock', false, 'blockquote')
    else if (cmd === 'fontSize') document.execCommand('fontSize', false, value)
    else document.execCommand(cmd, false, null)
    editorRef.current?.focus()
  }

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
      document.execCommand('insertHTML', false,
        `<img src="${data.publicUrl}" alt="story image" style="max-width:100%;border-radius:12px;margin:16px auto;display:block;" />`)
      toast.success('Image inserted!')
    } catch (err) { toast.error(err.message) }
    finally { setUploadingImage(false); e.target.value = '' }
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileSelected} />

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-ink-200">
        <div className="h-14 flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
          <Link to="/my-stories" className="text-ink-400 hover:text-midnight transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Chapter dropdown */}
          {tab === 'chapters' && (
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button onClick={() => setShowChapterDropdown(prev => !prev)}
                className="flex items-center gap-1.5 max-w-[140px] sm:max-w-xs">
                <div className="text-left">
                  <p className="text-xs text-ink-400 leading-none truncate">{story.title || 'Untitled Story'}</p>
                  <p className="text-sm font-bold text-midnight leading-tight truncate">
                    {activeChapter ? activeChapter.title : 'Select chapter'}
                  </p>
                </div>
                <svg className={`w-4 h-4 text-ink-400 flex-shrink-0 transition-transform ${showChapterDropdown ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showChapterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-ink-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-ink-100">
                    <p className="text-xs font-bold text-ink-400 uppercase tracking-wide px-2 py-1">
                      {story.title || 'Untitled Story'}
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {chapters.length === 0 ? (
                      <p className="text-xs text-ink-400 text-center py-4">No chapters yet</p>
                    ) : chapters.map(chapter => (
                      <div key={chapter.id} className="flex items-center group">
                        <button onClick={() => handleSelectChapter(chapter)}
                          className={`flex-1 text-left px-4 py-3 hover:bg-ink-50 transition-colors ${activeChapter?.id === chapter.id ? 'bg-ink-50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-midnight">{chapter.title}</p>
                              <p className="text-xs text-ink-400">
                                {chapter.is_published ? '✓ Published' : 'Draft'} · {chapter.word_count || 0} words
                              </p>
                            </div>
                            {activeChapter?.id === chapter.id && (
                              <svg className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                        <button onClick={() => handleDeleteChapter(chapter)}
                          className="px-3 py-3 text-ink-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-ink-100">
                    <button onClick={handleNewChapter}
                      className="w-full flex items-center justify-center gap-2 bg-ink-500 text-parchment font-semibold py-2.5 rounded-xl hover:bg-ink-600 transition-colors text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Chapter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab !== 'chapters' && (
            <h1 className="font-display font-bold text-midnight text-base sm:text-lg truncate flex-shrink-0 max-w-[120px] sm:max-w-xs">
              {story.title || 'Untitled Story'}
            </h1>
          )}

          <div className="flex-1" />

          {/* Auto-save status */}
          {autoSaveStatus && tab === 'chapters' && (
            <span className={`text-xs flex-shrink-0 ${autoSaveStatus === 'saving' ? 'text-ink-400' : 'text-green-500'}`}>
              {autoSaveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
            </span>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-0.5 bg-ink-100 rounded-full p-1 flex-shrink-0">
            {[
              { key: 'details', label: 'Details' },
              { key: 'toc', label: 'Contents' },
              { key: 'notes', label: 'Notes' },
              { key: 'chapters', label: 'Write' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full transition-all ${
                  tab === t.key ? 'bg-parchment text-midnight shadow-sm' : 'text-ink-500'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Save buttons */}
          {tab === 'details' && (
            <button onClick={handleSaveStory} disabled={saving || uploadingCover}
              className="flex items-center gap-1.5 bg-ink-500 text-parchment font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-ink-600 transition-colors text-sm disabled:opacity-50 flex-shrink-0">
              {saving && <div className="w-4 h-4 border-2 border-parchment border-t-transparent rounded-full animate-spin" />}
              Save
            </button>
          )}
          {tab === 'notes' && (
            <button onClick={handleSaveNotes}
              className="flex items-center gap-1.5 bg-ink-500 text-parchment font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-ink-600 transition-colors text-sm flex-shrink-0">
              Save Notes
            </button>
          )}

          {/* Chapter cover/header image — Wattpad style */}
          <div className="relative bg-ink-100 w-full" style={{ minHeight: chapterCoverPreview ? '280px' : '80px' }}>
            {chapterCoverPreview ? (
              <>
                <img
                  src={chapterCoverPreview}
                  alt="Chapter cover"
                  className="w-full object-cover"
                  style={{ maxHeight: '320px', width: '100%' }}
                />
                {/* Controls overlay */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <label className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-ink-700 font-semibold text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-white transition-colors shadow">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Replace
                    <input type="file" accept="image/*" className="hidden" ref={chapterCoverInputRef} onChange={handleChapterCoverUpload} />
                  </label>
                  <button
                    onClick={handleRemoveChapterCover}
                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-red-500 font-semibold text-xs px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <label className="flex items-center justify-center w-full h-20 cursor-pointer group">
                <div className="flex items-center gap-3 text-ink-400 group-hover:text-ink-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Add chapter cover image</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleChapterCoverUpload} />
              </label>
            )}
            {uploadingChapterCover && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
                    
        </div>
      </div>

      {/* DETAILS TAB */}
      {tab === 'details' && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-3">Cover Image</label>
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
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </label>
              <div className="mt-4">
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Status</label>
                <div className="flex flex-col gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setStory(prev => ({ ...prev, status: s }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                        story.status === s ? 'bg-ink-500 border-ink-500 text-parchment' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${s === 'complete' ? 'bg-green-400' : s === 'hiatus' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-5">
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Title *</label>
                <input type="text" value={story.title}
                  onChange={e => setStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your story a title..." maxLength={100}
                  className="w-full px-4 py-3 text-base border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white font-display font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Description *</label>
                <textarea value={story.description}
                  onChange={e => setStory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is your story about?" maxLength={500} rows={4}
                  className="w-full px-4 py-3 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white resize-none leading-relaxed" />
                <p className="text-xs text-ink-400 text-right mt-1">{story.description?.length || 0}/500</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Genre *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {GENRES.map(g => (
                    <button key={g} onClick={() => setStory(prev => ({ ...prev, genre: g }))}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                        story.genre === g ? 'bg-ink-500 border-ink-500 text-parchment' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}>{g}</button>
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
                  <input type="text" value={tagInput}
                    onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                    placeholder={story.tags?.length >= 8 ? 'Max tags reached' : 'Add tag...'}
                    disabled={story.tags?.length >= 8}
                    className="text-xs outline-none bg-transparent flex-1 min-w-[100px] placeholder-ink-300" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white border border-ink-200 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-midnight">Mature Content</p>
                  <p className="text-xs text-ink-400">Mark if your story contains adult themes</p>
                </div>
                <button onClick={() => setStory(prev => ({ ...prev, is_mature: !prev.is_mature }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${story.is_mature ? 'bg-ink-500' : 'bg-ink-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${story.is_mature ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE OF CONTENTS TAB */}
      {tab === 'toc' && (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-midnight">Table of Contents</h2>
            <button onClick={handleNewChapter}
              className="flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-4 py-2 rounded-full hover:bg-ink-600 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chapter
            </button>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-16 bg-white border border-ink-200 rounded-2xl">
              <p className="text-ink-400 text-sm">No chapters yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-ink-400 mb-3">Drag to reorder chapters</p>
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className="flex items-center gap-3 bg-white border border-ink-200 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-ink-300 hover:shadow-sm transition-all group"
                >
                  {/* Drag handle */}
                  <div className="text-ink-300 group-hover:text-ink-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  <span className="text-xs font-bold text-ink-400 w-8 flex-shrink-0">Ch. {chapter.chapter_number}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-midnight truncate">{chapter.title}</p>
                    <p className="text-xs text-ink-400">
                      {chapter.is_published ? '✓ Published' : 'Draft'} · {chapter.word_count || 0} words
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleSelectChapter(chapter)}
                      className="text-xs font-semibold text-ink-500 hover:text-midnight border border-ink-200 px-3 py-1.5 rounded-full hover:bg-ink-50 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteChapter(chapter)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STORY NOTES TAB */}
      {tab === 'notes' && (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

          {/* Protagonist Section */}
          <div className="bg-white border border-ink-200 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-3xl">📖</div>
              <div>
                <h3 className="font-display font-bold text-midnight text-lg">Story Notes</h3>
                <p className="text-sm text-ink-400">Store and track all of your story ideas in one place.</p>
              </div>
            </div>

            <h4 className="font-bold text-midnight mb-1">The Protagonist</h4>
            <p className="text-xs text-ink-400 leading-relaxed mb-4">
              Stories have multiple characters, and many main characters. The Protagonist on the other hand is the leading character in your story.
              They are the most prominent figure in your story, who drives the plot and makes up most of the narrative.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Protagonist's Name <span className="text-ink-300 font-normal normal-case">(max 20)</span>
                </label>
                <input type="text" value={notes.protagonist_name} maxLength={20}
                  onChange={e => setNotes(prev => ({ ...prev, protagonist_name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white" />
                <p className="text-xs text-ink-300 text-right mt-1">{notes.protagonist_name?.length || 0}/20</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                  Other Names <span className="text-ink-300 font-normal normal-case">(max 50)</span>
                </label>
                <input type="text" value={notes.protagonist_other_names} maxLength={50}
                  onChange={e => setNotes(prev => ({ ...prev, protagonist_other_names: e.target.value }))}
                  placeholder="Separate names by commas"
                  className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Pronoun</label>
                <select value={notes.protagonist_pronoun}
                  onChange={e => setNotes(prev => ({ ...prev, protagonist_pronoun: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 bg-white">
                  <option value="">Select</option>
                  <option value="he">He/Him</option>
                  <option value="she">She/Her</option>
                  <option value="they">They/Them</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Attributes</label>
                <input type="text" value={notes.protagonist_attributes}
                  onChange={e => setNotes(prev => ({ ...prev, protagonist_attributes: e.target.value }))}
                  placeholder="e.g. tall, brown hair, introverted..."
                  className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white" />
              </div>
            </div>
          </div>

          {/* Story Goal */}
          <div className="bg-white border border-ink-200 rounded-2xl p-6">
            <h4 className="font-bold text-midnight mb-1">The Story Goal</h4>
            <p className="text-xs text-ink-400 leading-relaxed mb-4">
              The Protagonist's goal in the story is what is known as the Story Goal. A Story Goal is the foundation of every plot.
            </p>
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                What is your Protagonist's ultimate goal? <span className="text-ink-300 font-normal">(max 75)</span>
              </label>
              <textarea value={notes.story_goal} maxLength={75} rows={3}
                onChange={e => setNotes(prev => ({ ...prev, story_goal: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white resize-none" />
              <p className="text-xs text-ink-300 text-right mt-1">{notes.story_goal?.length || 0}/75</p>
            </div>
          </div>

          {/* Story Outcome */}
          <div className="bg-white border border-ink-200 rounded-2xl p-6">
            <h4 className="font-bold text-midnight mb-1">The Story Outcome</h4>
            <p className="text-xs text-ink-400 leading-relaxed mb-4">
              Every story has a planned outcome. Knowing where you want to go will help you pace your story.
            </p>
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                What happens at the end? <span className="text-ink-300 font-normal">(max 150)</span>
              </label>
              <textarea value={notes.story_outcome} maxLength={150} rows={4}
                onChange={e => setNotes(prev => ({ ...prev, story_outcome: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-200 bg-white resize-none" />
              <p className="text-xs text-ink-300 text-right mt-1">{notes.story_outcome?.length || 0}/150</p>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTERS TAB */}
      {tab === 'chapters' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChapter ? (
            <>
              <div className="px-4 sm:px-8 py-3 border-b border-ink-200 bg-white flex items-center gap-3">
                <input type="text" value={chapterTitle}
                  onChange={e => { setChapterTitle(e.target.value); debouncedSave() }}
                  className="flex-1 text-base sm:text-lg font-display font-bold text-midnight outline-none bg-transparent placeholder-ink-300"
                  placeholder="Chapter title..." />
                <button onClick={handlePreview}
                  className="sm:hidden text-xs font-semibold px-3 py-1.5 rounded-full border border-ink-300 text-ink-600">
                  Preview
                </button>
                <button onClick={() => handleToggleChapterPublish(activeChapter)}
                  className={`sm:hidden text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    activeChapter.is_published ? 'border-ink-300 text-ink-600' : 'border-green-300 text-green-700'
                  }`}>
                  {activeChapter.is_published ? 'Unpublish' : 'Publish'}
                </button>
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
                  onInput={debouncedSave}
                  className="min-h-full outline-none text-midnight"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '17px',
                    lineHeight: '1.9',
                    maxWidth: '720px',
                    margin: '0 auto',
                    padding: '40px 24px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                  data-placeholder="Type your text..."
                />
              </div>

              <div className="px-4 sm:px-6 py-2 border-t border-ink-200 bg-white flex items-center justify-end">
                <button onClick={handleSaveChapter} disabled={saving}
                  className="text-xs font-semibold text-ink-500 hover:text-midnight transition-colors">
                  {saving ? 'Saving...' : 'Save now'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center max-w-sm">
                <svg className="w-16 h-16 text-ink-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="font-display text-xl font-bold text-midnight mb-2">Ready to write?</p>
                <p className="text-sm text-ink-400 mb-6">
                  {chapters.length === 0 ? 'Create your first chapter to get started.' : 'Select a chapter from the dropdown above.'}
                </p>
                {savedStoryId ? (
                  <button onClick={handleNewChapter}
                    className="inline-flex items-center gap-2 bg-ink-500 text-parchment font-semibold px-6 py-3 rounded-full hover:bg-ink-600 transition-colors text-sm">
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
      )}
    </div>
  )
}