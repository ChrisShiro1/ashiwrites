import { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import ProfileSetupModal from './components/ProfileSetupModal'
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import MyStories from './pages/MyStories'
import WriteMode from './pages/WriteMode'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import PreviewMode from './pages/PreviewMode'


function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function AppContent() {
  const [setupUser, setSetupUser] = useState(null)
  const checkedUsers = useRef(new Set()) // track already-checked users
  const navigate = useNavigate() 

  useEffect(() => {
    const checkProfile = async (user) => {
      if (checkedUsers.current.has(user.id)) return
      checkedUsers.current.add(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_complete')
        .eq('id', user.id)
        .single()

      if (!profile?.profile_complete) {
        setSetupUser(user)
      } else {
        navigate('/dashboard') // ← add this
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkProfile(session.user)
      }
      if (event === 'SIGNED_OUT') {
        setSetupUser(null)
        checkedUsers.current.clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSetupComplete = () => {
    setSetupUser(null)
    // Mark as checked so it won't re-trigger
    if (setupUser) {
      checkedUsers.current.add(setupUser.id)
    }
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f0e17',
            color: '#fdf6e9',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />

      {setupUser && (
        <ProfileSetupModal
          user={setupUser}
          onComplete={handleSetupComplete}
        />
      )}

      <Routes>
        <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
        <Route path="/write" element={<MainLayout><WriteMode /></MainLayout>} />
        <Route path="/user/:username" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/browse" element={<MainLayout><Browse /></MainLayout>} />
        <Route path="/my-stories" element={<MainLayout><MyStories /></MainLayout>} />
        <Route path="/write/:storyId" element={<WriteMode />} />
        <Route path="/preview" element={<PreviewMode />} />
        <Route path="/write/new" element={<WriteMode />} />
        <Route path="/profile/:username" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}