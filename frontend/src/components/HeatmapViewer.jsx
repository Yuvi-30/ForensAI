import { useState } from 'react'

export default function HeatmapViewer({ originalUrl, gradcamUrl }) {
  const [showOverlay, setShowOverlay] = useState(true)

  return (
    <div className="rounded-lg terminal-border overflow-hidden animate-slide-up space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="font-mono text-xs text-text-secondary tracking-widest">GRAD-CAM HEATMAP</p>
          <p className="font-body text-xs text-muted mt-0.5">Highlights regions that influenced the model's decision</p>
        </div>
        <button
          onClick={() => setShowOverlay(v => !v)}
          className={`px-3 py-1 rounded border font-mono text-xs tracking-wider transition-colors
            ${showOverlay ? 'border-accent/40 text-accent bg-accent/5' : 'border-border text-text-secondary hover:border-accent/30'}`}
        >
          {showOverlay ? 'HEATMAP' : 'ORIGINAL'}
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-bg">
        <img
          src={showOverlay ? gradcamUrl : originalUrl}
          alt={showOverlay ? 'Grad-CAM heatmap' : 'Original image'}
          className="w-full object-contain max-h-72 transition-opacity duration-300"
        />

        {/* Legend */}
        {showOverlay && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-bg/80 backdrop-blur-sm px-3 py-1.5 rounded border border-border">
            <div className="flex gap-0.5">
              {['#00008B','#0000FF','#00FFFF','#FFFF00','#FF8C00','#FF0000'].map(c => (
                <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span className="font-mono text-xs text-text-secondary">LOW → HIGH</span>
          </div>
        )}
      </div>
    </div>
  )
}
