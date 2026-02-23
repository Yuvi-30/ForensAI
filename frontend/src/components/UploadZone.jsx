import { useState, useRef, useCallback } from 'react'

export default function UploadZone({ onUpload, isLoading }) {
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const inputRef = useRef()

  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const handleSubmit = () => {
    if (file) onUpload(file)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => !preview && inputRef.current.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative overflow-hidden rounded-lg terminal-border cursor-pointer
          transition-all duration-300 min-h-64 flex flex-col items-center justify-center
          ${dragging ? 'bg-accent/5 border-accent/50' : 'bg-surface hover:bg-surface/80'}
          ${preview ? 'cursor-default' : ''}
        `}
      >
        {/* Scan line effect */}
        {!preview && <div className="scan-line" />}

        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-80 object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent rounded-lg" />
            <button
              onClick={(e) => { e.stopPropagation(); reset() }}
              className="absolute top-3 right-3 w-7 h-7 rounded bg-bg/80 border border-border text-text-secondary hover:text-danger hover:border-danger/50 text-sm flex items-center justify-center transition-colors"
            >
              ×
            </button>
            <div className="absolute bottom-3 left-3 font-mono text-xs text-text-secondary">
              {file?.name} • {(file?.size / 1024).toFixed(0)} KB
            </div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-4 animate-fade-in">
            {/* Icon */}
            <div className={`mx-auto w-16 h-16 rounded-lg border flex items-center justify-center transition-colors ${dragging ? 'border-accent/60 bg-accent/10' : 'border-border bg-surface'}`}>
              <svg className={`w-7 h-7 ${dragging ? 'text-accent' : 'text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-text-primary">
                {dragging ? 'Drop to analyse' : 'Drop image here'}
              </p>
              <p className="text-text-secondary text-sm mt-1 font-body">
                or <span className="text-accent underline">browse files</span>
              </p>
              <p className="text-muted text-xs mt-3 font-mono">JPEG · PNG · WEBP · max 10 MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* Analyse Button */}
      {preview && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`
            w-full py-3.5 rounded-lg font-display font-semibold tracking-wider text-sm
            transition-all duration-200 relative overflow-hidden
            ${isLoading
              ? 'bg-accent/20 text-accent/50 cursor-not-allowed border border-accent/20'
              : 'bg-accent text-bg hover:bg-accent/90 glow-accent active:scale-[0.98]'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              UPLOADING...
            </span>
          ) : (
            'RUN FORENSIC ANALYSIS →'
          )}
        </button>
      )}
    </div>
  )
}
