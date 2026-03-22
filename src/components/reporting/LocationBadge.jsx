import { useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'

export default function LocationBadge({ onLocationUpdate }) {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requestLocation = () => {
    setLoading(true)
    setError('')
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(coords)
        setLoading(false)
        if (onLocationUpdate) onLocationUpdate(coords)
      },
      (err) => {
        setError(err.message || 'Failed to get location')
        setLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="w-full">
      {location ? (
        <div className="flex items-center space-x-3 bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 p-4 rounded-xl shadow-sm">
          <div className="bg-green-500/20 p-2 rounded-full">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Location Verified</span>
            <span className="text-xs opacity-90 font-mono tracking-tight mt-0.5">
              {location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°
            </span>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-muted/10 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3 text-muted-foreground mr-auto sm:mr-0 text-left">
            <div className="bg-muted p-2 rounded-full hidden sm:block">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Attach Location Coordinates</p>
              <p className="text-xs mt-1">Required to dispatch cleanup teams accurately.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 w-full sm:w-auto shadow-sm"
          >
            <Navigation className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Locating...' : 'Get GPS Coordinates'}</span>
          </button>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive mt-2 flex items-center bg-destructive/10 p-2 rounded-md border border-destructive/20">
          <span className="font-semibold mr-2">Error:</span> {error}
        </p>
      )}
    </div>
  )
}
