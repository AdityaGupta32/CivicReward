import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Moon, Sun } from 'lucide-react'

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial dark mode state
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true)
    }
  }, [])

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
            CivicRewards
          </Link>
          <div className="hidden sm:flex space-x-8">
            <Link to="/" className="text-foreground font-medium hover:text-primary transition-colors">Home</Link>
            <a href="/#about" className="text-foreground font-medium hover:text-primary transition-colors">About Us</a>
            <Link to="/redemption" className="text-foreground font-medium hover:text-primary transition-colors">Store</Link>
            {user && <Link to="/profile" className="text-foreground font-medium hover:text-primary transition-colors">Profile</Link>}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDark} 
              className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <button 
                onClick={signOut}
                className="bg-muted text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors shadow-sm"
              >
                Sign in
              </button>
            )}
            <div className="sm:hidden flex items-center">
              <button className="p-2 text-foreground focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
