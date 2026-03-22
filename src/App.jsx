import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Redemption from './pages/Redemption'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 w-full flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/redemption" element={<Redemption />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
