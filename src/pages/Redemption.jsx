import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Redemption() {
  const { user } = useAuth()
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  const rewards = [
    { id: 1, title: 'Civic Eco Cap', pts: 400, img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400', desc: '100% recycled cotton cap to keep you cool.' },
    { id: 2, title: 'Volunteer T-Shirt', pts: 800, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', desc: 'Breathable activewear shirt, showing civic pride.' },
    { id: 3, title: 'Running Shoes', pts: 2500, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', desc: 'Lightweight performance shoes for community runs.' },
    { id: 4, title: 'Coffee Voucher', pts: 200, img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=400', desc: 'Free coffee at any partnered local eco-cafe.' },
    { id: 5, title: 'Canvas Tote Bag', pts: 300, img: 'https://images.unsplash.com/photo-1597484661643-2f5fef640df1?auto=format&fit=crop&q=80&w=400', desc: 'Durable reusable bag for your groceries.' },
    { id: 6, title: 'Hiking Backpack', pts: 3000, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400', desc: 'High-visibility pack for your outdoor trails.' }
  ]

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchPoints = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
        if (data) setTotalPoints(data.points || 0)
      } catch (error) {
        console.error("Error fetching points:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPoints()
  }, [user])

  const handleRedeem = async (item) => {
    if (!user) {
      alert("Please sign in to redeem rewards.")
      return
    }
    if (totalPoints < item.pts) {
      alert("Not enough points!")
      return
    }
    
    // Deduct locally for immediate UI response
    const newTotal = totalPoints - item.pts
    setTotalPoints(newTotal)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ points: newTotal, updated_at: new Date() })
        .eq('id', user.id)
        
      if (error) throw error
      
      alert(`Success! You have added "${item.title}" to your cart.`)
    } catch (error) {
      console.error("Transaction Error:", error)
      // Revert if error occurs
      setTotalPoints(totalPoints)
      alert("Transaction failed. Please try again.")
    }
  }

  return (
    <div className="w-full bg-gradient-to-b from-primary/10 via-background to-secondary/10 min-h-screen pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 bg-card/60 backdrop-blur-md border border-border/50 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-primary">Civic Store</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">Browse sustainable items and eco-friendly products. Exchange your civic points for local perks!</p>
          </div>
          {user && (
            <div className="bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-lg flex flex-col items-center min-w-[140px] hover:scale-105 transition-all duration-300">
              <span className="font-semibold text-primary-foreground/80 uppercase tracking-widest text-[10px] mb-1">Your Balance</span>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mt-1"></div>
              ) : (
                <span className="text-2xl font-black">{totalPoints} pts</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {rewards.map(r => (
            <div key={r.id} className="bg-card border-2 border-transparent hover:border-amber-400 transition-all shadow-md hover:shadow-2xl rounded-3xl overflow-hidden flex flex-col group bg-white">
              <div className="h-56 overflow-hidden bg-muted relative">
                <img src={r.img} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-full px-3 py-1 text-sm font-bold text-primary shadow">
                  ⭐
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{r.desc}</p>
                
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Price</span>
                    <span className="text-2xl font-black text-foreground">{r.pts} pts</span>
                  </div>
                  
                  <button 
                    onClick={() => handleRedeem(r)}
                    disabled={loading || (!user ? false : totalPoints < r.pts)}
                    className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-md disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none active:scale-95 cursor-pointer"
                  >
                    {!user ? 'Sign in to redeem' : (totalPoints >= r.pts ? 'Add to cart' : 'Not enough points')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
