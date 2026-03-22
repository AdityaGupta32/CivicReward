import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { verifyCivicIssue } from '../utils/gemini'
import FileUpload from '../components/reporting/FileUpload'

gsap.registerPlugin(ScrollTrigger)
import LocationBadge from '../components/reporting/LocationBadge'
import LoginPopup from '../components/auth/LoginPopup'
import ImageSlider from '../components/layout/ImageSlider'
import { Leaf, ShieldCheck, TrendingUp, Users, Globe, Camera, MapPin, Award, CheckCircle, ArrowRight, Star, MessageSquare } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [location, setLocation] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const heroRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-element', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out'
      })

      // Universal scroll trigger for all new sections
      gsap.utils.toArray('.scroll-section').forEach(section => {
        const items = section.querySelectorAll('.scroll-item')
        if (items.length > 0) {
          gsap.from(items, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%'
            }
          })
        }
      })
    })
    return () => ctx.revert()
  }, [])

  const handleSubmit = async () => {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (!file || !location) {
      alert("Both photo and location are required.")
      return
    }
    
    setSubmitting(true)

    try {
      // 1. Verify Image with Gemini
      const verificationResult = await verifyCivicIssue(file);
      
      if (verificationResult.verified) {
        // 2. Insert complaint record into Supabase
        const { error: complaintError } = await supabase
          .from('complaints')
          .insert({
            user_id: user.id,
            status: 'Verified ✅',
            // Store coordinates (could map to actual columns depending on schema)
          });
          
        if (complaintError) {
          console.error("Failed to save complaint:", complaintError);
          setNotification({ type: 'warning', title: 'Image verified', message: 'Failed to save the report to your history.' });
        }

        // 3. Update User Points
        const { data: profile, error: profileFetchError } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();
          
        if (!profileFetchError && profile) {
          const newPoints = (profile.points || 0) + verificationResult.points;
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ points: newPoints })
            .eq('id', user.id);
            
          if (profileUpdateError) {
             console.error("Failed to update points:", profileUpdateError);
             setNotification({ type: 'warning', title: 'Verified!', message: 'Failed to update your points balance.' });
          } else {
             setNotification({ type: 'success', title: `Verification Successful! +${verificationResult.points} points`, message: verificationResult.reason });
          }
        } else {
          // Profile didn't exist or error fetching, so we skip updating points silently and just alert success.
          setNotification({ type: 'success', title: `Verification Successful! +${verificationResult.points} points`, message: verificationResult.reason });
        }
      } else {
        setNotification({ type: 'error', title: 'Verification Failed', message: verificationResult.reason });
      }
      
      setFile(null)
      setLocation(null)
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', title: 'Verification Request Failed', message: error.message });
    } finally {
      setSubmitting(false)
      // Auto-hide notification after 8 seconds
      setTimeout(() => setNotification(null), 8000)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* PROFESSIONAL HERO SECTION */}
      <section ref={heroRef} className="relative bg-[#0d2e17] pt-24 pb-32 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2e17] via-[#0d2e17]/90 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Top Left Content */}
            <div className="text-white space-y-6">
              <div className="hero-element inline-flex items-center rounded-full border border-secondary/50 bg-[#154622] px-4 py-1.5 text-sm font-medium text-secondary shadow-sm">
                <Leaf className="mr-2 h-4 w-4" /> We are Protecting the Environment
              </div>
              <h1 className="hero-element text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
                Report Civic Issues <br />
                <span className="text-secondary drop-shadow-sm">
                  Improve Our City
                </span>
              </h1>
              <p className="hero-element text-base sm:text-lg text-white/80 max-w-lg leading-relaxed">
                A successful community relies on everyone. Upload photos of dumping, report neglected areas, and earn exclusive civic points for your proactive actions.
              </p>
              <div className="hero-element pt-4 flex gap-4">
                <a href="#report" className="bg-secondary text-[#1c2b23] px-6 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2 text-sm z-30">
                  Get Started Now <span className="bg-[#1c2b23]/10 p-1 rounded-full"><TrendingUp className="w-4 h-4" /></span>
                </a>
              </div>
            </div>

            {/* Top Right Image Slider */}
            <div className="hidden lg:block relative group hero-element">
              <div className="absolute inset-0 bg-secondary rounded-[3rem] transform translate-x-4 translate-y-4 opacity-30 blur-xl transition-all duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:opacity-40"></div>
              <div className="relative z-10 w-full h-[450px] bg-black/10 backdrop-blur-sm border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <ImageSlider />
              </div>
              {/* Dynamic Badge */}
              <div className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-2xl border border-border flex items-center gap-3 animate-float-slow z-20">
                <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">AI Verified</p>
                  <p className="text-xs text-muted-foreground">Secure processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YELLOW BANNER */}
      <section className="hero-element relative z-20 -mt-12 ml-4 sm:ml-8 lg:ml-8 max-w-2xl mr-auto">
        <div className="bg-secondary py-4 px-6 sm:px-8 rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-2 border-secondary shadow-sm relative z-30 animate-float-fast" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                <img className="w-12 h-12 rounded-full border-2 border-secondary shadow-sm relative z-20 animate-float-slow" src="https://randomuser.me/api/portraits/men/22.jpg" alt="User" style={{animationDelay: '1s'}} />
                <img className="w-12 h-12 rounded-full border-2 border-secondary shadow-sm relative z-10 animate-float-fast" src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" style={{animationDelay: '2s'}} />
              </div>
              <div>
                <p className="font-bold text-[#1c2b23] text-lg leading-tight tracking-tight">10K+ Reports</p>
                <p className="text-[#1c2b23]/80 text-xs font-bold uppercase tracking-wider">Resolved</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-[#1c2b23]/10"></div>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#125028] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                 <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-[#1c2b23] leading-tight tracking-tight">Eco Growth</p>
                <p className="text-[#1c2b23]/80 text-xs font-bold uppercase tracking-wider">Neighborhoods</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT DIRECTORY */}
      <section id="report" className="scroll-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Hand Side: What we do */}
          <div id="about" className="space-y-8 scroll-mt-24">
            <div className="scroll-item inline-flex rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
              Our Services
            </div>
            <h2 className="scroll-item text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">We Offer Eco & <br/> Civic Reporting Services</h2>
            <p className="scroll-item text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
              Our platform empowers you to take action. When you spot illegal dumping, broken infrastructure, or neglected parks, you can report it instantly. Our AI verification system processes your submission and rewards you with Civic Points.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="scroll-item bg-card/40 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                  <Leaf className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sustainable Future</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">Every report contributes to a cleaner, greener environment for generations to come.</p>
              </div>
              <div className="scroll-item bg-card/40 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="bg-secondary/20 w-14 h-14 rounded-2xl flex items-center justify-center text-secondary-foreground mb-5 group-hover:scale-110 group-hover:bg-secondary transition-all duration-300 shadow-sm">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">Community Led</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">Join thousands of citizens actively maintaining the beauty of our neighborhoods.</p>
              </div>
            </div>
          </div>

          {/* Right Hand Side: File Upload Form */}
          <div className="scroll-item bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-2xl font-extrabold mb-8 text-foreground relative z-10 border-b border-border pb-4">Submit a New Complaint</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="bg-muted p-6 rounded-3xl border border-border/50">
                <h4 className="font-bold mb-4 flex items-center gap-3 text-foreground">
                  <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full inline-flex items-center justify-center text-sm shadow-sm">1</span>
                  Photographic Evidence
                </h4>
                <FileUpload onFileSelect={setFile} key={file ? 'has-file' : 'no-file'} />
              </div>

              <div className="bg-muted p-6 rounded-3xl border border-border/50">
                <h4 className="font-bold mb-4 flex items-center gap-3 text-foreground">
                  <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full inline-flex items-center justify-center text-sm shadow-sm">2</span>
                  Location Data
                </h4>
                <LocationBadge onLocationUpdate={setLocation} key={location ? 'has-loc' : 'no-loc'} />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSubmit}
                  disabled={submitting || (!file && !location)}
                  className="w-full bg-primary text-primary-foreground hover:bg-[#155e30] py-4 rounded-2xl font-bold text-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden relative"
                >
                  {submitting ? (
                    <>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying with AI...</span>
                    </>
                  ) : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="scroll-section py-24 bg-muted relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-item">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to make your community cleaner and earn exclusive rewards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[40px] left-[16.66%] right-[16.66%] h-0.5 bg-border z-0"></div>
            
            <div className="scroll-item relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-background rounded-3xl shadow-xl border border-border flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Snap a Photo</h3>
              <p className="text-muted-foreground max-w-xs">See illegal dumping or infrastructure issues? Take a clear photo as evidence.</p>
            </div>
            <div className="scroll-item relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-background rounded-3xl shadow-xl border border-border flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Tag Location</h3>
              <p className="text-muted-foreground max-w-xs">Our system automatically tags your precise location for fast city response.</p>
            </div>
            <div className="scroll-item relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-secondary rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-secondary/20">
                <Award className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Earn Points</h3>
              <p className="text-muted-foreground max-w-xs">Once our AI verifies your report, earn Civic Points to spend in our store.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT IMPACT GALLERY */}
      <section className="scroll-section py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 scroll-item gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4">Recent Community Impact</h2>
              <p className="text-lg text-muted-foreground">See how your neighbors are transforming public spaces in real-time.</p>
            </div>
            <button className="text-primary font-bold hover:text-primary/80 flex items-center gap-2 group">
              View All Reports <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="scroll-item group relative rounded-[2rem] overflow-hidden shadow-xl aspect-square cursor-pointer">
              <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80" alt="Clean Park" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e17]/90 via-[#0d2e17]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3 shadow-md">
                  <CheckCircle className="w-3 h-3" /> Resolved
                </div>
                <h3 className="text-white text-xl font-bold mb-1">Park Restoration</h3>
                <p className="text-white/80 text-sm">Mumbai • 2 days ago</p>
              </div>
            </div>
            <div className="scroll-item group relative rounded-[2rem] overflow-hidden shadow-xl aspect-square cursor-pointer">
              <img src="https://images.unsplash.com/photo-1503596476-1c12a8cb0907?auto=format&fit=crop&q=80" alt="Street Cleaning" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e17]/90 via-[#0d2e17]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3 shadow-md">
                  <CheckCircle className="w-3 h-3" /> Resolved
                </div>
                <h3 className="text-white text-xl font-bold mb-1">Illegal Dumping Cleared</h3>
                <p className="text-white/80 text-sm">Bangalore • 4 days ago</p>
              </div>
            </div>
            <div className="scroll-item group relative rounded-[2rem] overflow-hidden shadow-xl aspect-square cursor-pointer">
              <img src="https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&q=80" alt="Wall Cleanup" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e17]/90 via-[#0d2e17]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full mb-3 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> In Progress
                </div>
                <h3 className="text-white text-xl font-bold mb-1">Wall Cleanup</h3>
                <p className="text-white/80 text-sm">Delhi • 5 hrs ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="scroll-section py-24 bg-[#0d2e17] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="scroll-item text-3xl lg:text-5xl font-extrabold mb-4">Citizens Love Civic</h2>
          <p className="scroll-item text-lg text-white/70 max-w-2xl mx-auto mb-16">Join the thousands of people actively maintaining their communities and being rewarded for it.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="scroll-item bg-[#154622] rounded-[2rem] p-8 text-left border border-white/5 relative">
              <div className="flex gap-1 mb-6 text-secondary">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg leading-relaxed mb-8 italic text-white/90">"I reported a massive dumping pile near my office. Within 48 hours it was cleared, and I earned enough points for a free chai!"</p>
              <div className="flex items-center gap-4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-12 h-12 rounded-full border-2 border-secondary" alt="Priya S." />
                <div>
                  <p className="font-bold">Priya Sharma</p>
                  <p className="text-xs text-secondary font-medium tracking-wider uppercase">Level 4 Warrior</p>
                </div>
              </div>
            </div>
            <div className="scroll-item bg-[#154622] rounded-[2rem] p-8 text-left border border-white/5 relative">
              <div className="flex gap-1 mb-6 text-secondary">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg leading-relaxed mb-8 italic text-white/90">"The AI verification is incredibly fast. I feel like I finally have a direct line to making my neighborhood safer and cleaner."</p>
              <div className="flex items-center gap-4">
                <img src="https://randomuser.me/api/portraits/men/22.jpg" className="w-12 h-12 rounded-full border-2 border-secondary" alt="Rahul T." />
                <div>
                  <p className="font-bold">Rahul T.</p>
                  <p className="text-xs text-secondary font-medium tracking-wider uppercase">Level 2 Contrib</p>
                </div>
              </div>
            </div>
            <div className="scroll-item bg-[#154622] rounded-[2rem] p-8 text-left border border-white/5 relative">
              <div className="flex gap-1 mb-6 text-secondary">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg leading-relaxed mb-8 italic text-white/90">"An amazing initiative. The gamification makes my morning walks so much more engaging. I actively look for things to report."</p>
              <div className="flex items-center gap-4">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-12 h-12 rounded-full border-2 border-secondary" alt="Anjali R." />
                <div>
                  <p className="font-bold">Anjali R.</p>
                  <p className="text-xs text-secondary font-medium tracking-wider uppercase">Level 7 Vision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-background border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <span className="text-2xl font-extrabold text-primary flex items-center gap-2 mb-4">
                 <Leaf className="h-6 w-6" /> Civic Points
              </span>
              <p className="text-muted-foreground mb-6">Empowering communities to maintain, protect, and enhance their shared environments through action and rewards.</p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer"><MessageSquare className="w-5 h-5" /></div>
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer"><Globe className="w-5 h-5" /></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Rewards Store</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Leaderboards</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Impact Map</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Partner with Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">City Governments</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">© 2026 Civic Points. All rights reserved.</p>
            <p className="text-muted-foreground text-sm flex items-center gap-1">Built with <Leaf className="w-3 h-3 text-primary" /> for a better tomorrow.</p>
          </div>
        </div>
      </footer>

      <LoginPopup open={showLogin} onOpenChange={setShowLogin} />

      {/* Custom Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-6 rounded-2xl shadow-2xl max-w-sm w-full border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
          'bg-yellow-50 border-yellow-200 text-yellow-900'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-100 text-green-600' :
              notification.type === 'error' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {notification.type === 'success' && <CheckCircle className="w-6 h-6" />}
              {notification.type === 'error' && <ShieldCheck className="w-6 h-6" />}
              {notification.type === 'warning' && <Award className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{notification.title}</h4>
              <p className="opacity-90 leading-snug">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

