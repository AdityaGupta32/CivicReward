import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Clock } from 'lucide-react'

export default function Profile() {
  const { user, loading } = useAuth()
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setDataLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Fetch Points
        const { data: profileData } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single()
        
        if (profileData) setPoints(profileData.points || 0)

        // Fetch History
        const { data: reportsData } = await supabase
          .from('complaints')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (reportsData) setHistory(reportsData)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading || (dataLoading && user)) return <div className="p-8 text-center mt-10 animate-pulse">Loading user data...</div>
  
  const displayUser = user || {
    email: 'citizen@example.com',
    user_metadata: { full_name: 'Jane Citizen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-6">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 p-6 bg-card/60 backdrop-blur-lg border border-border/50 shadow-sm rounded-3xl hover:shadow-md transition-all duration-300">
        <img 
          src={displayUser.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} 
          alt="Avatar" 
          className="w-20 h-20 rounded-full border-2 border-white/50 shadow-md bg-white hover:scale-105 transition-transform"
        />
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {displayUser.user_metadata?.full_name || 'Civic Participant'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{displayUser.email}</p>
        </div>
        <div className="ml-auto mt-4 md:mt-0 flex flex-col items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-2xl py-4 px-8 min-w-[140px] hover:scale-105 transition-transform">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Points</span>
          <span className="text-3xl font-black">{points}</span>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 text-foreground tracking-tight">Your Reporting History</h2>
      
      <div className="bg-card/80 backdrop-blur-sm text-card-foreground border border-border/50 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase bg-muted/30 border-b border-border text-muted-foreground font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 flex items-center font-medium whitespace-nowrap">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" /> 
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap opacity-90">Civic Report</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        item.status?.toLowerCase().includes('verified') 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold whitespace-nowrap">
                      {item.status?.toLowerCase().includes('verified') ? (
                        <span className="text-green-600 dark:text-green-400">+500</span>
                      ) : (
                        <span className="text-muted-foreground opacity-50">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-muted/10 transition-colors">
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    No reports found. Start reporting to earn points!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
