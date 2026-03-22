import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

export default function FileUpload({ onFileSelect }) {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        if (onFileSelect) onFileSelect(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearFile = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div className="w-full">
      {!preview ? (
        <label 
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer group h-64"
        >
          <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform mb-4">
            <Upload className="h-8 w-8 text-primary group-hover:text-primary/80" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Upload photographic evidence</h3>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
            Please frame the illegal dumping clearly. Our AI will verify the image to grant you civic points.
          </p>
          <p className="text-xs text-muted-foreground mt-4 font-medium uppercase tracking-wider">
            Supports JPG, PNG (Max 10MB)
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </label>
      ) : (
        <div className="relative border border-border rounded-xl overflow-hidden bg-black/5 flex justify-center items-center h-64">
          <img src={preview} alt="Upload preview" className="max-h-full max-w-full object-contain p-2" />
          <button 
            type="button" 
            onClick={clearFile}
            className="absolute top-3 right-3 bg-background/80 backdrop-blur text-foreground p-1.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
